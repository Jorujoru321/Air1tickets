"use client";

import * as React from "react";
import type { Offer } from "@/lib/flights/types";
import { airlineName } from "@/data/airlines";
import { DEPARTURE_BUCKETS, departureBucket, totalDuration } from "@/lib/flights/format";
import { cn, formatDuration, formatMoney } from "@/lib/utils";
import { AirlineLogo } from "./AirlineLogo";
import { EMPTY_FILTERS, matchesFilters, maxStops, type FilterState } from "./offer-utils";

interface FiltersProps {
  offers: Offer[];
  filters: FilterState;
  onChange: (f: FilterState) => void;
  perTraveler: number;
  roundTrip: boolean;
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <fieldset className="border-t border-slate-100 py-4 first:border-t-0 first:pt-0">
      <legend className="float-left mb-3 flex w-full items-center justify-between text-sm font-bold text-navy-900">
        <span>{title}</span>
        {action}
      </legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

function CheckRow({ label, sub, checked, onChange, count, price, logo, onOnly }: { label: string; sub?: string; checked: boolean; onChange: (c: boolean) => void; count?: number; price?: number; logo?: React.ReactNode; onOnly?: () => void }) {
  return (
    <div className="group flex items-center gap-2.5 py-1">
      <label className={cn("flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-sm", count === 0 && "opacity-40")}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 shrink-0 rounded border-slate-300 accent-ocean-600" disabled={count === 0} />
        {logo}
        <span className="min-w-0 flex-1 truncate text-slate-700">
          {label}
          {sub && <span className="ml-1 text-xs text-slate-500">{sub}</span>}
        </span>
        {price !== undefined && <span className="shrink-0 text-xs tabular-nums text-slate-500">{formatMoney(price)}</span>}
      </label>
      {onOnly && count !== 0 && (
        <button type="button" onClick={onOnly} className="invisible shrink-0 text-xs font-semibold text-ocean-700 hover:underline group-hover:visible focus:visible">
          Only
        </button>
      )}
    </div>
  );
}

export function Filters({ offers, filters, onChange, perTraveler, roundTrip }: FiltersProps) {
  const set = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });
  const toggle = <K extends "stops" | "airlines" | "outboundTimes" | "returnTimes">(key: K, val: FilterState[K][number]) => {
    const list = filters[key] as (typeof val)[];
    set({ [key]: list.includes(val) ? list.filter((v) => v !== val) : [...list, val] } as Partial<FilterState>);
  };

  // Counts and lowest prices are computed against offers matching all *other* filters (Kayak-style).
  const without = (key: keyof FilterState) => offers.filter((o) => matchesFilters(o, { ...filters, [key]: EMPTY_FILTERS[key] }));
  const stopsBase = without("stops");
  const airlineBase = without("airlines");
  const stopStats = [0, 1, 2].map((n) => {
    const list = stopsBase.filter((o) => maxStops(o) === n);
    return { n, count: list.length, min: list.length ? Math.min(...list.map((o) => o.price.total)) / perTraveler : undefined };
  });
  const airlines = Array.from(new Set(offers.map((o) => o.owner)))
    .map((code) => {
      const list = airlineBase.filter((o) => o.owner === code);
      return { code, count: list.length, min: list.length ? Math.min(...list.map((o) => o.price.total)) / perTraveler : undefined };
    })
    .sort((a, b) => airlineName(a.code).localeCompare(airlineName(b.code)));

  const durations = offers.map(totalDuration);
  const minDur = Math.min(...durations);
  const maxDur = Math.max(...durations);
  const prices = offers.map((o) => o.price.total);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const timeCounts = (sliceIndex: number) =>
    DEPARTURE_BUCKETS.map((b) => ({ ...b, count: offers.filter((o) => o.slices[sliceIndex] && departureBucket(o.slices[sliceIndex].departure) === b.id).length }));

  return (
    <div>
      <Section title="Stops">
        {stopStats.map((s) => (
          <CheckRow key={s.n} label={s.n === 0 ? "Nonstop" : s.n === 1 ? "1 stop" : "2+ stops"} checked={filters.stops.includes(s.n)} onChange={() => toggle("stops", s.n)} count={s.count} price={s.min} />
        ))}
      </Section>

      <Section
        title="Airlines"
        action={
          <button type="button" onClick={() => set({ airlines: [] })} className="text-xs font-semibold text-ocean-700 hover:underline">
            {filters.airlines.length ? "Clear" : "All"}
          </button>
        }
      >
        {airlines.map((a) => (
          <CheckRow
            key={a.code}
            label={airlineName(a.code)}
            checked={filters.airlines.includes(a.code)}
            onChange={() => toggle("airlines", a.code)}
            count={a.count}
            price={a.min}
            logo={<AirlineLogo iata={a.code} size={20} />}
            onOnly={() => set({ airlines: [a.code] })}
          />
        ))}
      </Section>

      <Section title={roundTrip ? "Departure time · Outbound" : "Departure time"}>
        <div className="grid grid-cols-2 gap-2">
          {timeCounts(0).map((b) => (
            <button
              key={b.id}
              type="button"
              aria-pressed={filters.outboundTimes.includes(b.id)}
              disabled={b.count === 0}
              onClick={() => toggle("outboundTimes", b.id)}
              className={cn("rounded-lg border px-2 py-2 text-left text-xs transition disabled:opacity-40", filters.outboundTimes.includes(b.id) ? "border-ocean-500 bg-ocean-50 text-ocean-800" : "border-slate-200 hover:border-slate-300")}
            >
              <span className="block font-semibold">{b.label}</span>
              <span className="block text-slate-500">{b.range}</span>
            </button>
          ))}
        </div>
      </Section>

      {roundTrip && (
        <Section title="Departure time · Return">
          <div className="grid grid-cols-2 gap-2">
            {timeCounts(1).map((b) => (
              <button
                key={b.id}
                type="button"
                aria-pressed={filters.returnTimes.includes(b.id)}
                disabled={b.count === 0}
                onClick={() => toggle("returnTimes", b.id)}
                className={cn("rounded-lg border px-2 py-2 text-left text-xs transition disabled:opacity-40", filters.returnTimes.includes(b.id) ? "border-ocean-500 bg-ocean-50 text-ocean-800" : "border-slate-200 hover:border-slate-300")}
              >
                <span className="block font-semibold">{b.label}</span>
                <span className="block text-slate-500">{b.range}</span>
              </button>
            ))}
          </div>
        </Section>
      )}

      <Section title="Bags & layovers">
        <CheckRow label="Carry-on bag included" checked={filters.carryOnOnly} onChange={(c) => set({ carryOnOnly: c })} />
        <CheckRow label="Checked bag included" checked={filters.checkedBagOnly} onChange={(c) => set({ checkedBagOnly: c })} />
        <CheckRow label="Exclude overnight layovers" checked={filters.noOvernightLayovers} onChange={(c) => set({ noOvernightLayovers: c })} />
      </Section>

      {maxDur > minDur && (
        <Section title="Max total duration">
          <label className="block text-xs text-slate-500">
            Up to <span className="font-semibold text-navy-900 tabular-nums">{formatDuration(filters.maxDuration ?? maxDur)}</span>
            <input type="range" min={minDur} max={maxDur} step={15} value={filters.maxDuration ?? maxDur} onChange={(e) => set({ maxDuration: Number(e.target.value) >= maxDur ? null : Number(e.target.value) })} className="mt-2 w-full accent-ocean-600" aria-label="Maximum total travel time" />
          </label>
        </Section>
      )}

      {maxPrice > minPrice && (
        <Section title="Max price">
          <label className="block text-xs text-slate-500">
            Up to <span className="font-semibold text-navy-900 tabular-nums">{formatMoney((filters.maxPrice ?? maxPrice) / perTraveler)}</span> per traveler
            <input type="range" min={Math.floor(minPrice)} max={Math.ceil(maxPrice)} step={5} value={filters.maxPrice ?? maxPrice} onChange={(e) => set({ maxPrice: Number(e.target.value) >= maxPrice ? null : Number(e.target.value) })} className="mt-2 w-full accent-ocean-600" aria-label="Maximum price" />
          </label>
        </Section>
      )}
    </div>
  );
}
