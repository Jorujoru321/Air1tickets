import "server-only";
import Stripe from "stripe";

let client: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  if (client !== undefined) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  client = key ? new Stripe(key) : null;
  return client;
}

export function stripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

export async function createPaymentIntent(amountUsd: number, metadata: Record<string, string>): Promise<{ id: string; clientSecret: string }> {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe is not configured");
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amountUsd * 100),
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata,
    description: `Air1 Tickets flight booking (${metadata.offerId ?? "offer"})`,
  });
  if (!intent.client_secret) throw new Error("Stripe did not return a client secret");
  return { id: intent.id, clientSecret: intent.client_secret };
}

/** Confirms the intent succeeded and the captured amount matches what we expect. */
export async function verifyPaymentIntent(id: string, expectedUsd: number): Promise<{ ok: boolean; reason?: string }> {
  const stripe = getStripe();
  if (!stripe) return { ok: false, reason: "Stripe is not configured" };
  const intent = await stripe.paymentIntents.retrieve(id);
  if (intent.status !== "succeeded") return { ok: false, reason: `Payment status is ${intent.status}` };
  const expectedCents = Math.round(expectedUsd * 100);
  if (intent.amount_received !== expectedCents) return { ok: false, reason: "Charged amount does not match booking total" };
  return { ok: true };
}
