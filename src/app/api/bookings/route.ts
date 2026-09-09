import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { bookingRequestSchema, expectedPassengerTypes, passengerAgeProblem, passportProblems, passportRequired, toPassengerInput } from "@/components/booking/schemas";
import { getFlightProvider } from "@/lib/flights/provider";
import { isDomesticUS } from "@/data/airports";
import { summarizePrice } from "@/lib/booking/pricing";
import { createBooking } from "@/lib/booking/service";
import { grantBookingAccess } from "@/lib/auth/session";
import { getCurrentUser } from "@/lib/auth/current-user";
import { processDemoPayment } from "@/lib/payments/demo";
import { stripeEnabled, verifyPaymentIntent } from "@/lib/payments/stripe";

export const dynamic = "force-dynamic";

/**
 * POST /api/bookings — capture payment and issue tickets.
 * The server never trusts client-side prices: it re-fetches the offer and
 * recomputes the total before charging.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = bookingRequestSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: `${issue.path.join(".") || "request"}: ${issue.message}`, issues: parsed.error.issues.slice(0, 10) }, { status: 400 });
  }
  const { offerId, passengers, contact, extras, payment } = parsed.data;

  const offer = await getFlightProvider().getOffer(offerId);
  if (!offer) return NextResponse.json({ error: "This fare is no longer available. Please search again.", code: "OFFER_EXPIRED" }, { status: 410 });
  if (new Date(offer.expiresAt).getTime() < Date.now() - 5 * 60_000) {
    return NextResponse.json({ error: "This fare has expired. Please refresh the price.", code: "OFFER_EXPIRED" }, { status: 410 });
  }

  // Passenger mix must match the offer exactly.
  const expected = expectedPassengerTypes(offer);
  const given = passengers.map((p) => p.type);
  if (expected.length !== given.length || expected.some((t, i) => t !== given[i])) {
    return NextResponse.json({ error: "Passenger list does not match the fare (adults, children, infants)." }, { status: 400 });
  }
  const departDate = offer.slices[0].departure.slice(0, 10);
  const lastDate = offer.slices[offer.slices.length - 1].arrival.slice(0, 10);
  const international = passportRequired(offer, isDomesticUS);
  for (const [i, p] of passengers.entries()) {
    const ageProblem = passengerAgeProblem(p, departDate);
    if (ageProblem) return NextResponse.json({ error: `Passenger ${i + 1}: ${ageProblem}` }, { status: 400 });
    if (international) {
      const problems = passportProblems(p, lastDate);
      const first = Object.values(problems)[0];
      if (first) return NextResponse.json({ error: `Passenger ${i + 1}: ${first}` }, { status: 400 });
    }
  }
  if (extras.flexibleTicket && !offer.fare.changeable) {
    return NextResponse.json({ error: "Flexible ticket is not available on this fare." }, { status: 400 });
  }

  const summary = summarizePrice(offer, extras);
  const user = await getCurrentUser();

  let paymentReference: string;
  let paymentProvider: "stripe" | "demo";
  if (payment.provider === "stripe") {
    if (!stripeEnabled()) return NextResponse.json({ error: "Card payments are temporarily unavailable." }, { status: 503 });
    const verified = await verifyPaymentIntent(payment.paymentIntentId, summary.total);
    if (!verified.ok) return NextResponse.json({ error: verified.reason ?? "Payment could not be verified." }, { status: 402 });
    paymentReference = payment.paymentIntentId;
    paymentProvider = "stripe";
  } else {
    if (stripeEnabled()) return NextResponse.json({ error: "Demo payments are disabled when Stripe is configured." }, { status: 400 });
    const result = processDemoPayment({ number: payment.card.number, expMonth: payment.card.expMonth, expYear: payment.card.expYear, cvc: payment.card.cvc, name: payment.card.name }, summary.total);
    if (!result.ok) return NextResponse.json({ error: result.error, code: "CARD_DECLINED" }, { status: 402 });
    paymentReference = result.reference;
    paymentProvider = "demo";
  }

  try {
    const booking = await createBooking({
      offer,
      passengers: passengers.map(toPassengerInput),
      contact: { email: contact.email, phone: contact.phone, newsletter: contact.newsletter },
      extras,
      paymentProvider,
      paymentReference,
      userId: user?.id ?? null,
    });
    await grantBookingAccess(booking.reference);
    return NextResponse.json({ reference: booking.reference, status: booking.status, airlinePnr: booking.airlinePnr, total: booking.priceTotal }, { status: 201 });
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ error: "Invalid booking data." }, { status: 400 });
    console.error("[air1] booking failed", e);
    return NextResponse.json({ error: "We couldn't complete your booking. You have not been charged. Please try again or call us." }, { status: 500 });
  }
}
