import { NextResponse } from "next/server";
import { z } from "zod";
import { lookupBooking } from "@/lib/booking/service";
import { isValidReference, normalizeReference } from "@/lib/booking/reference";
import { grantBookingAccess } from "@/lib/auth/session";
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit";

const schema = z.object({
  reference: z.string().trim().min(6).max(12),
  lastName: z.string().trim().min(1).max(60),
});

/** POST /api/bookings/lookup { reference, lastName } → grants guest access and returns the reference. */
export async function POST(req: Request) {
  const rl = rateLimit(`lookup:${clientIp(req)}`, { limit: 10, windowMs: 10 * 60_000 });
  if (!rl.ok) return tooMany(rl.retryAfterSec);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter your booking reference and last name." }, { status: 400 });
  const reference = normalizeReference(parsed.data.reference);
  const notFound = NextResponse.json({ error: "We couldn't find a booking with those details. Check the reference on your confirmation email and the last name of the lead passenger." }, { status: 404 });
  if (!isValidReference(reference)) return notFound;
  const booking = await lookupBooking(reference, parsed.data.lastName);
  if (!booking) return notFound;
  await grantBookingAccess(booking.reference);
  return NextResponse.json({ reference: booking.reference });
}
