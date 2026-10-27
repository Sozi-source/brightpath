import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";

interface PaystackWebhookPayload {
  event?: string;
  data?: {
    reference?: string;
    amount?: number;
    currency?: string;
    metadata?: Record<string, unknown>;
  };
}

export async function POST(request: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();

  // Fail-closed: Never process webhook payloads if the signing secret is unconfigured
  if (!secret) {
    return NextResponse.json(
      { error: "Payment webhook verification secret is not configured." },
      { status: 503 }
    );
  }

  const signature = request.headers.get("x-paystack-signature")?.trim();
  if (!signature) {
    return NextResponse.json(
      { error: "Missing x-paystack-signature header." },
      { status: 401 }
    );
  }

  const rawBody = await request.text();
  const computedHash = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  const expectedBuf = Buffer.from(computedHash, "utf8");
  const receivedBuf = Buffer.from(signature, "utf8");

  if (
    expectedBuf.length !== receivedBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, receivedBuf)
  ) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let payload: PaystackWebhookPayload = {};
  try {
    payload = JSON.parse(rawBody) as PaystackWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (payload.event === "charge.success") {
    const reference = payload.data?.reference?.trim();
    if (!reference) {
      return NextResponse.json({ error: "Missing transaction reference." }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // 1. Fetch existing order to enforce idempotency and amount verification
    const { data: existingOrder, error: fetchErr } = await adminClient
      .from("orders")
      .select("id, student_id, project_id, amount_kes, status")
      .eq("paystack_reference", reference)
      .maybeSingle();

    if (fetchErr) {
      return NextResponse.json({ error: "Database lookup failed." }, { status: 500 });
    }

    if (!existingOrder) {
      return NextResponse.json({ received: true, ignored: "order_not_found" });
    }

    // Idempotent guard: already processed
    if (existingOrder.status === "paid") {
      return NextResponse.json({ received: true, idempotent: true });
    }

    // Verify paid amount (in kobo/cents) matches expected order amount
    const expectedSubunits = Math.round(Number(existingOrder.amount_kes) * 100);
    if (
      typeof payload.data?.amount === "number" &&
      payload.data.amount < expectedSubunits
    ) {
      await adminClient
        .from("orders")
        .update({ status: "failed" })
        .eq("id", existingOrder.id);

      return NextResponse.json(
        { error: "Amount mismatch against order total." },
        { status: 400 }
      );
    }

    // 2. Atomically transition order from pending -> paid
    const { data: updatedOrder, error: updateErr } = await adminClient
      .from("orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", existingOrder.id)
      .neq("status", "paid")
      .select("student_id, project_id")
      .maybeSingle();

    if (updateErr) {
      return NextResponse.json({ error: "Failed to update order status." }, { status: 500 });
    }

    // 3. Grant module access if metadata specifies a curriculum module
    const metadataModuleId =
      typeof payload.data?.metadata?.module_id === "string"
        ? payload.data.metadata.module_id
        : undefined;

    if (updatedOrder?.student_id && metadataModuleId) {
      await adminClient.from("module_access").upsert({
        user_id: updatedOrder.student_id,
        module_id: metadataModuleId,
        granted_by: "purchase",
      });
    }
  }

  return NextResponse.json({ received: true });
}
