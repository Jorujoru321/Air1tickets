import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchForm } from "@/components/search";
import { ResultsView } from "@/components/results/ResultsView";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { getFlightProvider } from "@/lib/flights/provider";
import { safeParseSearchQuery, type RawQuery } from "@/lib/flights/search-params";
import { getAirport } from "@/data/airports";
import { formatDateShort } from "@/lib/utils";
import { logSearch } from "@/lib/booking/search-log";
import type { SearchParams } from "@/lib/flights/types";
import type { SortKey } from "@/components/results/offer-utils";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<RawQuery>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const parsed = safeParseSearchQuery(await searchParams);
  if (!parsed.ok) return { title: "Search flights", robots: { index: false, follow: false } };
  const { params } = parsed;
  const o = getAirport(params.origin);
  const d = getAirport(params.destination);
  const dates = params.returnDate ? `${formatDateShort(params.departDate)} – ${formatDateShort(params.returnDate)}` : formatDateShort(params.departDate);
  return {
    title: `Flights from ${o?.city ?? params.origin} (${params.origin}) to ${d?.city ?? params.destination} (${params.destination}) · ${dates}`,
    description: `Compare fares from ${o?.city ?? params.origin} to ${d?.city ?? params.destination} on ${dates}. Filter by stops, airline, bags and departure time, then book in minutes.`,
    robots: { index: false, follow: false },
  };
}

async function Results({ params, sort }: { params: SearchParams; sort: SortKey }) {
  const offers = await getFlightProvider().search(params);
  void logSearch(params, offers.length, offers[0]?.price.total);
  return <ResultsView offers={offers} params={params} initialSort={sort} />;
}

function ResultsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[17.5rem_1fr]" aria-busy="true" aria-live="polite">
      <aside className="hidden space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:block">
        <Skeleton className="h-5 w-24" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </aside>
      <div>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-sunrise-500" aria-hidden />
          <p className="text-sm font-medium text-navy-900">Searching 500+ airlines for the best fares…</p>
        </div>
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="grid gap-4 lg:grid-cols-[1fr_11rem]">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-8 w-24 lg:ml-auto" />
                  <Skeleton className="h-11 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function SearchResultsPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const parsed = safeParseSearchQuery(raw);
  const sortRaw = Array.isArray(raw.sort) ? raw.sort[0] : raw.sort;
  const sort: SortKey = sortRaw === "cheapest" || sortRaw === "fastest" ? sortRaw : "best";

  if (!parsed.ok) {
    return (
      <div className="container-page py-10">
        <h1 className="text-2xl">Search flights</h1>
        <Alert tone="warning" className="mt-4 max-w-2xl" title="We couldn't run that search">
          {parsed.error}. Please check the details below and try again.
        </Alert>
        <div className="mt-6">
          <SearchForm variant="compact" />
        </div>
      </div>
    );
  }

  const { params } = parsed;
  const o = getAirport(params.origin);
  const d = getAirport(params.destination);
  if (!o || !d) {
    return (
      <div className="container-page py-10">
        <h1 className="text-2xl">Search flights</h1>
        <Alert tone="warning" className="mt-4 max-w-2xl" title="Unknown airport">
          We don&apos;t recognise one of those airport codes. Choose airports from the suggestions below.
        </Alert>
        <div className="mt-6">
          <SearchForm variant="compact" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="container-page py-4">
          <h1 className="sr-only">
            Flights from {o.city} to {d.city}
          </h1>
          <SearchForm variant="compact" initial={params} />
        </div>
      </div>
      <div className="container-page py-6">
        <Suspense fallback={<ResultsSkeleton />}>
          <Results params={params} sort={sort} />
        </Suspense>
      </div>
    </div>
  );
}
