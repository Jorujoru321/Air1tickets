import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { DestinationArt } from "@/components/marketing/DestinationArt";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/jsonld";
import { routePath } from "@/lib/seo/slugs";
import { dealsFrom } from "@/lib/flights/deals";
import { buildSearchUrl } from "@/lib/flights/search-params";
import { getAirport } from "@/data/airports";
import { getDestinationByAirport } from "@/data/destinations";
import { cn, formatDateShort, formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ORIGINS = ["JFK", "LAX", "ORD", "DFW", "ATL", "MIA", "SFO", "DEN", "BOS", "SEA", "IAH", "PHX"];

export const metadata = buildMetadata({
  title: "Flight Deals from US Airports — Cheapest Dates to Fly",
  description: "The lowest round-trip fares from New York, Los Angeles, Chicago, Dallas, Atlanta and more over the next 90 days, refreshed every few hours. Taxes and fees included.",
  path: "/deals",
});

export default async function DealsPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  const origin = ORIGINS.includes((from ?? "").toUpperCase()) ? (from as string).toUpperCase() : "JFK";
  const o = getAirport(origin)!;
  const deals = await dealsFrom(origin, 12, 90);

  return (
    <>
      <JsonLd data={webPageJsonLd({ name: "Flight deals", description: metadata.description ?? "", path: "/deals" })} />
      <div className="bg-slate-50">
        <div className="container-page py-10">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Deals", path: "/deals" }]} />
          <h1 className="mt-4 text-3xl sm:text-4xl">Flight deals from US airports</h1>
          <p className="mt-2 max-w-2xl text-slate-600">The cheapest dates to fly in the next 90 days from your home airport. Round-trip fares per traveler with taxes and fees included, refreshed every few hours.</p>

          <div className="mt-6 flex flex-wrap gap-2" role="navigation" aria-label="Departure airport">
            {ORIGINS.map((code) => {
              const a = getAirport(code)!;
              const active = code === origin;
              return (
                <Link key={code} href={`/deals?from=${code}`} aria-current={active ? "page" : undefined} className={cn("rounded-full border px-3.5 py-1.5 text-sm font-semibold transition", active ? "border-navy-900 bg-navy-900 text-white" : "border-slate-300 bg-white text-navy-900 hover:border-navy-300")}>
                  {a.city} ({code})
                </Link>
              );
            })}
          </div>

          <h2 className="mt-10 flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-sunrise-500" aria-hidden /> Best deals from {o.city} ({o.iata})
          </h2>
          {deals.length === 0 ? (
            <p className="mt-4 text-slate-600">We&apos;re refreshing deals for this airport. Try another origin or search directly.</p>
          ) : (
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {deals.map((deal) => {
                const d = getAirport(deal.destination)!;
                const guide = getDestinationByAirport(deal.destination);
                const searchUrl = buildSearchUrl({ origin: deal.origin, destination: deal.destination, departDate: deal.date, returnDate: deal.returnDate, passengers: { adults: 1, children: 0, infants: 0 }, cabin: "economy" });
                return (
                  <li key={deal.destination} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:shadow-card-hover">
                    <Link href={searchUrl} className="block">
                      <div className="aspect-[16/9]">
                        <DestinationArt theme={guide?.heroTheme ?? (deal.category === "international" ? "historic" : "city")} gradient={guide?.gradient ?? ["#12244a", "#2f93ef"]} seed={deal.destination} />
                      </div>
                    </Link>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-lg font-bold text-navy-900">{d.city}</p>
                          <p className="text-xs text-slate-500">
                            {d.countryCode === "US" ? d.state : d.country} · {d.iata} · {deal.category === "domestic" ? "Domestic" : "International"}
                          </p>
                        </div>
                        <p className="text-right">
                          <span className="block text-xl font-extrabold tabular-nums text-navy-900">{formatMoney(deal.price)}</span>
                          <span className="block text-[11px] text-slate-500">round trip</span>
                        </p>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">
                        {formatDateShort(deal.date)} – {formatDateShort(deal.returnDate)}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <Link href={searchUrl} className="inline-flex items-center gap-1 text-sm font-semibold text-sunrise-700 hover:underline">
                          See flights <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                        <Link href={routePath(o, d)} className="text-xs font-medium text-ocean-700 hover:underline">
                          Route guide
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <section className="mt-12 max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            <h2 className="text-lg font-bold text-navy-900">How we find these deals</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Our fare engine checks every travel date in the next 90 days on the routes travelers search most from {o.city}, then picks the cheapest date for each destination. Prices are the lowest round-trip economy fare per traveler including taxes and fees, and refresh every few hours — a deal you see now can change by the time you book, so we always confirm the price before payment.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
