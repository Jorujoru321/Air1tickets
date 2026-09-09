"use client";

import * as React from "react";
import { ChevronDown, Minus, Plus, Users } from "lucide-react";
import { CABIN_CLASSES, CABIN_LABELS, type CabinClass, type PassengerCounts } from "@/lib/flights/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { fieldButtonClass, fieldLabelClass, usePopover } from "./usePopover";

export interface PassengerCabinPickerProps {
  id: string;
  passengers: PassengerCounts;
  cabin: CabinClass;
  onChange: (next: { passengers: PassengerCounts; cabin: CabinClass }) => void;
  compact?: boolean;
  className?: string;
}

const ROWS: { key: keyof PassengerCounts; label: string; hint: string; min: number; max: number }[] = [
  { key: "adults", label: "Adults", hint: "12+ years", min: 1, max: 9 },
  { key: "children", label: "Children", hint: "2–11 years", min: 0, max: 8 },
  { key: "infants", label: "Infants", hint: "Under 2, on lap", min: 0, max: 4 },
];

export function summarizeTravelers(p: PassengerCounts, cabin: CabinClass): string {
  const total = p.adults + p.children + p.infants;
  return `${total} traveler${total === 1 ? "" : "s"} · ${CABIN_LABELS[cabin]}`;
}

export function PassengerCabinPicker({ id, passengers, cabin, onChange, compact, className }: PassengerCabinPickerProps) {
  const { open, setOpen, ref } = usePopover();
  const total = passengers.adults + passengers.children + passengers.infants;

  function update(key: keyof PassengerCounts, delta: number) {
    const row = ROWS.find((r) => r.key === key)!;
    const next = { ...passengers, [key]: Math.min(row.max, Math.max(row.min, passengers[key] + delta)) };
    if (next.adults + next.children + next.infants > 9) return;
    if (next.infants > next.adults) next.infants = next.adults;
    onChange({ passengers: next, cabin });
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <span className={cn(fieldLabelClass, "mb-1")} id={`${id}-label`}>
        Travelers
      </span>
      <button
        type="button"
        id={id}
        aria-labelledby={`${id}-label ${id}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(fieldButtonClass, compact && "h-12")}
      >
        <Users className="h-5 w-5 shrink-0 text-slate-500" aria-hidden />
        <span className={cn("min-w-0 flex-1 truncate text-navy-900", compact ? "text-[15px]" : "text-base font-semibold")}>{summarizeTravelers(passengers, cabin)}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-500 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div role="dialog" aria-label="Travelers and cabin" className="absolute right-0 z-50 mt-1.5 w-[20rem] rounded-xl border border-slate-200 bg-white p-4 shadow-float">
          <ul className="space-y-3">
            {ROWS.map((row) => {
              const val = passengers[row.key];
              const atMax = val >= row.max || total >= 9 || (row.key === "infants" && val >= passengers.adults);
              return (
                <li key={row.key} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{row.label}</p>
                    <p className="text-xs text-slate-500">{row.hint}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Remove ${row.label.toLowerCase().replace(/s$/, "")}`}
                      disabled={val <= row.min}
                      onClick={() => update(row.key, -1)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-navy-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" aria-hidden />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold tabular-nums text-navy-900" aria-live="polite">
                      {val}
                    </span>
                    <button
                      type="button"
                      aria-label={`Add ${row.label.toLowerCase().replace(/s$/, "")}`}
                      disabled={atMax}
                      onClick={() => update(row.key, 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-navy-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          {passengers.infants > 0 && <p className="mt-2 text-xs text-slate-500">Each infant travels on an adult&apos;s lap. Infants under 2 fly free on most US domestic routes.</p>}
          <div className="mt-4 border-t border-slate-100 pt-4">
            <label htmlFor={`${id}-cabin`} className="mb-1.5 block text-sm font-semibold text-navy-900">
              Cabin class
            </label>
            <select
              id={`${id}-cabin`}
              value={cabin}
              onChange={(e) => onChange({ passengers, cabin: e.target.value as CabinClass })}
              className="h-11 w-full rounded-[var(--radius-field)] border border-slate-300 bg-white px-3 text-sm text-navy-900 focus:border-ocean-500 focus:outline-none focus:ring-3 focus:ring-ocean-500/20"
            >
              {CABIN_CLASSES.map((c) => (
                <option key={c} value={c}>
                  {CABIN_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 flex justify-end">
            <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
