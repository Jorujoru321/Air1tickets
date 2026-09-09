import { NextResponse } from "next/server";
import { getFlightProvider } from "@/lib/flights/provider";

export const dynamic = "force-dynamic";

/** GET /api/bookings/reprice?offerId=… → fresh offer (or 410 when it's gone). */
export async function GET(req: Request) {
  const offerId = new URL(req.url).searchParams.get("offerId");
  if (!offerId || offerId.length > 2000) return NextResponse.json({ error: "offerId is required" }, { status: 400 });
  const offer = await getFlightProvider().getOffer(offerId);
  if (!offer) return NextResponse.json({ error: "This fare is no longer available." }, { status: 410 });
  return NextResponse.json({ offer }, { headers: { "Cache-Control": "private, no-store" } });
}
