"use client";

import * as React from "react";
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import type { Offer, SearchParams } from "@/lib/flights/types";
import { AIRPORTS_BY_METRO, getAirport } from "@/data/airports";
import { buildSearchUrl } from "@/lib/flights/search-params";
import { Button } from "@/components/ui/Button";
import { cn, pluralize } from "@/lib/utils";
import { Filters } from "./Filters";
import { OfferCard } from "./OfferCard";
import { PriceAlertCard } from "./PriceAlertCard";
import { SortTabs } from "./SortTabs";
import { EMPTY_FILTERS, activeFilterCount, matchesFilters, sortOffers, type FilterState, type SortKey } from "./offer-utils";

const PAGE = 25;

export function ResultsView({ offers, params, initialSort = "best" }: { offers: Offer[]; params: SearchParams; initialSort?: SortKey }) {
  const [sort, setSort] = React.useState<SortKey>(initialSort);
  const [filters, setFilters] = React.useState<FilterState>(EMPTY_FILTERS);
  const [shown, setShown] = React.useState(PAGE);
  const [drawer, setDrawer] = React.useState(false);
  const perTraveler = Math.max(1, params.passengers.adults + params.passengers.children);
  const roundTrip = Boolean(params.returnDate);

  const filtered = React.useMemo(() => sortOffers(offers.filter((o) => matchesFilters(o, filters)), sort), [offers, filters, sort]);
  const active = activeFilterCount(filters);

  React.useEffect(() => {
    if (!drawer) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [drawer]);

  if (offers.length === 0) return <EmptyState params={params} />;

  const filterPanel = <Filters offers={offers} filters={filters} onChange={(f) => { setFilters(f); setShown(PAGE); }} perTraveler={perTraveler} roundTrip={roundTrip} />;

  return (
    <div className="grid gap-6 lg:grid-cols-[17.5rem_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-[calc(var(--header-height)+1rem)] max-h-[calc(100vh-var(--header-height)-2rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-navy-900">Filters</h2>
            {active > 0 && (
              <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="text-xs font-semibold text-ocean-700 hover:underline">
                Reset all
              </button>
            )}
          </div>
          {filterPanel}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="mb-3 flex items-center justify-between gap-3 lg:hidden">
          <p className="text-sm text-slate-600" aria-live="polite">
            <span className="font-semibold text-navy-900">{filtered.length}</span> of {pluralize(offers.length, "flight")}
          </p>
          <Button type="button" variant="outline" size="sm" leftIcon={<SlidersHorizontal className="h-4 w-4" aria-hidden />} onClick={() => setDrawer(true)} aria-haspopup="dialog" aria-expanded={drawer}>
            Filters{active > 0 && ` (${active})`}
          </Button>
        </div>

        <SortTabs offers={filtered.length ? filtered : offers} sort={sort} onChange={setSort} perTraveler={perTraveler} />

        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="hidden lg:inline" aria-live="polite">
            <span className="font-semibold text-navy-900">{filtered.length}</span> of {pluralize(offers.length, "flight")} · prices per traveler, taxes and fees included
          </span>
          <span className="lg:hidden">Prices per traveler incl. taxes & fees</span>
          <span>Free 24-hour cancellation</span>
          <span>No hidden booking fees</span>
        </p>

        {active > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {filters.stops.length > 0 && <Chip label={`Stops: ${filters.stops.map((s) => (s === 0 ? "Nonstop" : s === 1 ? "1 stop" : "2+")).join(", ")}`} onClear={() => setFilters({ ...filters, stops: [] })} />}
            {filters.airlines.length > 0 && <Chip label={`${pluralize(filters.airlines.length, "airline")}`} onClear={() => setFilters({ ...filters, airlines: [] })} />}
            {filters.outboundTimes.length > 0 && <Chip label="Outbound time" onClear={() => setFilters({ ...filters, outboundTimes: [] })} />}
            {filters.returnTimes.length > 0 && <Chip label="Return time" onClear={() => setFilters({ ...filters, returnTimes: [] })} />}
            {filters.maxDuration !== null && <Chip label="Max duration" onClear={() => setFilters({ ...filters, maxDuration: null })} />}
            {filters.maxPrice !== null && <Chip label="Max price" onClear={() => setFilters({ ...filters, maxPrice: null })} />}
            {filters.carryOnOnly && <Chip label="Carry-on included" onClear={() => setFilters({ ...filters, carryOnOnly: false })} />}
            {filters.checkedBagOnly && <Chip label="Checked bag included" onClear={() => setFilters({ ...filters, checkedBagOnly: false })} />}
            {filters.noOvernightLayovers && <Chip label="No overnight layovers" onClear={() => setFilters({ ...filters, noOvernightLayovers: false })} />}
            <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="text-xs font-semibold text-ocean-700 hover:underline">
              Reset all
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-lg font-bold text-navy-900">No flights match your filters</h2>
            <p className="mt-1 text-sm text-slate-600">Try removing a filter or two — there are {pluralize(offers.length, "flight")} on these dates.</p>
            <Button type="button" variant="secondary" className="mt-5" onClick={() => setFilters(EMPTY_FILTERS)}>
              Reset filters
            </Button>
          </div>
        ) : (
          <ol className="mt-4 space-y-3">
            {filtered.slice(0, shown).map((o, i) => (
              <React.Fragment key={o.id}>
                <li>
                  <OfferCard offer={o} perTraveler={perTraveler} position={i} />
                </li>
                {i === 4 && (
                  <li aria-label="Price alert">
                    <PriceAlertCard params={params} />
                  </li>
                )}
              </React.Fragment>
            ))}
          </ol>
        )}

        {shown < filtered.length && (
          <div className="mt-6 flex justify-center">
            <Button type="button" variant="outline" size="lg" onClick={() => setShown((s) => s + PAGE)}>
              Show more flights ({filtered.length - shown} more)
            </Button>
          </div>
        )}
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button type="button" className="absolute inset-0 bg-navy-950/50" aria-label="Close filters" onClick={() => setDrawer(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-2xl bg-white shadow-float">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <h2 className="text-base font-bold text-navy-900">Filters</h2>
              <div className="flex items-center gap-3">
                {active > 0 && (
                  <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="text-xs font-semibold text-ocean-700">
                    Reset all
                  </button>
                )}
                <button type="button" onClick={() => setDrawer(false)} aria-label="Close filters" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100">
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">{filterPanel}</div>
            <div className="border-t border-slate-100 p-4">
              <Button type="button" full onClick={() => setDrawer(false)}>
                Show {pluralize(filtered.length, "flight")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-navy-900 py-1 pl-3 pr-1.5 text-xs font-medium text-white">
      {label}
      <button type="button" onClick={onClear} aria-label={`Remove filter ${label}`} className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-white/20">
        <X className="h-3 w-3" aria-hidden />
      </button>
    </span>
  );
}

function EmptyState({ params }: { params: SearchParams }) {
  const o = getAirport(params.origin);
  const d = getAirport(params.destination);
  const altOrigins = o?.metro ? (AIRPORTS_BY_METRO[o.metro] ?? []).filter((a) => a.iata !== o.iata) : [];
  const altDests = d?.metro ? (AIRPORTS_BY_METRO[d.metro] ?? []).filter((a) => a.iata !== d.iata) : [];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-card">
      <h2 className="text-xl font-bold text-navy-900">No flights found for these dates</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
        We couldn&apos;t find itineraries from {o?.city ?? params.origin} to {d?.city ?? params.destination}
        {params.directOnly ? " with nonstop service" : ""}. Try one of these:
      </p>
      <ul className="mx-auto mt-6 flex max-w-lg flex-wrap justify-center gap-2 text-sm">
        {params.directOnly && (
          <li>
            <Link href={buildSearchUrl({ ...params, directOnly: undefined })} className={linkChip}>
              Include connecting flights
            </Link>
          </li>
        )}
        {altOrigins.map((a) => (
          <li key={a.iata}>
            <Link href={buildSearchUrl({ ...params, origin: a.iata })} className={linkChip}>
              Depart from {a.city} ({a.iata})
            </Link>
          </li>
        ))}
        {altDests.map((a) => (
          <li key={a.iata}>
            <Link href={buildSearchUrl({ ...params, destination: a.iata })} className={linkChip}>
              Fly into {a.city} ({a.iata})
            </Link>
          </li>
        ))}
        <li>
          <Link href="/flights" className={linkChip}>
            Change dates
          </Link>
        </li>
      </ul>
    </div>
  );
}

const linkChip = cn("inline-flex rounded-full border border-slate-300 px-3.5 py-1.5 font-medium text-navy-900 transition hover:border-ocean-400 hover:bg-ocean-50");
