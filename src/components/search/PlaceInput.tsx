"use client";

import * as React from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Free-text destination field with suggestions. Unlike the airport
 * autocomplete this accepts anything a traveler types ("Tulum", "Amalfi
 * Coast"), because an agent reads it — we never have to resolve it to a code.
 */
export function PlaceInput({
  id,
  label,
  value,
  onChange,
  suggestions,
  placeholder = "City, region or hotel",
  error,
  compact = false,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  suggestions: string[];
  placeholder?: string;
  error?: string;
  compact?: boolean;
  className?: string;
}) {
  const listId = `${id}-options`;
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
          <MapPin className="h-5 w-5" aria-hidden />
        </span>
        <input
          id={id}
          list={listId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "w-full rounded-[var(--radius-field)] border border-slate-300 bg-white pl-11 pr-3.5 text-[15px] text-navy-900 placeholder:text-slate-400 focus:border-ocean-500 focus:outline-none focus:ring-3 focus:ring-ocean-500/20 aria-[invalid=true]:border-danger-500",
            compact ? "h-12" : "h-14",
          )}
        />
        <datalist id={listId}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-danger-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Small labelled number stepper used for rooms / guests / travelers. */
export function CountField({ id, label, value, onChange, min = 1, max = 12, compact = false }: { id: string; label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; compact?: boolean }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn("w-full rounded-[var(--radius-field)] border border-slate-300 bg-white px-3.5 text-[15px] font-medium text-navy-900 focus:border-ocean-500 focus:outline-none focus:ring-3 focus:ring-ocean-500/20", compact ? "h-12" : "h-14")}
      >
        {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </div>
  );
}
