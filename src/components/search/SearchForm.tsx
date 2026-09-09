"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, PlaneLanding, PlaneTakeoff, Search } from "lucide-react";
import type { Airport, CabinClass, PassengerCounts, SearchParams } from "@/lib/flights/types";
import { getAirport } from "@/data/airports";
import { buildSearchUrl } from "@/lib/flights/search-params";
import { addDays, cn, toDateOnly } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { AirportAutocomplete } from "./AirportAutocomplete";
import { DatePicker } from "./DatePicker";
import { PassengerCabinPicker } from "./PassengerCabinPicker";

export interface SearchFormProps {
  variant: "hero" | "compact";
  initial?: Partial<SearchParams>;
  className?: string;
  /** Called instead of navigating (used by tests / embedded flows). */
  onSearch?: (params: SearchParams) => void;
}

const STORAGE_KEY = "air1:lastSearch";

interface Stored {
  origin?: string;
  destination?: string;
  departDate?: string;
  returnDate?: string | null;
  passengers?: PassengerCounts;
  cabin?: CabinClass;
  directOnly?: boolean;
}

function readStored(): Stored | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
}

export function SearchForm({ variant, initial, className, onSearch }: SearchFormProps) {
  const router = useRouter();
  const hero = variant === "hero";
  const [tripType, setTripType] = React.useState<"round_trip" | "one_way">(initial && "returnDate" in initial && !initial.returnDate && initial.departDate ? "one_way" : "round_trip");
  const [origin, setOrigin] = React.useState<Airport | null>(initial?.origin ? (getAirport(initial.origin) ?? null) : null);
  const [destination, setDestination] = React.useState<Airport | null>(initial?.destination ? (getAirport(initial.destination) ?? null) : null);
  const [dates, setDates] = React.useState<{ start: string | null; end: string | null }>({ start: initial?.departDate ?? null, end: initial?.returnDate ?? null });
  const [passengers, setPassengers] = React.useState<PassengerCounts>(initial?.passengers ?? { adults: 1, children: 0, infants: 0 });
  const [cabin, setCabin] = React.useState<CabinClass>(initial?.cabin ?? "economy");
  const [directOnly, setDirectOnly] = React.useState(Boolean(initial?.directOnly));
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const uid = React.useId().replace(/:/g, "");

  // Prefill from the last search (or sensible defaults) when nothing was provided.
  React.useEffect(() => {
    if (initial?.origin || initial?.destination || initial?.departDate) return;
    const stored = readStored();
    const today = toDateOnly(new Date());
    if (stored) {
      if (stored.origin) setOrigin(getAirport(stored.origin) ?? null);
      if (stored.destination) setDestination(getAirport(stored.destination) ?? null);
      const start = stored.departDate && stored.departDate >= today ? stored.departDate : addDays(today, 14);
      const end = stored.returnDate && stored.returnDate >= start ? stored.returnDate : stored.returnDate === null ? null : addDays(start, 7);
      setDates({ start, end });
      setTripType(stored.returnDate === null ? "one_way" : "round_trip");
      if (stored.passengers) setPassengers(stored.passengers);
      if (stored.cabin) setCabin(stored.cabin);
      setDirectOnly(Boolean(stored.directOnly));
    } else {
      const start = addDays(today, 14);
      setDates({ start, end: addDays(start, 7) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function swap() {
    setOrigin(destination);
    setDestination(origin);
  }

  function validate(): SearchParams | null {
    const next: Record<string, string> = {};
    if (!origin) next.origin = "Choose a departure airport.";
    if (!destination) next.destination = "Choose a destination.";
    if (origin && destination && origin.iata === destination.iata) next.destination = "Destination must differ from origin.";
    if (!dates.start) next.depart = "Choose a departure date.";
    if (tripType === "round_trip" && !dates.end) next.return = "Choose a return date.";
    if (tripType === "round_trip" && dates.start && dates.end && dates.end < dates.start) next.return = "Return must be after departure.";
    if (passengers.infants > passengers.adults) next.passengers = "Each infant needs an adult.";
    setErrors(next);
    if (Object.keys(next).length) return null;
    return {
      origin: origin!.iata,
      destination: destination!.iata,
      departDate: dates.start!,
      returnDate: tripType === "round_trip" ? dates.end! : undefined,
      passengers,
      cabin,
      directOnly: directOnly || undefined,
    };
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = validate();
    if (!params) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ origin: params.origin, destination: params.destination, departDate: params.departDate, returnDate: params.returnDate ?? null, passengers, cabin, directOnly } satisfies Stored),
      );
    } catch {}
    if (onSearch) return onSearch(params);
    setSubmitting(true);
    router.push(buildSearchUrl(params));
  }

  const isRange = tripType === "round_trip";

  return (
    <form onSubmit={submit} noValidate aria-label="Flight search" className={cn(hero ? "rounded-2xl bg-white p-4 shadow-float sm:p-5" : "rounded-2xl border border-slate-200 bg-white p-3 shadow-card sm:p-4", className)}>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div role="radiogroup" aria-label="Trip type" className="inline-flex rounded-full bg-slate-100 p-1">
          {(
            [
              ["round_trip", "Round trip"],
              ["one_way", "One way"],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              type="button"
              role="radio"
              aria-checked={tripType === val}
              onClick={() => {
                setTripType(val);
                if (val === "one_way") setDates((d) => ({ start: d.start, end: null }));
                else setDates((d) => ({ start: d.start, end: d.end ?? (d.start ? addDays(d.start, 7) : null) }));
              }}
              className={cn("rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors", tripType === val ? "bg-white text-navy-900 shadow-sm" : "text-slate-600 hover:text-navy-900")}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" checked={directOnly} onChange={(e) => setDirectOnly(e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-ocean-600" />
          Nonstop only
        </label>
      </div>

      <div className={cn("grid gap-3", hero ? "lg:grid-cols-[1fr_auto_1fr_1.35fr_1fr_auto]" : "lg:grid-cols-[1fr_auto_1fr_1.3fr_0.9fr_auto]")}>
        <AirportAutocomplete id={`${uid}-from`} label="From" value={origin} onChange={setOrigin} exclude={destination?.iata} icon={<PlaneTakeoff className="h-5 w-5" aria-hidden />} placeholder="City or airport" error={errors.origin} compact={!hero} />
        <div className="flex items-end justify-center lg:pb-0">
          <button
            type="button"
            onClick={swap}
            aria-label="Swap origin and destination"
            className={cn("flex items-center justify-center rounded-full border border-slate-300 bg-white text-navy-900 transition hover:border-navy-300 hover:bg-slate-50 active:rotate-180", hero ? "h-14 w-14 lg:mt-5" : "h-12 w-12 lg:mt-5")}
          >
            <ArrowLeftRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <AirportAutocomplete id={`${uid}-to`} label="To" value={destination} onChange={setDestination} exclude={origin?.iata} icon={<PlaneLanding className="h-5 w-5" aria-hidden />} placeholder="City or airport" error={errors.destination} compact={!hero} />
        <DatePicker
          id={`${uid}-dates`}
          mode={isRange ? "range" : "single"}
          value={dates}
          onChange={setDates}
          origin={origin?.iata}
          destination={destination?.iata}
          cabin={cabin}
          compact={!hero}
          errorStart={errors.depart}
          errorEnd={errors.return}
        />
        <PassengerCabinPicker
          id={`${uid}-pax`}
          passengers={passengers}
          cabin={cabin}
          onChange={({ passengers: p, cabin: c }) => {
            setPassengers(p);
            setCabin(c);
          }}
          compact={!hero}
        />
        <div className="flex items-end">
          <Button type="submit" size={hero ? "xl" : "lg"} full loading={submitting} leftIcon={<Search className="h-5 w-5" aria-hidden />} className={cn(hero ? "lg:mt-5 lg:h-14" : "lg:mt-5 lg:h-12")}>
            {hero ? "Search flights" : "Search"}
          </Button>
        </div>
      </div>
      {errors.passengers && (
        <p className="mt-2 text-sm font-medium text-danger-600" role="alert">
          {errors.passengers}
        </p>
      )}
    </form>
  );
}
