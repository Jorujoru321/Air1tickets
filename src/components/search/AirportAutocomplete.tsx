"use client";

import * as React from "react";
import { X } from "lucide-react";
import type { Airport } from "@/lib/flights/types";
import { TOP_US_AIRPORTS, cityLabel, searchAirports } from "@/data/airports";
import { cn } from "@/lib/utils";
import { fieldLabelClass } from "./usePopover";

export interface AirportAutocompleteProps {
  id: string;
  label: string;
  value: Airport | null;
  onChange: (airport: Airport | null) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  error?: string;
  /** IATA to hide from suggestions (the other end of the trip). */
  exclude?: string;
  className?: string;
  compact?: boolean;
  autoFocus?: boolean;
}

/**
 * WAI-ARIA combobox for airports. Searches the bundled airport dataset on the
 * client (no network), supports typing an IATA code directly, arrow keys,
 * Enter, Escape, Home/End and a clear button.
 */
export function AirportAutocomplete({ id, label, value, onChange, placeholder = "City or airport", icon, error, exclude, className, compact, autoFocus }: AirportAutocompleteProps) {
  const [query, setQuery] = React.useState("");
  const [editing, setEditing] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const listId = `${id}-listbox`;

  const options = React.useMemo(() => {
    const base = query.trim() ? searchAirports(query, 8) : TOP_US_AIRPORTS.slice(0, 8);
    return base.filter((a) => a.iata !== exclude);
  }, [query, exclude]);

  React.useEffect(() => {
    setActive(0);
  }, [options]);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  });

  function close() {
    setOpen(false);
    setEditing(false);
    setQuery("");
  }

  function select(a: Airport) {
    onChange(a);
    close();
  }

  function commitTyped() {
    const q = query.trim().toUpperCase();
    if (q.length === 3) {
      const hit = options.find((a) => a.iata === q);
      if (hit) return select(hit);
    }
    if (options.length && query.trim()) return select(options[0]);
    close();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && ["ArrowDown", "ArrowUp"].includes(e.key)) {
      setOpen(true);
      e.preventDefault();
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => Math.min(options.length - 1, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setActive(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActive(options.length - 1);
        }
        break;
      case "Enter":
        if (open) {
          e.preventDefault();
          if (options[active]) select(options[active]);
          else commitTyped();
        }
        break;
      case "Escape":
        e.preventDefault();
        close();
        inputRef.current?.blur();
        break;
      case "Tab":
        if (open && query.trim()) commitTyped();
        else close();
        break;
    }
  }

  const displayValue = editing ? query : value ? `${value.city} (${value.iata})` : "";
  const activeId = open && options[active] ? `${id}-opt-${options[active].iata}` : undefined;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <label htmlFor={id} className={cn(fieldLabelClass, "mb-1")}>
        {label}
      </label>
      <div className="relative">
        {icon && <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-500">{icon}</span>}
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          autoFocus={autoFocus}
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          placeholder={placeholder}
          value={displayValue}
          onChange={(e) => {
            setQuery(e.target.value);
            setEditing(true);
            setOpen(true);
          }}
          onFocus={() => {
            setEditing(true);
            setQuery("");
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className={cn(
            "w-full rounded-[var(--radius-field)] border border-slate-300 bg-white pr-9 text-navy-900 placeholder:text-slate-400 transition-colors hover:border-slate-400 focus:border-ocean-500 focus:outline-none focus:ring-3 focus:ring-ocean-500/20 aria-[invalid=true]:border-danger-500",
            compact ? "h-12 text-[15px]" : "h-14 text-base font-semibold",
            icon ? "pl-10" : "pl-3.5",
          )}
        />
        {value && !editing && (
          <button
            type="button"
            aria-label={`Clear ${label.toLowerCase()}`}
            onClick={() => {
              onChange(null);
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-2 flex w-7 items-center justify-center rounded-full text-slate-500 hover:text-navy-900"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-danger-600" role="alert">
          {error}
        </p>
      )}
      <ul
        id={listId}
        role="listbox"
        aria-label={`${label} suggestions`}
        hidden={!open}
        className="absolute left-0 z-50 mt-1.5 max-h-80 w-full min-w-[20rem] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-float sm:w-[22rem]"
      >
        {!query.trim() && <li className="px-3 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Popular airports</li>}
        {options.length === 0 && (
          <li className="px-3 py-3 text-sm text-slate-500" aria-live="polite">
            No airports match &ldquo;{query}&rdquo;. Try a city name or 3-letter code.
          </li>
        )}
        {options.map((a, i) => (
          <li
            key={a.iata}
            id={`${id}-opt-${a.iata}`}
            role="option"
            aria-selected={i === active}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => select(a)}
            onMouseEnter={() => setActive(i)}
            className={cn("flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2", i === active ? "bg-ocean-50" : "hover:bg-slate-50")}
          >
            <span className="flex h-8 w-11 shrink-0 items-center justify-center rounded-md bg-navy-900 font-display text-xs font-bold text-white">{a.iata}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-navy-900">{cityLabel(a)}</span>
              <span className="block truncate text-xs text-slate-500">{a.name}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
