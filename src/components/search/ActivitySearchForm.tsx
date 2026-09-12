"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "./DatePicker";
import { CountField, PlaceInput } from "./PlaceInput";
import { activityRequestText } from "@/lib/leads/request-text";
import { openWhatsAppRequest } from "@/lib/leads/open-whatsapp";
import { addDays, cn, toDateOnly } from "@/lib/utils";

export const ACTIVITY_CATEGORIES = ["Anything", "Tours & sightseeing", "Theme parks & attractions", "Day trips & excursions", "Water sports & beaches", "Food & nightlife", "Museums & culture", "Airport transfers"];

export function ActivitySearchForm({ variant = "hero", suggestions, initialDestination = "", initialCategory = "Anything", className }: { variant?: "hero" | "compact"; suggestions: string[]; initialDestination?: string; initialCategory?: string; className?: string }) {
  const hero = variant === "hero";
  const [destination, setDestination] = React.useState(initialDestination);
  const [dates, setDates] = React.useState<{ start: string | null; end: string | null }>({ start: null, end: null });
  const [travelers, setTravelers] = React.useState(2);
  const [category, setCategory] = React.useState(initialCategory);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const uid = React.useId().replace(/:/g, "");

  React.useEffect(() => {
    setDates({ start: addDays(toDateOnly(new Date()), 21), end: null });
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!destination.trim()) next.destination = "Where are you going?";
    if (!dates.start) next.start = "Choose a date.";
    setErrors(next);
    if (Object.keys(next).length) return;
    const req = { destination: destination.trim(), date: dates.start!, travelers, category };
    setSubmitting(true);
    openWhatsAppRequest(activityRequestText(req), { kind: "activity", ...req });
  }

  return (
    <form onSubmit={submit} noValidate aria-label="Activity search" className={cn(hero ? "rounded-2xl bg-white p-4 shadow-float sm:p-5" : "rounded-2xl border border-slate-200 bg-white p-3 shadow-card sm:p-4", className)}>
      <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1.2fr_auto]">
        <PlaceInput id={`${uid}-dest`} label="Where to" value={destination} onChange={setDestination} suggestions={suggestions} error={errors.destination} compact={!hero} placeholder="City or attraction" />
        <DatePicker id={`${uid}-date`} mode="single" value={dates} onChange={setDates} compact={!hero} errorStart={errors.start} startLabel="Date" />
        <div className="min-w-0">
          <label htmlFor={`${uid}-cat`} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Looking for
          </label>
          <select
            id={`${uid}-cat`}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={cn("w-full rounded-[var(--radius-field)] border border-slate-300 bg-white px-3.5 text-[15px] font-medium text-navy-900 focus:border-ocean-500 focus:outline-none focus:ring-3 focus:ring-ocean-500/20", hero ? "h-14" : "h-12")}
          >
            {ACTIVITY_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <CountField id={`${uid}-travelers`} label="Travelers" value={travelers} onChange={setTravelers} min={1} max={20} compact={!hero} />
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-600">Tell us what you like and we send options with prices, usually within 15 minutes.</p>
        <Button type="submit" size={hero ? "xl" : "lg"} loading={submitting} leftIcon={<Search className="h-5 w-5" aria-hidden />} className="sm:w-auto">
          Search activities
        </Button>
      </div>
    </form>
  );
}
