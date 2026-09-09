import { NextResponse } from "next/server";
import { cancelBooking, findBookingByReference, isWithinFreeCancellationWindow } from "@/lib/booking/service";
import { canAccessBooking } from "@/lib/booking/access";
import { isValidReference } from "@/lib/booking/reference";
import { toDateOnly } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, ctx: { params: Promise<{ reference: string }> }) {
  const { reference } = await ctx.params;
  if (!isValidReference(reference)) return NextResponse.json({ error: "Invalid reference" }, { status: 400 });
  const booking = await findBookingByReference(reference);
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!(await canAccessBooking(booking))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (booking.status !== "confirmed") return NextResponse.json({ error: "This booking can't be cancelled online." }, { status: 400 });
  if (booking.departDate < toDateOnly(new Date())) return NextResponse.json({ error: "Past bookings can't be cancelled." }, { status: 400 });
  const fullRefund = isWithinFreeCancellationWindow(booking);
  const updated = await cancelBooking(booking.reference);
  return NextResponse.json({ ok: true, status: updated?.status ?? "cancelled", fullRefund });
}
