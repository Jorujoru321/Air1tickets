import { NextResponse } from "next/server";
import { z } from "zod";
import { extrasSchema } from "@/components/booking/schemas";
import { getFlightProvider } from "@/lib/flights/provider";
import { summarizePrice } from "@/lib/booking/pricing";
import { createPaymentIntent, stripeEnabled } from "@/lib/payments/stripe";

export const dynamic = "force-dynamic";

const schema = z.object({ offerId: z.string().min(3).max(2000), extras: extrasSchema });

/** POST /api/payments/intent — creates a Stripe PaymentIntent for the server-computed total. */
export async function POST(req: Request) {
  if (!stripeEnabled()) return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const offer = await getFlightProvider().getOffer(parsed.data.offerId);
  if (!offer) return NextResponse.json({ error: "This fare is no longer available." }, { status: 410 });
  const summary = summarizePrice(offer, parsed.data.extras);
  try {
    const intent = await createPaymentIntent(summary.total, {
      offerId: offer.id.slice(0, 480),
      owner: offer.owner,
      route: `${offer.slices[0].origin}-${offer.slices[0].destination}`,
    });
    return NextResponse.json({ clientSecret: intent.clientSecret, paymentIntentId: intent.id, amount: summary.total });
  } catch (e) {
    console.error("[air1] stripe intent failed", e);
    return NextResponse.json({ error: "We couldn't start the payment. Please try again." }, { status: 502 });
  }
}
