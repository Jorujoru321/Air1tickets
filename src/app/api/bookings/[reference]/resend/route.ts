import { NextResponse } from "next/server";
import { findBookingByReference } from "@/lib/booking/service";
import { canAccessBooking } from "@/lib/booking/access";
import { isValidReference } from "@/lib/booking/reference";
import { sendBookingConfirmation } from "@/lib/email/send";
import { rateLimit, tooMany } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, ctx: { params: Promise<{ reference: string }> }) {
  const { reference } = await ctx.params;
  if (!isValidReference(reference)) return NextResponse.json({ error: "Invalid reference" }, { status: 400 });
  const booking = await findBookingByReference(reference);
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!(await canAccessBooking(booking))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (booking.status !== "confirmed") return NextResponse.json({ error: "Only confirmed bookings have a confirmation to resend." }, { status: 400 });
  const rl = rateLimit(`resend:${booking.reference}`, { limit: 3, windowMs: 60 * 60_000 });
  if (!rl.ok) return tooMany(rl.retryAfterSec);
  try {
    await sendBookingConfirmation(booking);
    return NextResponse.json({ ok: true, email: booking.contactEmail });
  } catch (e) {
    console.error("[air1] resend failed", e);
    return NextResponse.json({ error: "We couldn't send the email right now. Please try again shortly." }, { status: 502 });
  }
}
