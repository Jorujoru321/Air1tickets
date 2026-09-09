import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { SearchForm } from "@/components/search";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/seo/FaqAccordion";
import { PageHeader } from "@/components/seo/PageHeader";
import { SectionHeading } from "@/components/seo/SectionHeading";
import { RouteLinks, type RouteLinkItem } from "@/components/seo/RouteLinks";
import { LinkCardGrid, type LinkCardItem } from "@/components/seo/LinkCardGrid";
import { AirlineLogo } from "@/components/results/AirlineLogo";
import { DestinationArt } from "@/components/marketing/DestinationArt";
import { fitDescription, fitTitle, joinNames } from "@/components/seo/seo-text";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqPageJsonLd, touristDestinationJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { airportPath, destinationPath, flightsToPath } from "@/lib/seo/slugs";
import { lowestRouteFare, nonstopCarriers } from "@/lib/flights/route-info";
import { cityLocationLabel, destinationCitySlugs, getCity, routesToCity } from "@/lib/seo/city-pages";
import { getAirport } from "@/data/airports";
import { getDestinationByAirport } from "@/data/destinations";
import type { FAQ } from "@/data/types";
import { formatMoney } from "@/lib/utils";

export const revalidate = 21600;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ city: string }>;
}

export function generateStaticParams(): { city: string }[] {
  return destinationCitySlugs().map((city) => ({ city }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  const entry = getCity(city);
  if (!entry) return { title: "Destination not found", robots: { index: false, follow: false } };
  const loc = cityLocationLabel(entry.primary);
  const routes = routesToCity(entry).slice(0, 3);
  const fares = await Promise.all(routes.map((r) => lowestRouteFare(r.origin, r.destination)));
  const min = fares.filter(Boolean).map((f) => f!.price).sort((a, b) => a - b)[0];
  const title = fitTitle([`Cheap Flights to ${entry.city}, ${loc}${min ? ` from ${formatMoney(min)}` : ""}`, `Cheap Flights to ${entry.city}${min ? ` from ${formatMoney(min)}` : ""}`, `Cheap Flights to ${entry.city}`]);
  const description = fitDescription([
    `Compare cheap flights to ${entry.city} (${entry.airports.map((a) => a.iata).join(", ")}).`,
    min ? `Round trips from ${formatMoney(min)} with taxes and fees included.` : "See fares by month and which airlines fly nonstop.",
    `Routes from ${joinNames(routes.map((r) => getAirport(r.origin)?.city ?? r.origin))} and more.`,
    "Book with 24/7 US-based support.",
  ]);
  return buildMetadata({ title, description, path: flightsToPath(entry.primary), keywords: [`flights to ${entry.city}`, `cheap flights to ${entry.city}`, `${entry.primary.iata} flights`] });
}

export default async function FlightsToCityPage({ params }: PageProps) {
  const { city } = await params;
  const entry = getCity(city);
  if (!entry) notFound();
  const { primary, airports } = entry;
  const loc = cityLocationLabel(primary);
  const path = flightsToPath(primary);
  const guide = getDestinationByAirport(primary.iata);
  const routes = routesToCity(entry);
  const priced = routes.slice(0, 8);
  const fares = await Promise.all(priced.map((r) => lowestRouteFare(r.origin, r.destination)));
  const routeItems: RouteLinkItem[] = routes
    .map((r, i) => {
      const o = getAirport(r.origin);
      const d = getAirport(r.destination);
      return o && d ? ({ origin: o, destination: d, price: i < priced.length ? fares[i]?.price ?? null : null } as RouteLinkItem) : null;
    })
    .filter((x): x is RouteLinkItem => x !== null)
    .slice(0, 18);
  const minFare = fares.filter(Boolean).map((f) => f!.price).sort((a, b) => a - b)[0];
  const carriers = Array.from(new Map(routes.slice(0, 10).flatMap((r) => nonstopCarriers(getAirport(r.origin)!, getAirport(r.destination)!)).map((a) => [a.iata, a])).values()).slice(0, 8);
  const airportItems: LinkCardItem[] = airports.map((a) => ({
    key: a.iata,
    href: airportPath(a),
    title: `${a.name} (${a.iata})`,
    subtitle: a.size >= 4 ? "Major airport — most flights and nonstop routes" : a.size === 3 ? "Medium airport — often cheaper on low-cost carriers" : "Smaller airport — limited routes",
    leading: (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-xs font-bold text-white" aria-hidden>
        {a.iata}
      </span>
    ),
  }));

  const faqs: FAQ[] = [
    {
      question: `Which airport should I fly into for ${entry.city}?`,
      answer:
        airports.length > 1
          ? `${entry.city} is served by ${airports.length} airports: ${joinNames(airports.map((a) => `${a.name} (${a.iata})`))}. ${primary.name} has the most flights; the others can be cheaper on low-cost carriers and closer to some neighborhoods. Our search shows all of them so you can compare.`
          : `${primary.name} (${primary.iata}) is the airport for ${entry.city}. Every fare we show for ${entry.city} lands there.`,
    },
    {
      question: `Which airlines fly to ${entry.city}?`,
      answer: carriers.length
        ? `${joinNames(carriers.slice(0, 6).map((c) => c.name))} ${carriers.length > 6 ? "and others " : ""}fly nonstop to ${entry.city} from major US cities, with more airlines offering one-stop itineraries. Route pages list the airlines for each departure city.`
        : `Several airlines serve ${entry.city} with connecting itineraries from the US. Run a search from your home airport to see every option.`,
    },
    {
      question: `How much are flights to ${entry.city}?`,
      answer: minFare
        ? `Over the next three months, the lowest round-trip fare we track to ${entry.city} is ${formatMoney(minFare)} per traveler including taxes and fees. Fares vary by departure city, day of week and how far ahead you book — see each route page for the cheapest month.`
        : `Fares to ${entry.city} depend on your departure city, dates and how far ahead you book. Search your route for live prices and set a free price alert to be emailed when fares drop.`,
    },
    ...(guide ? [{ question: `When is the best time to visit ${entry.city}?`, answer: guide.bestTimeToVisit }] : []),
  ];

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ name: `Flights to ${entry.city}`, description: `Cheap flights to ${entry.city} — fares, airlines and routes.`, path }),
          faqPageJsonLd(faqs),
          ...(guide ? [touristDestinationJsonLd({ name: guide.city, description: guide.summary, path: destinationPath(guide.slug), countryCode: guide.countryCode })] : []),
        ]}
      />
      <PageHeader
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Flights to", path: "/flights-to" },
          { name: entry.city, path },
        ]}
        eyebrow={`${loc} · ${airports.map((a) => a.iata).join(", ")}`}
        title={`Cheap flights to ${entry.city}`}
        lead={
          <>
            {minFare ? `Round trips from ${formatMoney(minFare)} per traveler, taxes and fees included. ` : ""}
            Compare fares from every US city, see which airlines fly nonstop, and pick the cheapest month to travel.
          </>
        }
      >
        <SearchForm variant="compact" initial={{ destination: primary.iata }} />
      </PageHeader>

      {guide && (
        <section className="container-page py-10">
          <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card lg:grid-cols-[18rem_1fr]">
            <div className="aspect-[16/9] lg:aspect-auto">
              <DestinationArt theme={guide.heroTheme} gradient={guide.gradient} seed={guide.slug} />
            </div>
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-ocean-700">Destination guide</p>
              <h2 className="mt-1 text-xl sm:text-2xl">
                {guide.city}: {guide.tagline}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{guide.summary}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {guide.highlights.slice(0, 4).map((h) => (
                  <li key={h.title} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {h.title}
                  </li>
                ))}
              </ul>
              <Link href={destinationPath(guide.slug)} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ocean-700 hover:underline">
                Read the {guide.city} travel guide <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="bg-white py-12">
        <div className="container-page">
          <SectionHeading title={`Popular routes to ${entry.city}`} description="Lowest round-trip fares we found over the next three months, per traveler with taxes and fees. Select a route for airlines, flight times and fares by month." />
          {routeItems.length ? <RouteLinks className="mt-6" routes={routeItems} columns={3} ariaLabel={`Routes to ${entry.city}`} /> : <p className="mt-4 text-sm text-slate-500">Search from your home airport to see routes to {entry.city}.</p>}
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <SectionHeading title={`Airports in ${entry.city}`} as="h2" />
            <LinkCardGrid className="mt-5" items={airportItems} columns={2} ariaLabel={`Airports serving ${entry.city}`} />
          </div>
          {carriers.length > 0 && (
            <div>
              <SectionHeading title={`Airlines flying to ${entry.city}`} as="h2" description="Carriers with nonstop service on the routes above." />
              <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {carriers.map((c) => (
                  <li key={c.iata}>
                    <Link href={`/airlines/${c.slug}`} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 transition hover:border-ocean-300 hover:shadow-card">
                      <AirlineLogo iata={c.iata} size={32} />
                      <span className="truncate text-sm font-semibold text-navy-900">{c.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container-page max-w-3xl">
          <h2 className="text-2xl sm:text-3xl">Flying to {entry.city}: common questions</h2>
          <div className="mt-6">
            <FaqAccordion items={faqs} idPrefix="city-faq" />
          </div>
        </div>
      </section>
    </>
  );
}
