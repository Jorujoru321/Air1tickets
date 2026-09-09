import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowLeftRight, ArrowRight, Lightbulb, MapPin } from "lucide-react";
import { SearchForm } from "@/components/search";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/seo/FaqAccordion";
import { PageHeader } from "@/components/seo/PageHeader";
import { SectionHeading } from "@/components/seo/SectionHeading";
import { RouteFacts } from "@/components/seo/RouteFacts";
import { FareByMonth } from "@/components/seo/FareByMonth";
import { FareCta } from "@/components/seo/FareCta";
import { AirlineList } from "@/components/seo/AirlineList";
import { RouteLinks, type RouteLinkItem } from "@/components/seo/RouteLinks";
import { LinkCardGrid, type LinkCardItem } from "@/components/seo/LinkCardGrid";
import { AirlineLogo } from "@/components/results/AirlineLogo";
import { Button } from "@/components/ui/Button";
import { routeFaqs, routeTips } from "@/components/seo/route-copy";
import { fitDescription, fitTitle, formatMiles, joinNames } from "@/components/seo/seo-text";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqPageJsonLd, flightRouteJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { airportPath, flightsFromPath, flightsToPath, parseRouteSlug, routePath, routeSlug } from "@/lib/seo/slugs";
import { describeRoute, lowestRouteFare, nonstopCarriers, type RouteInfo } from "@/lib/flights/route-info";
import { buildSearchUrl, defaultTripDates } from "@/lib/flights/search-params";
import type { Airport } from "@/lib/flights/types";
import { ALL_DIRECTIONAL_ROUTES, getRoutesFrom, getRoutesTo } from "@/data/routes";
import { AIRPORTS_BY_METRO, getAirport } from "@/data/airports";
import { getDestinationByAirport } from "@/data/destinations";
import { destinationPath } from "@/lib/seo/slugs";
import { addDays, formatDuration, formatMoney } from "@/lib/utils";

export const revalidate = 21600;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ route: string }>;
}

export function generateStaticParams(): { route: string }[] {
  const seen = new Set<string>();
  const out: { route: string }[] = [];
  for (const r of ALL_DIRECTIONAL_ROUTES) {
    const slug = routeSlug(r.origin, r.destination);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push({ route: slug });
  }
  return out;
}

const getInfo = cache((origin: string, destination: string) => describeRoute(origin, destination));

function resolve(slug: string): { origin: Airport; destination: Airport; canonical: string } | null {
  const parsed = parseRouteSlug(slug.toLowerCase());
  if (!parsed) return null;
  return { ...parsed, canonical: routeSlug(parsed.origin, parsed.destination) };
}

function deepLink(origin: string, destination: string, depart?: string): string {
  const dates = defaultTripDates();
  const departDate = depart ?? dates.depart;
  return buildSearchUrl({ origin, destination, departDate, returnDate: addDays(departDate, 7), passengers: { adults: 1, children: 0, infants: 0 }, cabin: "economy" });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { route } = await params;
  const r = resolve(route);
  if (!r) return { title: "Route not found", robots: { index: false, follow: false } };
  const info = await getInfo(r.origin.iata, r.destination.iata);
  if (!info) return { title: "Route not found", robots: { index: false, follow: false } };
  const O = info.origin.city;
  const D = info.destination.city;
  const price = info.lowestFare ? formatMoney(info.lowestFare.price) : null;
  const title = fitTitle([
    ...(price ? [`Cheap Flights from ${O} to ${D} from ${price}`] : []),
    `Cheap Flights from ${O} to ${D}`,
    ...(price ? [`${O} to ${D} Flights from ${price}`] : []),
    `${O} to ${D} Flights`,
    `${info.origin.iata} to ${info.destination.iata} Flights`,
  ]);
  const airlineNames = info.nonstopAirlines.slice(0, 3).map((a) => a.name.replace(/ Air Lines$| Airlines$/, ""));
  const description = fitDescription([
    `Compare cheap flights from ${O} (${info.origin.iata}) to ${D} (${info.destination.iata}).`,
    info.nonstopAirlines.length ? `${formatMiles(info.distanceMiles)}, ${formatDuration(info.typicalDurationMinutes)} nonstop on ${joinNames(airlineNames)}.` : `${formatMiles(info.distanceMiles)}, about ${formatDuration(info.typicalDurationMinutes)} in the air plus a connection.`,
    price ? `Round trips from ${price}${info.cheapestMonth ? `, cheapest in ${info.cheapestMonth.label}` : ""}.` : "See fares by month and the best day to fly.",
    "Book with 24/7 US-based support.",
  ]);
  return buildMetadata({ title, description, path: routePath(info.origin, info.destination), keywords: [`${O} to ${D} flights`, `cheap flights ${O} to ${D}`, `${info.origin.iata} to ${info.destination.iata}`] });
}

function metroAlternatives(a: Airport): Airport[] {
  if (!a.metro) return [];
  return (AIRPORTS_BY_METRO[a.metro] ?? []).filter((x) => x.iata !== a.iata);
}

function AlternativeAirports({ info, slug }: { info: RouteInfo; slug: string }) {
  const { origin, destination } = info;
  const originAlts = metroAlternatives(origin);
  const destAlts = metroAlternatives(destination);
  if (!originAlts.length && !destAlts.length) return null;

  const build = (alt: Airport, side: "origin" | "destination"): LinkCardItem => {
    const o = side === "origin" ? alt : origin;
    const d = side === "origin" ? destination : alt;
    const carriers = nonstopCarriers(o, d);
    const sibling = routeSlug(o, d);
    const href = sibling && sibling !== slug ? routePath(o, d) : deepLink(o.iata, d.iata);
    return {
      key: `${side}-${alt.iata}`,
      href,
      title: `${o.city} (${o.iata}) to ${d.city} (${d.iata})`,
      subtitle: carriers.length ? `${carriers.length} ${carriers.length === 1 ? "airline flies" : "airlines fly"} nonstop · ${alt.name}` : `Connecting flights only · ${alt.name}`,
      leading: (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-navy-900" aria-hidden>
          {alt.iata}
        </span>
      ),
    };
  };

  return (
    <section className="bg-white py-12">
      <div className="container-page">
        <SectionHeading
          title="Which airport should I use?"
          description={`${origin.city}${originAlts.length ? ` has ${originAlts.length + 1} airports` : ""}${originAlts.length && destAlts.length ? " and " : ""}${destAlts.length ? `${destination.city} has ${destAlts.length + 1} airports` : ""}. Fares can differ by $50 to $150 round trip between them, so check the alternatives before you book.`}
        />
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          {originAlts.length > 0 && (
            <div>
              <h3 className="text-lg">Other departure airports near {origin.city}</h3>
              <LinkCardGrid className="mt-3" columns={2} items={originAlts.map((a) => build(a, "origin"))} ariaLabel={`Alternative departure airports near ${origin.city}`} />
            </div>
          )}
          {destAlts.length > 0 && (
            <div>
              <h3 className="text-lg">Other arrival airports near {destination.city}</h3>
              <LinkCardGrid className="mt-3" columns={2} items={destAlts.map((a) => build(a, "destination"))} ariaLabel={`Alternative arrival airports near ${destination.city}`} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

async function RelatedRoutes({ info }: { info: RouteInfo }) {
  const { origin, destination } = info;
  const pick = (list: { origin: string; destination: string; popular?: boolean }[], exclude: (r: { origin: string; destination: string }) => boolean) =>
    [...list]
      .filter((r) => !exclude(r))
      .sort((a, b) => Number(Boolean(b.popular)) - Number(Boolean(a.popular)))
      .slice(0, 8);
  const fromOrigin = pick(getRoutesFrom(origin.iata), (r) => r.destination === destination.iata);
  const toDestination = pick(getRoutesTo(destination.iata), (r) => r.origin === origin.iata);
  const all = [...fromOrigin, ...toDestination];
  const fares = await Promise.all(all.map((r) => lowestRouteFare(r.origin, r.destination)));
  const toItems = (list: typeof all, offset: number): RouteLinkItem[] => {
    const items: RouteLinkItem[] = [];
    list.forEach((r, i) => {
      const o = getAirport(r.origin);
      const d = getAirport(r.destination);
      if (o && d) items.push({ origin: o, destination: d, price: fares[offset + i]?.price ?? null });
    });
    return items;
  };
  return (
    <section className="container-page py-12">
      <SectionHeading title="Related routes" description="Other popular city pairs from the same departure city and to the same destination, with the lowest round-trip fares we found." />
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        {fromOrigin.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-lg">More flights from {origin.city}</h3>
              <Link href={flightsFromPath(origin)} className="text-sm font-semibold text-ocean-700 hover:underline">
                All routes
              </Link>
            </div>
            <RouteLinks className="mt-3" columns={2} routes={toItems(fromOrigin, 0)} ariaLabel={`More routes from ${origin.city}`} />
          </div>
        )}
        {toDestination.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-lg">More flights to {destination.city}</h3>
              <Link href={flightsToPath(destination)} className="text-sm font-semibold text-ocean-700 hover:underline">
                All routes
              </Link>
            </div>
            <RouteLinks className="mt-3" columns={2} routes={toItems(toDestination, fromOrigin.length)} ariaLabel={`More routes to ${destination.city}`} />
          </div>
        )}
      </div>
    </section>
  );
}

export default async function RoutePage({ params }: PageProps) {
  const { route } = await params;
  const r = resolve(route);
  if (!r) notFound();
  if (r.canonical && r.canonical !== route) permanentRedirect(`/cheap-flights/${r.canonical}`);
  const info = await getInfo(r.origin.iata, r.destination.iata);
  if (!info) notFound();

  const { origin, destination } = info;
  const path = routePath(origin, destination);
  const searchHref = deepLink(origin.iata, destination.iata, info.lowestFare?.date);
  const faqs = routeFaqs(info);
  const tips = routeTips(info);
  const guide = getDestinationByAirport(destination.iata);
  const reverse = getAirport(destination.iata) && getAirport(origin.iata) ? routePath(destination, origin) : null;

  const jsonLd = [
    webPageJsonLd({ name: `Cheap flights from ${origin.city} to ${destination.city}`, description: `Fares, airlines and flight times from ${origin.iata} to ${destination.iata}.`, path }),
    ...(info.lowestFare
      ? [
          flightRouteJsonLd({
            originName: origin.name,
            originCode: origin.iata,
            destinationName: destination.name,
            destinationCode: destination.iata,
            lowestPrice: info.lowestFare.price,
            path,
            airlines: info.nonstopAirlines.map((a) => a.name),
          }),
        ]
      : []),
    faqPageJsonLd(faqs),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHeader
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Cheap flights", path: "/cheap-flights" },
          { name: `${origin.city} to ${destination.city}`, path },
        ]}
        eyebrow={info.isDomestic ? "Domestic route" : "International route"}
        title={
          <>
            Cheap flights from {origin.city} to {destination.city}
          </>
        }
        lead={
          <>
            <Link href={airportPath(origin)} className="font-medium text-navy-900 underline decoration-slate-300 underline-offset-4 hover:decoration-ocean-500">
              {origin.name} ({origin.iata})
            </Link>{" "}
            to{" "}
            <Link href={airportPath(destination)} className="font-medium text-navy-900 underline decoration-slate-300 underline-offset-4 hover:decoration-ocean-500">
              {destination.name} ({destination.iata})
            </Link>
            . {formatMiles(info.distanceMiles)}, {info.nonstopAirlines.length ? `${formatDuration(info.typicalDurationMinutes)} nonstop` : "connecting flights only"}.
          </>
        }
      >
        <SearchForm variant="compact" initial={{ origin: origin.iata, destination: destination.iata }} />
      </PageHeader>

      <section className="container-page py-12">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
          <div>
            <SectionHeading title={`${origin.iata} to ${destination.iata} at a glance`} description="Computed from airline schedules and the fares we track for this route. Refreshed several times a day." />
            <div className="mt-5">
              <RouteFacts info={info} />
            </div>
          </div>
          <FareCta lowest={info.lowestFare} cheapestMonth={info.cheapestMonth} href={searchHref} originCity={origin.city} destinationCity={destination.city} className="lg:sticky lg:top-24" />
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container-page">
          <SectionHeading
            id="fares-by-month"
            title={`${origin.city} to ${destination.city} fares by month`}
            description="Lowest round-trip economy fare per traveler in each of the next six months, taxes and fees included. Select a month to search that date."
          />
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <FareByMonth months={info.lowestFares} origin={origin.iata} destination={destination.iata} />
            <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-base">Cheapest day of the week</h3>
              {info.weekdayFares.length ? (
                <>
                  <ul className="mt-3 space-y-2">
                    {info.weekdayFares.map((w) => {
                      const max = Math.max(...info.weekdayFares.map((x) => x.averagePrice));
                      const cheapest = w.label === info.cheapestDayOfWeek;
                      return (
                        <li key={w.day} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-2 text-sm">
                          <span className={cheapest ? "font-semibold text-navy-900" : "text-slate-600"}>{w.label.slice(0, 3)}</span>
                          <span className="h-2 overflow-hidden rounded-full bg-slate-200" aria-hidden>
                            <span className={`block h-full rounded-full ${cheapest ? "bg-success-500" : "bg-navy-300"}`} style={{ width: `${Math.max(10, Math.round((w.averagePrice / max) * 100))}%` }} />
                          </span>
                          <span className="tabular-nums text-slate-700">{formatMoney(w.averagePrice)}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mt-3 text-xs text-slate-500">Average lowest fare by departure day over the next three months.</p>
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-500">Not enough fare data yet for this route.</p>
              )}
            </aside>
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div>
            <SectionHeading
              title={`Airlines flying ${origin.city} to ${destination.city}`}
              description={
                info.nonstopAirlines.length
                  ? `${info.nonstopAirlines.length} ${info.nonstopAirlines.length === 1 ? "airline flies" : "airlines fly"} nonstop with ${info.flightsPerDay} departures a day combined${info.airlines.length > info.nonstopAirlines.length ? `, plus ${info.airlines.length - info.nonstopAirlines.length} more with one stop` : ""}.`
                  : `No nonstop service: ${info.airlines.length} ${info.airlines.length === 1 ? "airline offers" : "airlines offer"} one-stop itineraries.`
              }
            />
            <div className="mt-5">
              {info.airlines.length ? <AirlineList items={info.airlines} /> : <p className="text-sm text-slate-500">We don&apos;t have schedule data for this pair yet. Run a search to see live options.</p>}
            </div>
          </div>
          <div>
            <SectionHeading title="Connecting options" description={info.connectingHubs.length ? "Hubs where one airline can carry you on both legs, most choices first." : "Every itinerary on this route is nonstop or uses an unusual connection; run a search for specifics."} />
            {info.connectingHubs.length > 0 && (
              <ul className="mt-5 space-y-3">
                {info.connectingHubs.map((code) => {
                  const hub = getAirport(code);
                  const carriers = info.connectionsByHub[code] ?? [];
                  return (
                    <li key={code} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-900 font-display text-sm font-extrabold text-white" aria-hidden>
                        {code}
                      </span>
                      <span className="min-w-0 flex-1">
                        <Link href={airportPath(code)} className="block truncate text-sm font-semibold text-navy-900 hover:underline">
                          {hub ? `${hub.city} (${code})` : code}
                        </Link>
                        <span className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                          <span className="flex -space-x-1">
                            {carriers.slice(0, 4).map((c) => (
                              <AirlineLogo key={c} iata={c} size={20} className="ring-2 ring-white" />
                            ))}
                          </span>
                          {carriers.length} {carriers.length === 1 ? "airline" : "airlines"}
                        </span>
                      </span>
                      <MapPin className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </section>

      <AlternativeAirports info={info} slug={r.canonical} />

      <section className="container-page py-12">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sunrise-50 text-sunrise-700">
                <Lightbulb className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="text-2xl">Tips for this route</h2>
            </div>
            <ul className="mt-5 space-y-4 text-sm leading-relaxed text-slate-700">
              {tips.map((t, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ocean-500" aria-hidden />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            {guide && (
              <Link href={destinationPath(guide.slug)} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:border-ocean-300 hover:shadow-card-hover">
                <p className="text-xs font-semibold uppercase tracking-wide text-ocean-700">Destination guide</p>
                <p className="mt-1 font-display text-xl font-bold text-navy-900 group-hover:underline">{guide.city}: {guide.tagline}</p>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">{guide.summary}</p>
                <p className="mt-3 text-sm text-slate-500">Best time to visit: {guide.bestTimeToVisit}</p>
              </Link>
            )}
            {reverse && (
              <Link href={reverse} className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:border-ocean-300 hover:shadow-card-hover">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
                  <ArrowLeftRight className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-navy-900 group-hover:underline">
                    Flying the other way? {destination.city} to {origin.city}
                  </span>
                  <span className="block text-sm text-slate-600">
                    Fares, airlines and tips for {destination.iata} to {origin.iata}.
                  </span>
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-ocean-600" aria-hidden />
              </Link>
            )}
            <div className="rounded-2xl bg-navy-900 p-6 text-white">
              <p className="font-display text-lg font-bold">Ready to compare live fares?</p>
              <p className="mt-1 text-sm text-white/75">See every airline on {origin.iata}–{destination.iata} side by side with bags and seat rules spelled out.</p>
              <Button href={searchHref} className="mt-4" size="md" rightIcon={<ArrowRight className="h-4 w-4" aria-hidden />}>
                Search {origin.city} to {destination.city}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container-page max-w-3xl">
          <h2 className="text-2xl sm:text-3xl">
            {origin.city} to {destination.city}: common questions
          </h2>
          <div className="mt-6">
            <FaqAccordion items={faqs} idPrefix="route-faq" />
          </div>
        </div>
      </section>

      <RelatedRoutes info={info} />
    </>
  );
}
