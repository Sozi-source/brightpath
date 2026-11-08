import { NextResponse, type NextRequest } from "next/server";
import { fulfillOrder, verifyPaystackSignature, getPaystackSecretKey } from "@/lib/paystack";

export async function POST(request: NextRequest) {
  const secret = getPaystackSecretKey();
  if (!secret) {
    console.error("[Paystack Webhook] PAYSTACK_SECRET_KEY is not configured.");
    return NextResponse.json({ error: "Webhook secret missing on server." }, { status: 500 });
  }

  const signature = request.headers.get("x-paystack-signature");
  const rawBody = await request.text();

  if (!verifyPaystackSignature(rawBody, signature)) {
    console.warn("[Paystack Webhook] Signature verification failed.");
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: {
    event?: string;
    data?: {
      reference?: string;
      status?: string;
      amount?: number;
      currency?: string;
      metadata?: Record<string, unknown>;
    };
  } = {};

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    const metadataModuleId = event.data.metadata?.module_id as string | undefined;

    const result = await fulfillOrder({
      reference: event.data.reference,
      paidSubunit: Number(event.data.amount ?? 0),
      currency: String(event.data.currency ?? ""),
      paymentStatus: String(event.data.status ?? ""),
      metadataModuleId,
    });

    if (!result.success && result.status !== "already_processed") {
      console.warn(
        `[Paystack Webhook] Fulfillment warning for ${event.data.reference}:`,
        result.error
      );
    }
  }

  // Acknowledge receipt to Paystack
  return NextResponse.json({ received: true });
}
