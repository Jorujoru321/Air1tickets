"use client";

import * as React from "react";
import Link from "next/link";
import { Briefcase, ChevronDown, Luggage, Moon } from "lucide-react";
import type { Offer, Slice } from "@/lib/flights/types";
import { airlineName } from "@/data/airlines";
import { getAirport } from "@/data/airports";
import { isRedEye, offerCarrierLabel, stopsLabel } from "@/lib/flights/format";
import { cn, formatDateShort, formatDuration, formatMoney, formatTime } from "@/lib/utils";
import { AirlineLogo } from "./AirlineLogo";
import { ItineraryDetails } from "./ItineraryDetails";

function SliceRow({ slice, label }: { slice: Slice; label?: string }) {
  const carriers = Array.from(new Set(slice.segments.map((s) => s.marketingCarrier)));
  const operatedBy = Array.from(new Set(slice.segments.filter((s) => s.operatingCarrier !== s.marketingCarrier).map((s) => s.operatingCarrier)));
  const overnight = slice.layovers.some((l) => l.overnight);
  return (
    <div className="grid grid-cols-[2.5rem_1fr] items-center gap-3 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto]">
      <div className="flex -space-x-2">
        {carriers.slice(0, 2).map((c) => (
          <AirlineLogo key={c} iata={c} size={36} className="ring-2 ring-white" />
        ))}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <p className="text-lg font-bold tabular-nums text-navy-900">
            {formatTime(slice.departure)} <span className="mx-1 text-slate-400">–</span> {formatTime(slice.arrival)}
            {slice.daysOffset > 0 && <sup className="ml-0.5 text-xs font-semibold text-sunrise-700">+{slice.daysOffset}</sup>}
          </p>
          <p className="text-sm text-slate-500">
            {slice.origin} → {slice.destination}
            {label && <span className="ml-2 text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>}
          </p>
        </div>
        <p className="mt-0.5 truncate text-xs text-slate-500">
          {carriers.map(airlineName).join(" + ")}
          {operatedBy.length > 0 && <span> · operated by {operatedBy.map(airlineName).join(", ")}</span>}
          <span className="sm:hidden">
            {" "}
            · {formatDuration(slice.durationMinutes)} · {stopsLabel(slice.stops)}
          </span>
        </p>
      </div>
      <div className="hidden text-right sm:block">
        <p className="text-sm font-semibold tabular-nums text-navy-900">{formatDuration(slice.durationMinutes)}</p>
        <p className={cn("text-xs", slice.stops === 0 ? "font-medium text-success-600" : "text-slate-500")}>
          {stopsLabel(slice.stops)}
          {slice.layovers.length > 0 && <span className="text-slate-400"> · {slice.layovers.map((l) => `${formatDuration(l.durationMinutes)} ${l.airport}`).join(", ")}</span>}
        </p>
        <p className="mt-0.5 flex justify-end gap-2 text-[11px] text-slate-400">
          {isRedEye(slice) && (
            <span className="inline-flex items-center gap-0.5">
              <Moon className="h-3 w-3" aria-hidden /> Red-eye
            </span>
          )}
          {overnight && <span>Overnight layover</span>}
        </p>
      </div>
    </div>
  );
}

const TAG_STYLES: Record<string, { label: string; className: string }> = {
  best: { label: "Best", className: "bg-navy-900 text-white" },
  cheapest: { label: "Cheapest", className: "bg-success-500 text-white" },
  fastest: { label: "Fastest", className: "bg-ocean-600 text-white" },
};

export function OfferCard({ offer, perTraveler, position }: { offer: Offer; perTraveler: number; position: number }) {
  const [open, setOpen] = React.useState(false);
  const detailsId = `offer-details-${offer.slices[0].id}-${position}`;
  const total = offer.price.total;
  const each = total / perTraveler;
  const dest = getAirport(offer.slices[0].destination);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:shadow-card-hover" aria-label={`${offerCarrierLabel(offer)} flight, ${formatMoney(each)} per traveler`}>
      {offer.tags && offer.tags.length > 0 && (
        <div className="flex gap-1.5 px-4 pt-3 sm:px-5">
          {offer.tags.map((t) => (
            <span key={t} className={cn("rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide", TAG_STYLES[t]?.className)}>
              {TAG_STYLES[t]?.label ?? t}
            </span>
          ))}
        </div>
      )}
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_11rem] lg:gap-6">
        <div className="min-w-0 space-y-4 divide-y divide-slate-100 [&>*+*]:pt-4">
          {offer.slices.map((s, i) => (
            <SliceRow key={s.id} slice={s} label={offer.slices.length > 1 ? (i === 0 ? "Outbound" : "Return") : undefined} />
          ))}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="font-medium text-slate-700">{offer.fare.brand}</span>
            <span className={cn("inline-flex items-center gap-1", offer.fare.carryOnIncluded ? "text-success-700" : "text-slate-400 line-through")}>
              <Briefcase className="h-3.5 w-3.5" aria-hidden /> Carry-on
            </span>
            <span className={cn("inline-flex items-center gap-1", offer.fare.checkedBagsIncluded > 0 ? "text-success-700" : "text-slate-400")}>
              <Luggage className="h-3.5 w-3.5" aria-hidden /> {offer.fare.checkedBagsIncluded > 0 ? `${offer.fare.checkedBagsIncluded} checked bag${offer.fare.checkedBagsIncluded > 1 ? "s" : ""}` : `Checked bag ${offer.fare.checkedBagFee ? `from ${formatMoney(offer.fare.checkedBagFee)}` : "extra"}`}
            </span>
            {offer.fare.changeable ? <span>Changes {offer.fare.changeFee ? `${formatMoney(offer.fare.changeFee)} fee` : "free"}</span> : <span>No changes</span>}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4 lg:flex-col lg:items-end lg:justify-center lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="lg:text-right">
            <p className="text-2xl font-extrabold tabular-nums text-navy-900">{formatMoney(each)}</p>
            <p className="text-xs text-slate-500">{perTraveler > 1 ? `per traveler · ${formatMoney(total)} total` : offer.slices.length > 1 ? "round trip per traveler" : "one way per traveler"}</p>
            {offer.seatsRemaining !== undefined && offer.seatsRemaining <= 5 && <p className="mt-1 text-xs font-semibold text-sunrise-700">Only {offer.seatsRemaining} seat{offer.seatsRemaining > 1 ? "s" : ""} left at this price</p>}
          </div>
          <Link
            href={`/book/${encodeURIComponent(offer.id)}`}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-[var(--radius-field)] bg-sunrise-500 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-sunrise-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-500 lg:w-full"
            aria-label={`Select ${offerCarrierLabel(offer)} flight to ${dest?.city ?? offer.slices[0].destination} for ${formatMoney(each)} per traveler`}
          >
            Select
          </Link>
        </div>
      </div>
      <div className="border-t border-slate-100 px-4 sm:px-5">
        <button type="button" aria-expanded={open} aria-controls={detailsId} onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between py-2.5 text-sm font-semibold text-ocean-700 hover:text-ocean-800">
          <span>{open ? "Hide" : "Flight"} details</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden />
        </button>
        {open && (
          <div id={detailsId} className="border-t border-slate-100 py-5">
            <ItineraryDetails offer={offer} />
            <p className="mt-4 text-xs text-slate-400">
              Departs {formatDateShort(offer.slices[0].departure)}
              {offer.slices[1] && ` · Returns ${formatDateShort(offer.slices[1].departure)}`}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
