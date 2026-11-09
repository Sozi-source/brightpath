import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaystackSecretKey, unlockWorkspaceExport } from "@/lib/paystack";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required to purchase." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { projectId, workspaceId } = body;

  if (!projectId && !workspaceId) {
    return NextResponse.json({ error: "Missing projectId or workspaceId." }, { status: 400 });
  }

  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://tvethub.co.ke";
  const siteUrl = rawSiteUrl.replace(/\/+$/, "");
  const email = user.email || `${user.id.slice(0, 8)}@tvethub.ac.ke`;
  const paystackKey = getPaystackSecretKey();

  // CASE 1: Student Workspace KNEC Export Unlock (KES 350 standard fee)
  if (workspaceId) {
    const { data: workspace, error: wsErr } = await supabase
      .from("project_workspaces")
      .select("id, student_id, title, business_plan_specs")
      .eq("id", workspaceId)
      .maybeSingle();

    if (wsErr || !workspace) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }
    if (workspace.student_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized to unlock this workspace." }, { status: 403 });
    }

    const currentSpecs = (workspace.business_plan_specs as Record<string, unknown>) || {};
    if (currentSpecs.export_unlocked) {
      return NextResponse.json({
        alreadyUnlocked: true,
        authorization_url: `${siteUrl}/studio/${workspaceId}?unlocked=true`,
        message: "This workspace is already unlocked.",
      });
    }

    const amountKes = 350;
    const reference = `BP_WS_${workspaceId.replace(/-/g, "").slice(0, 8)}_${Date.now()}`;

    if (!paystackKey) {
      // In development or when Paystack gateway key is pending, enable instant unlock for seamless testing
      if (process.env.NODE_ENV !== "production") {
        await unlockWorkspaceExport(workspaceId, reference);
        return NextResponse.json({
          authorization_url: `${siteUrl}/studio/${workspaceId}?unlocked=true&dev=true`,
          reference,
          amountKes,
        });
      }
      return NextResponse.json(
        {
          error: "Payment gateway is not configured yet. Please configure PAYSTACK_SECRET_KEY in server settings.",
          reference,
          amountKes,
        },
        { status: 503 }
      );
    }

    // Call Paystack API
    const paystackPayload: Record<string, unknown> = {
      email,
      amount: Math.round(amountKes * 100), // in kobo/cents (35,000 cents = KES 350)
      currency: "KES",
      reference,
      callback_url: `${siteUrl}/studio/${workspaceId}?reference=${reference}&unlocked=true`,
      metadata: {
        type: "workspace_export_unlock",
        workspace_id: workspaceId,
        student_id: user.id,
      },
    };

    try {
      const res = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paystackPayload),
      });

      const data = await res.json();
      if (!data.status) {
        console.error("[Paystack API Failure]", data);
        return NextResponse.json(
          { error: data.message || "Paystack initialization failed." },
          { status: 502 }
        );
      }

      return NextResponse.json({
        authorization_url: data.data.authorization_url,
        reference,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Paystack service unavailable";
      return NextResponse.json({ error: errorMsg }, { status: 502 });
    }
  }

  // CASE 2: Marketplace Project Purchase
  // Fetch project details
  const { data: project, error: projErr } = await supabase
    .from("projects")
    .select("id, title, price_kes, trainer_id, status, material_type")
    .eq("id", projectId)
    .single();

  if (projErr || !project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }
  if (project.status !== "published") {
    return NextResponse.json({ error: "This project is not available for purchase." }, { status: 404 });
  }
  if (project.trainer_id === user.id) {
    return NextResponse.json({ error: "You cannot purchase your own listing." }, { status: 400 });
  }

  // Fetch trainer subaccount code & platform commission
  const adminClient = createAdminClient();
  const [{ data: trainerProfile }, { data: settings }] = await Promise.all([
    adminClient
      .from("trainer_profiles")
      .select("paystack_subaccount_code")
      .eq("user_id", project.trainer_id)
      .maybeSingle(),
    adminClient.from("platform_settings").select("commission_percent").eq("id", 1).single(),
  ]);

  const isBusinessPlan = project.material_type === "business_plan";
  const commissionPercent = Number(settings?.commission_percent ?? 20);
  const amountKes = Number(project.price_kes);

  // Under Option A: Business plans are 100% platform property. Platform retains 100% of revenue.
  const commissionKes = isBusinessPlan
    ? amountKes
    : Math.round((amountKes * (commissionPercent / 100)) * 100) / 100;
  const trainerShareKes = isBusinessPlan
    ? 0
    : Math.round((amountKes - commissionKes) * 100) / 100;

  const reference = `BP_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // Record pending order
  const { error: orderErr } = await adminClient.from("orders").insert({
    student_id: user.id,
    project_id: project.id,
    trainer_id: project.trainer_id,
    amount_kes: amountKes,
    commission_kes: commissionKes,
    trainer_share_kes: trainerShareKes,
    paystack_reference: reference,
    status: "pending",
  });

  if (orderErr) {
    return NextResponse.json({ error: "Failed to initialize order." }, { status: 500 });
  }

  // If resource is free (KES 0), fulfill immediately
  if (amountKes <= 0) {
    await adminClient
      .from("orders")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("paystack_reference", reference);

    return NextResponse.json({
      authorization_url: `${siteUrl}/library`,
      reference,
      amountKes: 0,
    });
  }

  if (!paystackKey) {
    console.error("[Paystack Init] Missing PAYSTACK_SECRET_KEY in server environment.");
    return NextResponse.json(
      {
        error: "Payment gateway is not configured yet. Please configure PAYSTACK_SECRET_KEY in server settings.",
        reference,
        amountKes,
      },
      { status: 503 }
    );
  }

  // Call Paystack API
  const paystackPayload: Record<string, unknown> = {
    email,
    amount: Math.round(amountKes * 100), // in kobo/cents
    currency: "KES",
    reference,
    callback_url: `${siteUrl}/library`,
  };

  // Only route subaccount payouts for non-business-plan materials (trainer-owned resources)
  if (!isBusinessPlan && trainerProfile?.paystack_subaccount_code) {
    paystackPayload.subaccount = trainerProfile.paystack_subaccount_code;
    paystackPayload.transaction_charge = Math.round(commissionKes * 100);
  }

  try {
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paystackPayload),
    });

    const data = await res.json();
    if (!data.status) {
      console.error("[Paystack API Failure]", data);
      return NextResponse.json(
        { error: data.message || "Paystack initialization failed." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Paystack service unavailable";
    return NextResponse.json({ error: errorMsg }, { status: 502 });
  }
}
