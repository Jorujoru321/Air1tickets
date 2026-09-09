import { AlertTriangle, Moon } from "lucide-react";
import type { Offer, Slice } from "@/lib/flights/types";
import { airlineName } from "@/data/airlines";
import { getAirport } from "@/data/airports";
import { cabinLabel, fareSummaryChips } from "@/lib/flights/format";
import { cn, formatDateShort, formatDuration, formatTime } from "@/lib/utils";
import { AirlineLogo } from "./AirlineLogo";

function airportLine(code: string) {
  const a = getAirport(code);
  return a ? `${a.name} (${a.iata})` : code;
}

export function SliceTimeline({ slice, title }: { slice: Slice; title: string }) {
  return (
    <section aria-label={title}>
      <h4 className="mb-3 flex items-baseline gap-2 text-sm font-bold text-navy-900">
        {title}
        <span className="text-xs font-medium text-slate-500">
          {formatDateShort(slice.departure)} · {formatDuration(slice.durationMinutes)} · {slice.stops === 0 ? "Nonstop" : `${slice.stops} stop${slice.stops > 1 ? "s" : ""}`}
        </span>
      </h4>
      <ol className="space-y-0">
        {slice.segments.map((seg, i) => {
          const layover = slice.layovers[i];
          return (
            <li key={seg.id}>
              <div className="grid grid-cols-[2.25rem_1fr] gap-3">
                <div className="flex flex-col items-center">
                  <span className="mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-navy-900 bg-white" aria-hidden />
                  <span className="w-px flex-1 bg-slate-300" aria-hidden />
                  <span className="mb-1 h-2.5 w-2.5 rounded-full bg-navy-900" aria-hidden />
                </div>
                <div className="pb-4">
                  <p className="text-sm text-navy-900">
                    <span className="font-semibold tabular-nums">{formatTime(seg.departure)}</span> · {airportLine(seg.origin)}
                    {seg.originTerminal && <span className="text-slate-500"> · Terminal {seg.originTerminal}</span>}
                  </p>
                  <div className="my-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <AirlineLogo iata={seg.marketingCarrier} size={18} />
                      <span className="font-medium text-slate-700">{seg.flightNumber}</span> {airlineName(seg.marketingCarrier)}
                    </span>
                    {seg.operatingCarrier !== seg.marketingCarrier && <span>Operated by {airlineName(seg.operatingCarrier)}</span>}
                    <span>{formatDuration(seg.durationMinutes)}</span>
                    {seg.aircraft && <span>{seg.aircraft}</span>}
                    <span>
                      {cabinLabel(seg.cabin)}
                      {seg.bookingClass ? ` (${seg.bookingClass})` : ""}
                    </span>
                  </div>
                  <p className="text-sm text-navy-900">
                    <span className="font-semibold tabular-nums">{formatTime(seg.arrival)}</span>
                    {seg.arrival.slice(0, 10) !== seg.departure.slice(0, 10) && <span className="ml-1 text-xs font-medium text-sunrise-700">({formatDateShort(seg.arrival)})</span>} · {airportLine(seg.destination)}
                    {seg.destinationTerminal && <span className="text-slate-500"> · Terminal {seg.destinationTerminal}</span>}
                  </p>
                </div>
              </div>
              {layover && (
                <div className={cn("mb-4 ml-[2.25rem] flex items-center gap-2 rounded-lg border px-3 py-2 text-xs", layover.overnight || layover.durationMinutes > 240 ? "border-warning-500/40 bg-warning-50 text-warning-700" : "border-slate-200 bg-slate-50 text-slate-600")}>
                  {layover.overnight ? <Moon className="h-3.5 w-3.5" aria-hidden /> : layover.durationMinutes > 240 ? <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> : null}
                  <span>
                    <span className="font-semibold">{formatDuration(layover.durationMinutes)} layover</span> in {getAirport(layover.airport)?.city ?? layover.airport} ({layover.airport})
                    {layover.overnight ? " · Overnight" : layover.durationMinutes > 240 ? " · Long layover" : ""}
                    {layover.airportChange ? " · Airport change" : ""}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function FareChips({ offer, className }: { offer: Offer; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Fare conditions">
      {fareSummaryChips(offer).map((c) => (
        <li key={c.label} className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", c.included ? "bg-success-50 text-success-700" : "bg-slate-100 text-slate-500")}>
          <span aria-hidden>{c.included ? "✓" : "✕"}</span>
          {c.label}
        </li>
      ))}
    </ul>
  );
}

export function ItineraryDetails({ offer }: { offer: Offer }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {offer.slices.map((s, i) => (
        <SliceTimeline key={s.id} slice={s} title={offer.slices.length > 1 ? (i === 0 ? "Outbound" : "Return") : "Itinerary"} />
      ))}
      <div className="lg:col-span-2">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{offer.fare.brand} fare</p>
        <FareChips offer={offer} />
        {offer.emissionsKg && <p className="mt-3 text-xs text-slate-500">Estimated {offer.emissionsKg} kg CO₂ per traveler for this itinerary.</p>}
      </div>
    </div>
  );
}
