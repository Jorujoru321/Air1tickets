"use client";

import * as React from "react";
import { ChevronDown, ShieldCheck, Timer } from "lucide-react";
import type { ExtrasInput, Offer } from "@/lib/flights/types";
import { summarizePrice } from "@/lib/booking/pricing";
import { airlineName } from "@/data/airlines";
import { stopsLabel } from "@/lib/flights/format";
import { cn, daysBetween, formatDateShort, formatDuration, formatMoney, formatTime, toDateOnly } from "@/lib/utils";
import { AirlineLogo } from "@/components/results/AirlineLogo";

export function useCountdown(expiresAt: string): { seconds: number; label: string; expired: boolean } {
  const target = React.useMemo(() => new Date(expiresAt).getTime(), [expiresAt]);
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const seconds = Math.max(0, Math.floor((target - now) / 1000));
  const label = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  return { seconds, label, expired: seconds === 0 };
}

export function TripSummary({ offer, extras, className }: { offer: Offer; extras: ExtrasInput; className?: string }) {
  const summary = summarizePrice(offer, extras);
  const [open, setOpen] = React.useState(false);
  const paying = summary.payingPassengers;
  const infants = offer.passengers.infants;
  const departDate = offer.slices[0].departure.slice(0, 10);
  const freeCancel = daysBetween(toDateOnly(new Date()), departDate) >= 7;
  const { label, expired } = useCountdown(offer.expiresAt);

  const details = (
    <>
      <ul className="space-y-3">
        {offer.slices.map((s, i) => (
          <li key={s.id} className="flex gap-3">
            <AirlineLogo iata={s.segments[0].marketingCarrier} size={32} />
            <div className="min-w-0 flex-1 text-sm">
              <p className="flex items-baseline justify-between gap-2">
                <span className="font-semibold text-navy-900">
                  {offer.slices.length > 1 ? (i === 0 ? "Outbound" : "Return") : "Flight"} · {formatDateShort(s.departure)}
                </span>
                <span className="text-xs text-slate-500">{formatDuration(s.durationMinutes)}</span>
              </p>
              <p className="text-slate-600 tabular-nums">
                {formatTime(s.departure)} {s.origin} → {formatTime(s.arrival)} {s.destination}
                {s.daysOffset > 0 && <sup className="ml-0.5 text-[10px] font-semibold text-sunrise-700">+{s.daysOffset}</sup>}
              </p>
              <p className="text-xs text-slate-500">
                {stopsLabel(s.stops)} · {Array.from(new Set(s.segments.map((g) => g.marketingCarrier))).map(airlineName).join(" + ")}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <dl className="mt-5 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
        <div className="flex justify-between text-slate-600">
          <dt>
            {offer.fare.brand} fare × {paying}
            {infants ? ` (+${infants} infant${infants > 1 ? "s" : ""})` : ""}
          </dt>
          <dd className="tabular-nums">{formatMoney(summary.fareBase, { cents: true })}</dd>
        </div>
        <div className="flex justify-between text-slate-600">
          <dt>Taxes &amp; fees</dt>
          <dd className="tabular-nums">{formatMoney(summary.taxes, { cents: true })}</dd>
        </div>
        {summary.extras.map((l) => (
          <div key={l.label} className="flex justify-between text-slate-600">
            <dt>{l.label}</dt>
            <dd className="tabular-nums">{formatMoney(l.amount, { cents: true })}</dd>
          </div>
        ))}
        {summary.serviceFee > 0 && (
          <div className="flex justify-between text-slate-600">
            <dt>Air1 service fee</dt>
            <dd className="tabular-nums">{formatMoney(summary.serviceFee, { cents: true })}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-navy-900">
          <dt>Total (USD)</dt>
          <dd className="tabular-nums">{formatMoney(summary.total, { cents: true })}</dd>
        </div>
      </dl>
      <ul className="mt-4 space-y-1.5 text-xs text-slate-500">
        <li className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-success-600" aria-hidden />
          {freeCancel ? "Free cancellation within 24 hours of booking" : "24-hour free cancellation doesn't apply within 7 days of departure"}
        </li>
        <li className="flex items-center gap-1.5">
          <Timer className={cn("h-3.5 w-3.5", expired ? "text-danger-500" : "text-ocean-600")} aria-hidden />
          {expired ? "Fare hold expired — refresh the price" : `Fare held for ${label}`}
        </li>
      </ul>
    </>
  );

  return (
    <>
      <aside className={cn("hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-card lg:block", className)} aria-label="Trip summary">
        <h2 className="mb-4 text-base font-bold text-navy-900">Your trip</h2>
        {details}
      </aside>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white shadow-float lg:hidden">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-summary" className="flex w-full items-center justify-between px-4 py-3">
          <span className="text-left">
            <span className="block text-xs text-slate-500">Total for {paying + infants} traveler{paying + infants > 1 ? "s" : ""}</span>
            <span className="block text-lg font-extrabold tabular-nums text-navy-900">{formatMoney(summary.total, { cents: true })}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-ocean-700">
            {open ? "Hide" : "View"} details <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden />
          </span>
        </button>
        {open && (
          <div id="mobile-summary" className="max-h-[60vh] overflow-y-auto border-t border-slate-100 px-4 py-4">
            {details}
          </div>
        )}
      </div>
    </>
  );
}
