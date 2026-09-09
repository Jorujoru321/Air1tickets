import { NextResponse } from "next/server";
import { findBookingByReference } from "@/lib/booking/service";
import { canAccessBooking } from "@/lib/booking/access";
import { isValidReference } from "@/lib/booking/reference";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ reference: string }> }) {
  const { reference } = await ctx.params;
  if (!isValidReference(reference)) return NextResponse.json({ error: "Invalid reference" }, { status: 400 });
  const booking = await findBookingByReference(reference);
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!(await canAccessBooking(booking))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({ reference: booking.reference, status: booking.status, airlinePnr: booking.airlinePnr, failureReason: booking.failureReason }, { headers: { "Cache-Control": "private, no-store" } });
}
