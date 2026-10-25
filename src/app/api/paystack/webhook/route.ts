import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const rawBody = await request.text();

  if (secret) {
    const signature = request.headers.get("x-paystack-signature");
    const hash = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
    }
  }

  let event: { event?: string; data?: { reference?: string } } = {};
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.event === "charge.success") {
    const reference = event.data?.reference;
    if (reference) {
      const adminClient = createAdminClient();
      await adminClient
        .from("orders")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("paystack_reference", reference);
    }
  }

  return NextResponse.json({ received: true });
}
