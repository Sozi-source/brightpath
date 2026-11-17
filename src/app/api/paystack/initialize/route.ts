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
  const { projectId, projectIds, workspaceId } = body as {
    projectId?: string;
    projectIds?: string[];
    workspaceId?: string;
  };

  const normalizedIds = Array.from(
    new Set(
      [
        ...(Array.isArray(projectIds) ? projectIds : []),
        ...(typeof projectId === "string" && projectId ? [projectId] : []),
      ].filter((id): id is string => typeof id === "string" && id.trim().length > 0)
    )
  );

  if (normalizedIds.length === 0 && !workspaceId) {
    return NextResponse.json({ error: "Missing projectId, projectIds, or workspaceId." }, { status: 400 });
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
        access_code: data.data.access_code,
        reference,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Paystack service unavailable";
      return NextResponse.json({ error: errorMsg }, { status: 502 });
    }
  }

  // CASE 2: Store Single or Multi-Item Cart Purchase
  const { data: projects, error: projErr } = await supabase
    .from("projects")
    .select("id, title, price_kes, trainer_id, status, material_type")
    .in("id", normalizedIds);

  if (projErr || !projects || projects.length === 0) {
    return NextResponse.json({ error: "Selected items were not found." }, { status: 404 });
  }

  const publishedProjects = projects.filter((p) => p.status === "published");
  if (publishedProjects.length === 0) {
    return NextResponse.json({ error: "Selected items are not available for purchase." }, { status: 404 });
  }

  const adminClient = createAdminClient();
  const { data: existingPaid } = await adminClient
    .from("orders")
    .select("project_id")
    .eq("student_id", user.id)
    .eq("status", "paid")
    .in("project_id", publishedProjects.map((p) => p.id));

  const ownedSet = new Set((existingPaid || []).map((row) => row.project_id));
  const purchasable = publishedProjects.filter(
    (p) => p.trainer_id !== user.id && !ownedSet.has(p.id)
  );

  if (purchasable.length === 0) {
    return NextResponse.json(
      { error: "All selected items are already in your library or belong to your account." },
      { status: 400 }
    );
  }

  const amountKes = purchasable.reduce((sum, p) => sum + Number(p.price_kes || 0), 0);
  const reference = `BP_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // If all selected resources are free (KES 0), post completed orders immediately
  if (amountKes <= 0) {
    const nowIso = new Date().toISOString();
    const { error: orderErr } = await adminClient.from("orders").insert(
      purchasable.map((p, idx) => ({
        student_id: user.id,
        project_id: p.id,
        trainer_id: p.trainer_id,
        amount_kes: 0,
        commission_kes: 0,
        trainer_share_kes: 0,
        paystack_reference: idx === 0 ? reference : `${reference}_${idx + 1}`,
        status: "paid",
        paid_at: nowIso,
      }))
    );

    if (orderErr) {
      return NextResponse.json({ error: "Failed to record order." }, { status: 500 });
    }

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

  // Call Paystack API (100% admin/platform payout; no subaccount split)
  const paystackPayload: Record<string, unknown> = {
    email,
    amount: Math.round(amountKes * 100), // in kobo/cents
    currency: "KES",
    reference,
    callback_url: `${siteUrl}/library`,
    metadata: {
      type: purchasable.length > 1 ? "cart_purchase" : "project_purchase",
      project_id: purchasable[0].id,
      project_ids: purchasable.map((p) => p.id),
      student_id: user.id,
      trainer_id: purchasable[0].trainer_id,
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
      access_code: data.data.access_code,
      reference,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Paystack service unavailable";
    return NextResponse.json({ error: errorMsg }, { status: 502 });
  }
}
