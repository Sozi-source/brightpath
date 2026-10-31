import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
  const projectId = body.projectId;

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId." }, { status: 400 });
  }

  // Fetch project details
  const { data: project, error: projErr } = await supabase
    .from("projects")
    .select("id, title, price_kes, trainer_id, status")
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

  const commissionPercent = Number(settings?.commission_percent ?? 20);
  const amountKes = Number(project.price_kes);
  const commissionKes = Math.round((amountKes * (commissionPercent / 100)) * 100) / 100;
  const trainerShareKes = Math.round((amountKes - commissionKes) * 100) / 100;

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

  const paystackKey = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackKey) {
    return NextResponse.json({
      message: "Order initiated. Paystack secret key not configured in environment.",
      reference,
      amountKes,
      testMode: true,
    });
  }

  // Call Paystack API
  const paystackPayload: Record<string, unknown> = {
    email: user.email,
    amount: Math.round(amountKes * 100), // in kobo/cents
    currency: "KES",
    reference,
    callback_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/library`,
  };

  if (trainerProfile?.paystack_subaccount_code) {
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
      return NextResponse.json({ error: data.message || "Paystack error" }, { status: 502 });
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
