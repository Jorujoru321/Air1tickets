import { findBookingByReference } from "@/lib/booking/service";
import { canAccessBooking } from "@/lib/booking/access";
import { isValidReference } from "@/lib/booking/reference";
import type { Offer } from "@/lib/flights/types";
import { getAirport } from "@/data/airports";
import { airlineName } from "@/data/airlines";
import { localToUtc } from "@/lib/flights/geo";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

function icsDate(utcMs: number): string {
  return new Date(utcMs).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/** GET /api/bookings/{ref}/calendar → .ics with one event per flight segment. */
export async function GET(_req: Request, ctx: { params: Promise<{ reference: string }> }) {
  const { reference } = await ctx.params;
  if (!isValidReference(reference)) return new Response("Invalid reference", { status: 400 });
  const booking = await findBookingByReference(reference);
  if (!booking) return new Response("Not found", { status: 404 });
  if (!(await canAccessBooking(booking))) return new Response("Forbidden", { status: 403 });

  const offer = booking.offer as Offer;
  const stamp = icsDate(Date.now());
  const events: string[] = [];
  for (const slice of offer.slices) {
    for (const seg of slice.segments) {
      const o = getAirport(seg.origin);
      const d = getAirport(seg.destination);
      if (!o || !d) continue;
      const start = localToUtc(seg.departure, o.tz);
      const end = localToUtc(seg.arrival, d.tz);
      const summary = `Flight ${seg.flightNumber} ${o.iata} → ${d.iata}`;
      const description = [
        `${airlineName(seg.marketingCarrier)} ${seg.flightNumber}`,
        `Air1 reference: ${booking.reference}`,
        booking.airlinePnr ? `Airline confirmation: ${booking.airlinePnr}` : "",
        seg.originTerminal ? `Departs ${o.name} Terminal ${seg.originTerminal}` : `Departs ${o.name}`,
        seg.destinationTerminal ? `Arrives ${d.name} Terminal ${seg.destinationTerminal}` : `Arrives ${d.name}`,
        `Manage booking: ${site.url}/booking/${booking.reference}`,
      ]
        .filter(Boolean)
        .join("\n");
      events.push(
        [
          "BEGIN:VEVENT",
          `UID:${booking.reference}-${seg.id}@air1tickets`,
          `DTSTAMP:${stamp}`,
          `DTSTART:${icsDate(start)}`,
          `DTEND:${icsDate(end)}`,
          `SUMMARY:${esc(summary)}`,
          `LOCATION:${esc(`${o.name} (${o.iata})`)}`,
          `DESCRIPTION:${esc(description)}`,
          "BEGIN:VALARM",
          "TRIGGER:-PT3H",
          "ACTION:DISPLAY",
          `DESCRIPTION:${esc(`Flight ${seg.flightNumber} departs in 3 hours`)}`,
          "END:VALARM",
          "END:VEVENT",
        ].join("\r\n"),
      );
    }
  }
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", `PRODID:-//${site.name}//Bookings//EN`, "CALSCALE:GREGORIAN", "METHOD:PUBLISH", ...events, "END:VCALENDAR"].join("\r\n") + "\r\n";
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="air1-${booking.reference}.ics"`,
      "Cache-Control": "private, no-store",
    },
  });
}
