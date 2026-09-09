"use client";

import type { Offer } from "@/lib/flights/types";
import { cn, formatDuration, formatMoney } from "@/lib/utils";
import { summaryFor, type SortKey } from "./offer-utils";

const TABS: { key: SortKey; label: string; hint: string }[] = [
  { key: "best", label: "Best", hint: "Balance of price, duration and stops" },
  { key: "cheapest", label: "Cheapest", hint: "Lowest total price" },
  { key: "fastest", label: "Fastest", hint: "Shortest total travel time" },
];

export function SortTabs({ offers, sort, onChange, perTraveler }: { offers: Offer[]; sort: SortKey; onChange: (s: SortKey) => void; perTraveler: number }) {
  return (
    <div role="tablist" aria-label="Sort results" className="grid grid-cols-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      {TABS.map((t) => {
        const s = summaryFor(offers, t.key);
        const selected = sort === t.key;
        return (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={selected}
            title={t.hint}
            onClick={() => onChange(t.key)}
            className={cn("flex flex-col items-start gap-0.5 border-b-[3px] px-4 py-3 text-left transition-colors sm:px-5", selected ? "border-ocean-600 bg-ocean-50/60" : "border-transparent hover:bg-slate-50")}
          >
            <span className={cn("text-sm font-semibold", selected ? "text-ocean-800" : "text-navy-900")}>{t.label}</span>
            {s ? (
              <span className="text-xs text-slate-500 tabular-nums">
                <span className="font-semibold text-navy-900">{formatMoney(s.price / perTraveler)}</span> · {formatDuration(s.duration)}
              </span>
            ) : (
              <span className="text-xs text-slate-400">—</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
