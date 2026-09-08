import "server-only";
import { and, desc, eq, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb, schema } from "@/lib/db/client";
import type { Booking } from "@/lib/db/schema";
import type { ContactInput, ExtrasInput, Offer, PassengerInput } from "@/lib/flights/types";
import { getFlightProvider } from "@/lib/flights/provider";
import { generateBookingReference, normalizeReference } from "./reference";
import { summarizePrice } from "./pricing";
import { sendBookingConfirmation } from "@/lib/email/send";

export interface CreateBookingInput {
  offer: Offer;
  passengers: PassengerInput[];
  contact: ContactInput;
  extras: ExtrasInput;
  paymentProvider: "stripe" | "demo";
  paymentReference: string;
  userId?: string | null;
}

export class BookingError extends Error {
  constructor(
    message: string,
    public readonly code: "OFFER_EXPIRED" | "PRICE_CHANGED" | "PROVIDER_FAILED" | "DUPLICATE" | "INVALID",
  ) {
    super(message);
  }
}

async function uniqueReference(): Promise<string> {
  const db = await getDb();
  for (let i = 0; i < 10; i++) {
    const ref = generateBookingReference();
    const hit = await db.select({ id: schema.bookings.id }).from(schema.bookings).where(eq(schema.bookings.reference, ref)).limit(1);
    if (!hit.length) return ref;
  }
  throw new Error("Could not allocate a booking reference");
}

/**
 * Persist a booking, issue tickets with the provider, and send the confirmation.
 * Payment must already be captured (paymentReference) before calling this.
 */
export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const db = await getDb();
  const existing = await db.select().from(schema.bookings).where(eq(schema.bookings.paymentReference, input.paymentReference)).limit(1);
  if (existing[0]) return existing[0]; // idempotent on payment reference

  const { offer, passengers, contact, extras } = input;
  const summary = summarizePrice(offer, extras);
  const lead = passengers[0];
  const reference = await uniqueReference();
  const id = `bkg_${nanoid(16)}`;
  const first = offer.slices[0];
  const last = offer.slices[offer.slices.length - 1];

  await db.insert(schema.bookings).values({
    id,
    reference,
    userId: input.userId ?? null,
    status: "pending",
    provider: offer.provider,
    contactEmail: contact.email.trim().toLowerCase(),
    contactPhone: contact.phone.trim(),
    leadLastName: lead.lastName.trim().toLowerCase(),
    leadFirstName: lead.firstName.trim(),
    origin: first.origin,
    destination: first.destination,
    departDate: first.departure.slice(0, 10),
    returnDate: offer.slices.length > 1 ? last.departure.slice(0, 10) : null,
    cabin: offer.cabin,
    owner: offer.owner,
    passengerCount: passengers.length,
    offer,
    passengers,
    extras,
    priceBase: summary.fareBase,
    priceTaxes: summary.taxes,
    priceExtras: summary.extrasTotal,
    serviceFee: summary.serviceFee,
    priceTotal: summary.total,
    paymentProvider: input.paymentProvider,
    paymentReference: input.paymentReference,
  });

  const provider = getFlightProvider();
  const result = await provider.createOrder({
    offer,
    passengers,
    contact,
    extras,
    bookingReference: reference,
    paymentReference: input.paymentReference,
    totalCharged: summary.total,
  });

  await db
    .update(schema.bookings)
    .set({
      status: result.status === "confirmed" ? "confirmed" : result.status === "pending" ? "pending" : "failed",
      providerOrderId: result.providerOrderId || null,
      airlinePnr: result.airlinePnr || null,
      ticketNumbers: result.ticketNumbers,
      failureReason: result.failureReason ?? null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(schema.bookings.id, id));

  const booking = (await db.select().from(schema.bookings).where(eq(schema.bookings.id, id)).limit(1))[0];
  if (booking.status === "confirmed") {
    sendBookingConfirmation(booking).catch((e) => console.error("[air1] confirmation email failed", e));
  }
  return booking;
}

export async function findBookingByReference(reference: string): Promise<Booking | null> {
  const db = await getDb();
  const rows = await db.select().from(schema.bookings).where(eq(schema.bookings.reference, normalizeReference(reference))).limit(1);
  return rows[0] ?? null;
}

/** Guest lookup: reference + lead passenger last name (case-insensitive). */
export async function lookupBooking(reference: string, lastName: string): Promise<Booking | null> {
  const booking = await findBookingByReference(reference);
  if (!booking) return null;
  return booking.leadLastName === lastName.trim().toLowerCase() ? booking : null;
}

export async function listBookingsForUser(userId: string, email: string): Promise<Booking[]> {
  const db = await getDb();
  return db
    .select()
    .from(schema.bookings)
    .where(or(eq(schema.bookings.userId, userId), eq(schema.bookings.contactEmail, email.toLowerCase())))
    .orderBy(desc(schema.bookings.createdAt));
}

export async function cancelBooking(reference: string): Promise<Booking | null> {
  const db = await getDb();
  const booking = await findBookingByReference(reference);
  if (!booking || booking.status !== "confirmed") return booking;
  const provider = getFlightProvider();
  if (booking.providerOrderId && provider.cancelOrder) {
    try {
      await provider.cancelOrder(booking.providerOrderId);
    } catch (e) {
      console.error("[air1] provider cancellation failed", e);
    }
  }
  await db
    .update(schema.bookings)
    .set({ status: "cancelled", cancelledAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .where(and(eq(schema.bookings.id, booking.id), eq(schema.bookings.status, "confirmed")));
  return findBookingByReference(reference);
}

/** Booked within the last 24 hours and departing 7+ days out → free cancellation (US DOT rule as applied by Air1). */
export function isWithinFreeCancellationWindow(booking: Booking, now = new Date()): boolean {
  const created = new Date(booking.createdAt).getTime();
  const depart = new Date(`${booking.departDate}T00:00:00Z`).getTime();
  return now.getTime() - created <= 24 * 3600_000 && depart - created >= 7 * 86_400_000;
}
