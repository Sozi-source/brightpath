import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export function getPaystackSecretKey(): string {
  const rawKey =
    process.env.PAYSTACK_SECRET_KEY ||
    process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY ||
    process.env.PAYSTACK_SECRET ||
    process.env.PAYSTACK_KEY;

  return (rawKey || "").trim().replace(/^["']|["']$/g, "");
}

export function verifyPaystackSignature(rawBody: string, signature: string | null): boolean {
  const secret = getPaystackSecretKey();
  if (!secret || !signature) {
    return false;
  }

  const hash = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  const hashBuf = Buffer.from(hash, "utf-8");
  const sigBuf = Buffer.from(signature, "utf-8");

  if (hashBuf.length !== sigBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(hashBuf, sigBuf);
}

export interface FulfillmentResult {
  success: boolean;
  orderId?: string;
  status: "paid" | "failed" | "already_processed" | "not_found";
  error?: string;
}

/**
 * Fulfill an order when verified via Paystack webhook or direct redirect verification.
 * Strictly verifies amount and currency, ensuring idempotent status transitions.
 */
export async function fulfillOrder({
  reference,
  paidSubunit,
  currency,
  paymentStatus,
  metadataModuleId,
  metadata,
}: {
  reference: string;
  paidSubunit: number;
  currency: string;
  paymentStatus: string;
  metadataModuleId?: string;
  metadata?: Record<string, unknown>;
}): Promise<FulfillmentResult> {
  const adminClient = createAdminClient();

  const { data: order, error: orderErr } = await adminClient
    .from("orders")
    .select("id, status, amount_kes, student_id, project_id")
    .eq("paystack_reference", reference)
    .maybeSingle();

  if (orderErr) {
    return { success: false, status: "not_found", error: orderErr.message };
  }

  if (!order) {
    // Only post a new order row when payment is strictly completed and verified
    if (paymentStatus.toLowerCase() !== "success") {
      return { success: false, status: "failed", error: `Paystack status was ${paymentStatus}` };
    }
    if (currency.toUpperCase() !== "KES") {
      return { success: false, status: "failed", error: `Currency mismatch: expected KES, got ${currency}` };
    }

    const projectId = typeof metadata?.project_id === "string" ? metadata.project_id : "";
    const studentId = typeof metadata?.student_id === "string" ? metadata.student_id : "";
    if (!projectId || !studentId) {
      return { success: false, status: "not_found", error: "Order not found" };
    }

    const [{ data: project }, { data: settings }] = await Promise.all([
      adminClient
        .from("projects")
        .select("id, price_kes, trainer_id, material_type")
        .eq("id", projectId)
        .maybeSingle(),
      adminClient.from("platform_settings").select("commission_percent").eq("id", 1).maybeSingle(),
    ]);

    if (!project) {
      return { success: false, status: "not_found", error: "Project not found" };
    }

    const amountKes = Number(project.price_kes);
    const expectedSubunit = Math.round(amountKes * 100);
    if (paidSubunit < expectedSubunit) {
      return {
        success: false,
        status: "failed",
        error: `Underpaid: expected ${expectedSubunit} subunits, received ${paidSubunit}`,
      };
    }

    // 100% of marketplace revenue goes to the admin/platform (no author split).
    const commissionKes = amountKes;
    const trainerShareKes = 0;

    const { data: insertedOrder, error: insertErr } = await adminClient
      .from("orders")
      .insert({
        student_id: studentId,
        project_id: project.id,
        trainer_id: project.trainer_id,
        amount_kes: amountKes,
        commission_kes: commissionKes,
        trainer_share_kes: trainerShareKes,
        paystack_reference: reference,
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertErr || !insertedOrder) {
      return { success: false, status: "failed", error: insertErr?.message || "Failed to record paid order" };
    }

    if (metadataModuleId) {
      await adminClient.from("module_access").upsert({
        user_id: studentId,
        module_id: metadataModuleId,
        granted_by: "purchase",
      });
    }

    return { success: true, orderId: insertedOrder.id, status: "paid" };
  }

  // Idempotency: if already paid, return early without repeating side effects
  if (order.status === "paid") {
    return { success: true, orderId: order.id, status: "already_processed" };
  }

  // Verify payment status from Paystack
  if (paymentStatus.toLowerCase() !== "success") {
    await adminClient
      .from("orders")
      .update({ status: "failed" })
      .eq("id", order.id);
    return { success: false, orderId: order.id, status: "failed", error: `Paystack status was ${paymentStatus}` };
  }

  // Verify currency is strictly KES
  if (currency.toUpperCase() !== "KES") {
    await adminClient
      .from("orders")
      .update({ status: "failed" })
      .eq("id", order.id);
    return { success: false, orderId: order.id, status: "failed", error: `Currency mismatch: expected KES, got ${currency}` };
  }

  // Verify amount matches expected subunit (KES * 100)
  const expectedSubunit = Math.round(Number(order.amount_kes) * 100);
  if (paidSubunit < expectedSubunit) {
    await adminClient
      .from("orders")
      .update({ status: "failed" })
      .eq("id", order.id);
    return {
      success: false,
      orderId: order.id,
      status: "failed",
      error: `Underpaid: expected ${expectedSubunit} subunits, received ${paidSubunit}`,
    };
  }

  // Mark order paid
  const { error: updateErr } = await adminClient
    .from("orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (updateErr) {
    return { success: false, orderId: order.id, status: "failed", error: updateErr.message };
  }

  // Grant module access if applicable
  if (order.student_id && metadataModuleId) {
    await adminClient.from("module_access").upsert({
      user_id: order.student_id,
      module_id: metadataModuleId,
      granted_by: "purchase",
    });
  }

  return { success: true, orderId: order.id, status: "paid" };
}

/**
 * Direct server-to-server verification with Paystack API.
 * Used as fallback on the /library redirect page when webhook hasn't arrived yet.
 */
export async function verifyTransactionWithPaystack(reference: string): Promise<FulfillmentResult> {
  const secret = getPaystackSecretKey();
  if (!secret) {
    return { success: false, status: "failed", error: "Paystack secret key not configured" };
  }

  try {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const json = await res.json();
    if (!json.status || !json.data) {
      return { success: false, status: "failed", error: json.message || "Paystack verification failed" };
    }

    const data = json.data;
    const metadataModuleId = data.metadata?.module_id as string | undefined;

    return await fulfillOrder({
      reference,
      paidSubunit: Number(data.amount ?? 0),
      currency: String(data.currency ?? "KES"),
      paymentStatus: String(data.status ?? ""),
      metadataModuleId,
      metadata: (data.metadata as Record<string, unknown> | undefined) || undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to verify transaction";
    return { success: false, status: "failed", error: message };
  }
}

/**
 * Permanently unlock document export (Word .docx and PDF) for a student's business plan workspace.
 */
export async function unlockWorkspaceExport(
  workspaceId: string,
  reference?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminClient = createAdminClient();
    const { data: ws, error: wsErr } = await adminClient
      .from("project_workspaces")
      .select("id, business_plan_specs")
      .eq("id", workspaceId)
      .maybeSingle();

    if (wsErr || !ws) {
      return { success: false, error: "Workspace not found" };
    }

    const currentSpecs = (ws.business_plan_specs as Record<string, unknown>) || {};
    const updatedSpecs = {
      ...currentSpecs,
      export_unlocked: true,
      unlocked_at: new Date().toISOString(),
      unlock_paystack_reference: reference || currentSpecs.unlock_paystack_reference || null,
      unlock_amount_kes: 350,
    };

    const { error: updateErr } = await adminClient
      .from("project_workspaces")
      .update({ business_plan_specs: updatedSpecs })
      .eq("id", workspaceId);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to unlock workspace",
    };
  }
}

/**
 * Server-to-server verification for workspace export unlock redirect.
 */
export async function verifyWorkspaceUnlockWithPaystack(
  reference: string,
  workspaceId: string
): Promise<{ success: boolean; error?: string }> {
  const secret = getPaystackSecretKey();
  if (!secret) {
    // In local development or testing without live Paystack key, unlock gracefully
    if (process.env.NODE_ENV !== "production") {
      return await unlockWorkspaceExport(workspaceId, reference);
    }
    return { success: false, error: "Paystack secret key not configured" };
  }

  try {
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const json = await res.json();
    if (!json.status || !json.data) {
      return { success: false, error: json.message || "Paystack verification failed" };
    }

    const data = json.data;
    if (String(data.status).toLowerCase() !== "success") {
      return { success: false, error: `Paystack status was ${data.status}` };
    }

    const metaWorkspaceId = data.metadata?.workspace_id;
    if (metaWorkspaceId && metaWorkspaceId !== workspaceId) {
      return { success: false, error: "Transaction does not match this workspace" };
    }

    return await unlockWorkspaceExport(workspaceId, reference);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to verify transaction",
    };
  }
}
