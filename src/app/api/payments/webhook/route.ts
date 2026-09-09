import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/payments/stripe";

export const dynamic = "force-dynamic";

/**
 * POST /api/payments/webhook — Stripe events.
 *
 * Bookings are created synchronously in POST /api/bookings after the intent
 * succeeds, so this endpoint mainly provides an audit trail and a hook for
 * disputes/refunds. Configure the endpoint in the Stripe dashboard and set
 * STRIPE_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (e) {
    return NextResponse.json({ error: `Invalid signature: ${(e as Error).message}` }, { status: 400 });
  }
  switch (event.type) {
    case "payment_intent.succeeded":
    case "payment_intent.payment_failed":
    case "charge.refunded":
    case "charge.dispute.created":
      console.log(`[air1] stripe ${event.type}`, (event.data.object as { id: string }).id);
      break;
    default:
      break;
  }
  return NextResponse.json({ received: true });
}
