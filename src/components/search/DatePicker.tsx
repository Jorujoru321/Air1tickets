"use client";

import * as React from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import type { CabinClass, PriceCalendarEntry } from "@/lib/flights/types";
import { addDays, cn, formatDateShort, parseDateOnly, toDateOnly } from "@/lib/utils";
import { fieldButtonClass, fieldLabelClass, usePopover } from "./usePopover";

export interface DateRange {
  start: string | null;
  end: string | null;
}

export interface DatePickerProps {
  id: string;
  mode: "single" | "range";
  value: DateRange;
  onChange: (next: DateRange) => void;
  /** When both are set, the calendar shows the lowest fare under each day. */
  origin?: string | null;
  destination?: string | null;
  cabin?: CabinClass;
  compact?: boolean;
  errorStart?: string;
  errorEnd?: string;
  className?: string;
  startLabel?: string;
  endLabel?: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function monthKey(y: number, m: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}`;
}

function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}

export function DatePicker({ id, mode, value, onChange, origin, destination, cabin = "economy", compact, errorStart, errorEnd, className, startLabel = "Depart", endLabel = "Return" }: DatePickerProps) {
  const { open, setOpen, ref } = usePopover();
  const [today, setToday] = React.useState<string>(() => toDateOnly(new Date()));
  const [picking, setPicking] = React.useState<"start" | "end">("start");
  const [view, setView] = React.useState(() => {
    const base = parseDateOnly(value.start ?? toDateOnly(new Date()));
    return { y: base.getFullYear(), m: base.getMonth() };
  });
  const [focused, setFocused] = React.useState<string | null>(null);
  const [hover, setHover] = React.useState<string | null>(null);
  const [prices, setPrices] = React.useState<Record<string, PriceCalendarEntry[]>>({});
  const gridRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => setToday(toDateOnly(new Date())), []);

  const maxDate = addDays(today, 330);
  const months = [view, view.m === 11 ? { y: view.y + 1, m: 0 } : { y: view.y, m: view.m + 1 }];

  // Fetch price hints for the visible months.
  React.useEffect(() => {
    if (!open || !origin || !destination) return;
    let cancelled = false;
    for (const mo of months) {
      const key = monthKey(mo.y, mo.m);
      if (prices[key]) continue;
      const first = `${key}-01`;
      if (first > maxDate || key < today.slice(0, 7)) continue;
      fetch(`/api/price-calendar?from=${origin}&to=${destination}&month=${key}&cabin=${cabin}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!cancelled && d?.entries) setPrices((p) => ({ ...p, [key]: d.entries }));
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, origin, destination, cabin, view.y, view.m]);

  // Reset cached prices when the route changes.
  React.useEffect(() => setPrices({}), [origin, destination, cabin]);

  function openFor(field: "start" | "end") {
    setPicking(field);
    const anchor = field === "end" ? value.end ?? value.start : value.start;
    const base = parseDateOnly(anchor ?? today);
    setView({ y: base.getFullYear(), m: base.getMonth() });
    setFocused(anchor ?? today);
    setOpen(true);
  }

  function pick(date: string) {
    if (date < today || date > maxDate) return;
    if (mode === "single") {
      onChange({ start: date, end: null });
      setOpen(false);
      return;
    }
    if (picking === "start") {
      const end = value.end && value.end >= date ? value.end : null;
      onChange({ start: date, end });
      setPicking("end");
      setFocused(date);
      return;
    }
    if (value.start && date < value.start) {
      onChange({ start: date, end: null });
      setPicking("end");
      return;
    }
    onChange({ start: value.start ?? date, end: date });
    setOpen(false);
  }

  function moveFocus(days: number) {
    const base = focused ?? value.start ?? today;
    let next = addDays(base, days);
    if (next < today) next = today;
    if (next > maxDate) next = maxDate;
    setFocused(next);
    const d = parseDateOnly(next);
    const inView = months.some((mo) => mo.y === d.getFullYear() && mo.m === d.getMonth());
    if (!inView) setView({ y: d.getFullYear(), m: d.getMonth() });
    requestAnimationFrame(() => {
      gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${next}"]`)?.focus();
    });
  }

  function onGridKey(e: React.KeyboardEvent) {
    const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in map) {
      e.preventDefault();
      moveFocus(map[e.key]);
    } else if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      const base = parseDateOnly(focused ?? today);
      base.setMonth(base.getMonth() + (e.key === "PageUp" ? -1 : 1));
      moveFocus(Math.round((base.getTime() - parseDateOnly(focused ?? today).getTime()) / 86_400_000));
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const dow = parseDateOnly(focused ?? today).getDay();
      moveFocus(e.key === "Home" ? -dow : 6 - dow);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (focused) pick(focused);
    }
  }

  function shiftView(delta: number) {
    const d = new Date(view.y, view.m + delta, 1);
    if (monthKey(d.getFullYear(), d.getMonth()) < today.slice(0, 7)) return;
    if (`${monthKey(d.getFullYear(), d.getMonth())}-01` > maxDate) return;
    setView({ y: d.getFullYear(), m: d.getMonth() });
  }

  function quick(days: number) {
    const start = value.start ?? addDays(today, 21);
    onChange({ start, end: addDays(start, days) });
    setOpen(false);
  }

  const rangeStart = value.start;
  const rangeEnd = value.end ?? (picking === "end" && hover && value.start && hover > value.start ? hover : null);

  const fieldBtn = (field: "start" | "end", label: string, date: string | null, error?: string) => (
    <div className="min-w-0 flex-1">
      <span className={cn(fieldLabelClass, "mb-1")} id={`${id}-${field}-label`}>
        {label}
      </span>
      <button
        type="button"
        id={`${id}-${field}`}
        aria-labelledby={`${id}-${field}-label ${id}-${field}`}
        aria-haspopup="dialog"
        aria-expanded={open && picking === field}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-${field}-error` : undefined}
        onClick={() => openFor(field)}
        className={cn(fieldButtonClass, compact && "h-12", open && picking === field && "border-ocean-500 ring-3 ring-ocean-500/20")}
      >
        <Calendar className="h-5 w-5 shrink-0 text-slate-500" aria-hidden />
        <span className={cn("truncate", date ? "text-navy-900" : "text-slate-500", compact ? "text-[15px]" : "text-base font-semibold")}>{date ? formatDateShort(date) : "Add date"}</span>
      </button>
      {error && (
        <p id={`${id}-${field}-error`} className="mt-1 text-xs font-medium text-danger-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div className="flex gap-2">
        {fieldBtn("start", startLabel, value.start, errorStart)}
        {mode === "range" && fieldBtn("end", endLabel, value.end, errorEnd)}
      </div>
      {open && (
        <div role="dialog" aria-label="Choose dates" className="absolute left-0 z-50 mt-1.5 w-[min(calc(100vw-2rem),42rem)] rounded-xl border border-slate-200 bg-white p-4 shadow-float sm:left-auto sm:right-0 lg:left-0 lg:right-auto">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" onClick={() => shiftView(-1)} aria-label="Previous month" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100">
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <p className="text-sm font-medium text-slate-600" aria-live="polite">
              {mode === "range" ? (picking === "start" ? "Select departure date" : "Select return date") : "Select date"}
              {origin && destination && <span className="ml-2 text-xs text-slate-500">· lowest round-trip fares per traveler</span>}
            </p>
            <button type="button" onClick={() => shiftView(1)} aria-label="Next month" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100">
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div ref={gridRef} className="grid gap-6 sm:grid-cols-2" onKeyDown={onGridKey}>
            {months.map((mo, mi) => {
              const key = monthKey(mo.y, mo.m);
              const entries = prices[key] ?? [];
              const sorted = [...entries].map((e) => e.price).sort((a, b) => a - b);
              const cheapCut = sorted.length ? sorted[Math.floor(sorted.length / 3)] : Infinity;
              const priceOf = (date: string) => entries.find((e) => e.date === date)?.price;
              const firstDow = new Date(mo.y, mo.m, 1).getDay();
              const total = daysInMonth(mo.y, mo.m);
              const cells: (string | null)[] = Array(firstDow).fill(null);
              for (let d = 1; d <= total; d++) cells.push(`${key}-${String(d).padStart(2, "0")}`);
              return (
                <div key={key} className={cn(mi === 1 && "hidden sm:block")} role="grid" aria-label={`${MONTHS[mo.m]} ${mo.y}`}>
                  <p className="mb-2 text-center text-sm font-bold text-navy-900">
                    {MONTHS[mo.m]} {mo.y}
                  </p>
                  <div className="grid grid-cols-7 text-center text-[11px] font-semibold uppercase text-slate-500" role="row">
                    {WEEKDAYS.map((w) => (
                      <span key={w} role="columnheader" className="py-1">
                        {w}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-y-0.5" role="rowgroup">
                    {cells.map((date, i) => {
                      if (!date) return <span key={`e${i}`} aria-hidden />;
                      const disabled = date < today || date > maxDate;
                      const isStart = date === rangeStart;
                      const isEnd = date === rangeEnd;
                      const inRange = rangeStart && rangeEnd && date > rangeStart && date < rangeEnd;
                      const price = priceOf(date);
                      const isFocused = (focused ?? value.start ?? today) === date;
                      return (
                        <button
                          key={date}
                          type="button"
                          role="gridcell"
                          data-date={date}
                          tabIndex={isFocused ? 0 : -1}
                          disabled={disabled}
                          aria-selected={isStart || isEnd || undefined}
                          aria-label={`${formatDateShort(date)}${price ? `, from $${price}` : ""}`}
                          onClick={() => pick(date)}
                          onMouseEnter={() => setHover(date)}
                          onMouseLeave={() => setHover(null)}
                          onFocus={() => setFocused(date)}
                          className={cn(
                            "relative flex h-11 flex-col items-center justify-center rounded-lg text-sm tabular-nums transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500",
                            disabled ? "cursor-not-allowed text-slate-300" : "text-navy-900 hover:bg-ocean-50",
                            inRange && "rounded-none bg-ocean-50",
                            (isStart || isEnd) && "bg-navy-900 text-white hover:bg-navy-800",
                            isStart && rangeEnd && "rounded-r-none",
                            isEnd && "rounded-l-none",
                            date === today && !isStart && !isEnd && "font-bold",
                          )}
                        >
                          <span className="leading-none">{Number(date.slice(8))}</span>
                          {price !== undefined && !disabled && (
                            <span className={cn("mt-0.5 text-[10px] leading-none", isStart || isEnd ? "text-white/80" : price <= cheapCut ? "font-semibold text-success-600" : "text-slate-500")}>${price}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
            {mode === "range" ? (
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Weekend (2 nights)", days: 2 },
                  { label: "1 week", days: 7 },
                  { label: "2 weeks", days: 14 },
                ].map((q) => (
                  <button key={q.days} type="button" onClick={() => quick(q.days)} className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:border-navy-300 hover:bg-slate-50">
                    {q.label}
                  </button>
                ))}
              </div>
            ) : (
              <span />
            )}
            <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold text-ocean-700 hover:underline">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
