"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "./DatePicker";
import { CountField, PlaceInput } from "./PlaceInput";
import { hotelRequestText } from "@/lib/leads/request-text";
import { openWhatsAppRequest } from "@/lib/leads/open-whatsapp";
import { addDays, cn, toDateOnly } from "@/lib/utils";

const STARS = ["Any", "3 star", "4 star", "5 star", "All-inclusive resort"];

export function HotelSearchForm({ variant = "hero", suggestions, initialDestination = "", className }: { variant?: "hero" | "compact"; suggestions: string[]; initialDestination?: string; className?: string }) {
  const hero = variant === "hero";
  const [destination, setDestination] = React.useState(initialDestination);
  const [dates, setDates] = React.useState<{ start: string | null; end: string | null }>({ start: null, end: null });
  const [rooms, setRooms] = React.useState(1);
  const [adults, setAdults] = React.useState(2);
  const [children, setChildren] = React.useState(0);
  const [stars, setStars] = React.useState("Any");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const uid = React.useId().replace(/:/g, "");

  React.useEffect(() => {
    const today = toDateOnly(new Date());
    const start = addDays(today, 21);
    setDates({ start, end: addDays(start, 4) });
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!destination.trim()) next.destination = "Where are you going?";
    if (!dates.start) next.start = "Choose a check-in date.";
    if (!dates.end) next.end = "Choose a check-out date.";
    if (dates.start && dates.end && dates.end <= dates.start) next.end = "Check-out must be after check-in.";
    setErrors(next);
    if (Object.keys(next).length) return;
    const req = { destination: destination.trim(), checkIn: dates.start!, checkOut: dates.end!, rooms, adults, children, stars };
    setSubmitting(true);
    openWhatsAppRequest(hotelRequestText(req), { kind: "hotel", ...req, travelers: adults + children });
  }

  return (
    <form onSubmit={submit} noValidate aria-label="Hotel search" className={cn(hero ? "rounded-2xl bg-white p-4 shadow-float sm:p-5" : "rounded-2xl border border-slate-200 bg-white p-3 shadow-card sm:p-4", className)}>
      <div className="grid gap-3 lg:grid-cols-[1.5fr_1.4fr_auto_auto_auto_auto]">
        <PlaceInput id={`${uid}-dest`} label="Where to" value={destination} onChange={setDestination} suggestions={suggestions} error={errors.destination} compact={!hero} placeholder="City, region or hotel name" />
        <DatePicker id={`${uid}-dates`} mode="range" value={dates} onChange={setDates} compact={!hero} errorStart={errors.start} errorEnd={errors.end} startLabel="Check in" endLabel="Check out" />
        <CountField id={`${uid}-rooms`} label="Rooms" value={rooms} onChange={setRooms} min={1} max={8} compact={!hero} />
        <CountField id={`${uid}-adults`} label="Adults" value={adults} onChange={setAdults} min={1} max={12} compact={!hero} />
        <CountField id={`${uid}-children`} label="Children" value={children} onChange={setChildren} min={0} max={8} compact={!hero} />
        <div className="min-w-0">
          <label htmlFor={`${uid}-stars`} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Rating
          </label>
          <select
            id={`${uid}-stars`}
            value={stars}
            onChange={(e) => setStars(e.target.value)}
            className={cn("w-full rounded-[var(--radius-field)] border border-slate-300 bg-white px-3.5 text-[15px] font-medium text-navy-900 focus:border-ocean-500 focus:outline-none focus:ring-3 focus:ring-ocean-500/20", hero ? "h-14" : "h-12")}
          >
            {STARS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-600">We compare Expedia, Booking.com and direct hotel rates, then send you the lowest.</p>
        <Button type="submit" size={hero ? "xl" : "lg"} loading={submitting} leftIcon={<Search className="h-5 w-5" aria-hidden />} className="sm:w-auto">
          Search hotels
        </Button>
      </div>
    </form>
  );
}
