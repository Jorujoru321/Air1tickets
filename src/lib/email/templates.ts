import type { Booking } from "@/lib/db/schema";
import type { Offer, PassengerInput } from "@/lib/flights/types";
import { site, absoluteUrl } from "@/lib/site";
import { formatDateLong, formatDuration, formatMoney, formatTime } from "@/lib/utils";
import { getAirport } from "@/data/airports";
import { airlineName } from "@/data/airlines";

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

function airportLine(code: string): string {
  const a = getAirport(code);
  return a ? `${a.city} (${a.iata})` : code;
}

export function bookingConfirmationEmail(booking: Booking): { subject: string; html: string; text: string } {
  const offer = booking.offer as Offer;
  const passengers = booking.passengers as PassengerInput[];
  const manageUrl = absoluteUrl(`/booking/${booking.reference}`);
  const subject = `Your flight is booked — ${airportLine(booking.origin)} to ${airportLine(booking.destination)} (${booking.reference})`;

  const sliceText = offer.slices
    .map((s, i) => {
      const head = `${i === 0 ? "Outbound" : "Return"} · ${formatDateLong(s.departure)}`;
      const segs = s.segments
        .map((seg) => `  ${seg.flightNumber} ${airlineName(seg.marketingCarrier)}: ${airportLine(seg.origin)} ${formatTime(seg.departure)} → ${airportLine(seg.destination)} ${formatTime(seg.arrival)} (${formatDuration(seg.durationMinutes)})`)
        .join("\n");
      return `${head}\n${segs}`;
    })
    .join("\n\n");

  const text = `Hi ${booking.leadFirstName},

Your booking is confirmed. Thank you for flying with ${site.name}.

Air1 reference: ${booking.reference}
Airline confirmation (PNR): ${booking.airlinePnr ?? "pending"}
Airline: ${airlineName(booking.owner)}
Fare: ${offer.fare.brand}

${sliceText}

Passengers:
${passengers.map((p) => `  ${p.firstName} ${p.lastName}`).join("\n")}

Total charged: ${formatMoney(booking.priceTotal, { cents: true })}

Manage your booking: ${manageUrl}
Check in online with the airline 24 hours before departure using the airline confirmation above.

Need help? ${site.supportPhone} · ${site.supportEmail} (24/7)
${site.name} · ${site.address.streetAddress}, ${site.address.addressLocality}, ${site.address.addressRegion} ${site.address.postalCode}`;

  const sliceHtml = offer.slices
    .map((s, i) => {
      const segs = s.segments
        .map(
          (seg) => `<tr>
  <td style="padding:8px 0;border-top:1px solid #e2e8f0;font-size:14px;color:#0b1d3a"><strong>${esc(seg.flightNumber)}</strong> ${esc(airlineName(seg.marketingCarrier))}</td>
  <td style="padding:8px 0;border-top:1px solid #e2e8f0;font-size:14px;color:#334155">${esc(airportLine(seg.origin))} ${formatTime(seg.departure)} → ${esc(airportLine(seg.destination))} ${formatTime(seg.arrival)}</td>
  <td style="padding:8px 0;border-top:1px solid #e2e8f0;font-size:14px;color:#64748b;text-align:right">${formatDuration(seg.durationMinutes)}</td>
</tr>`,
        )
        .join("");
      return `<h3 style="margin:24px 0 8px;font-size:15px;color:#0b1d3a">${i === 0 ? "Outbound" : "Return"} · ${esc(formatDateLong(s.departure))}</h3><table width="100%" cellspacing="0" cellpadding="0">${segs}</table>`;
    })
    .join("");

  const html = `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif">
<table width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:24px 0"><tr><td align="center">
<table width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden">
  <tr><td style="background:#0b1d3a;padding:24px 32px;color:#fff"><div style="font-size:22px;font-weight:700">${esc(site.name)}</div><div style="opacity:.8;font-size:13px;margin-top:4px">Booking confirmation</div></td></tr>
  <tr><td style="padding:32px">
    <p style="margin:0 0 16px;font-size:16px;color:#0b1d3a">Hi ${esc(booking.leadFirstName)}, your flight is booked.</p>
    <table cellspacing="0" cellpadding="0" style="background:#eef2f9;border-radius:12px;width:100%"><tr>
      <td style="padding:16px"><div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.04em">Air1 reference</div><div style="font-size:22px;font-weight:700;color:#0b1d3a;letter-spacing:.06em">${esc(booking.reference)}</div></td>
      <td style="padding:16px"><div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.04em">Airline confirmation</div><div style="font-size:22px;font-weight:700;color:#0b1d3a;letter-spacing:.06em">${esc(booking.airlinePnr ?? "Pending")}</div></td>
    </tr></table>
    ${sliceHtml}
    <h3 style="margin:24px 0 8px;font-size:15px;color:#0b1d3a">Passengers</h3>
    <p style="margin:0;font-size:14px;color:#334155">${passengers.map((p) => esc(`${p.firstName} ${p.lastName}`)).join("<br>")}</p>
    <h3 style="margin:24px 0 8px;font-size:15px;color:#0b1d3a">Payment</h3>
    <p style="margin:0;font-size:14px;color:#334155">Total charged: <strong style="color:#0b1d3a">${formatMoney(booking.priceTotal, { cents: true })}</strong> · Fare: ${esc(offer.fare.brand)}</p>
    <p style="margin:28px 0 0"><a href="${manageUrl}" style="display:inline-block;background:#ff6b35;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:10px">Manage booking</a></p>
    <p style="margin:24px 0 0;font-size:13px;color:#64748b;line-height:1.6">Check in online with the airline 24 hours before departure using the airline confirmation above. Bring a REAL ID or passport to the airport. Questions? Call ${esc(site.supportPhone)} or email ${esc(site.supportEmail)} — we're here 24/7.</p>
  </td></tr>
  <tr><td style="padding:16px 32px;background:#f8fafc;font-size:12px;color:#94a3b8">${esc(site.legalName)} · ${esc(site.address.streetAddress)}, ${esc(site.address.addressLocality)}, ${esc(site.address.addressRegion)} ${esc(site.address.postalCode)}</td></tr>
</table></td></tr></table></body></html>`;

  return { subject, html, text };
}
