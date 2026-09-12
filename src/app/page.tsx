import Link from "next/link";
import { ArrowRight, BadgeDollarSign, Headset, Lock, MessageCircle, PlaneTakeoff, Search, ShieldCheck, Tag } from "lucide-react";
import { ChatButtons } from "@/components/leads/ChatButtons";
import { SearchTabs } from "@/components/search";
import { PartnerStrip } from "@/components/marketing/PartnerStrip";
import { HeroMedia } from "@/components/marketing/HeroMedia";
import { CaseStudies } from "@/components/marketing/CaseStudies";
import { destinationSuggestions } from "@/data/destinations";
import { PARTNERS } from "@/data/partners";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/seo/FaqAccordion";
import { DestinationArt } from "@/components/marketing/DestinationArt";
import { DestinationTile } from "@/components/marketing/home/DestinationTile";
import { Button } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqPageJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { articlePath, routePath } from "@/lib/seo/slugs";
import { lowestFare } from "@/lib/flights/deals";
import { buildSearchUrl } from "@/lib/flights/search-params";
import { POPULAR_ROUTES } from "@/data/routes";
import { POPULAR_DESTINATIONS } from "@/data/destinations";
import { getAirport } from "@/data/airports";
import { getFaqGroup } from "@/data/faqs";
import { ARTICLES } from "@/content/articles";
import { site } from "@/lib/site";
import { addDays, formatDateShort, formatMoney } from "@/lib/utils";

export const revalidate = 21600;

export const metadata = buildMetadata({
  title: "Cheap Flights, Hotels & Things to Do — Priced on WhatsApp",
  description: "Tell us where you're going and a US-based agent sends your price on WhatsApp in about 15 minutes. Flights from every US airport, hotels, resorts and tours — with last-minute deals you won't find online.",
  path: "/",
});

const TRUST = [
  { icon: Lock, title: "Lock any fare free", text: `No card. Held for ${site.priceLock.hours} hours.` },
  { icon: Tag, title: "Last-minute deals", text: "Final quote 1–2 days before you fly." },
  { icon: MessageCircle, title: "Agents on WhatsApp", text: `Reply in about ${site.priceLock.responseMinutes} minutes.` },
  { icon: BadgeDollarSign, title: "Pay only when you accept", text: "Your locked price is the most you'll pay." },
];

const WHY = [
  {
    icon: Lock,
    title: "Lock the fare, skip the panic",
    text: "See a price you like? Lock it in 30 seconds with just your name and number. We hold that itinerary and price — no card, no commitment.",
  },
  {
    icon: Tag,
    title: "We shop it again before you fly",
    text: "Fares move right up to departure. 1–2 days before you fly our agents re-check every airline and send your final, last-minute deal — usually below what you locked.",
  },
  {
    icon: Headset,
    title: "A real agent on WhatsApp",
    text: "US-based agents reply on WhatsApp, Messenger or the phone, can see every airline's availability, and rebook you if anything changes.",
  },
  {
    icon: Search,
    title: "500+ airlines, true totals",
    text: "Legacy carriers, low-cost airlines and international partners in one results page, with taxes, fees and bag rules shown before you lock.",
  },
];

async function TrendingRoutes() {
  const routes = POPULAR_ROUTES.slice(0, 12);
  const fares = await Promise.all(routes.map((r) => lowestFare(r.origin, r.destination, 60)));
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {routes.map((r, i) => {
        const o = getAirport(r.origin);
        const d = getAirport(r.destination);
        const fare = fares[i];
        if (!o || !d) return null;
        return (
          <li key={`${r.origin}-${r.destination}`}>
            <Link href={routePath(o, d)} className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-xs transition hover:border-ocean-300 hover:shadow-card">
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-navy-900">
                  {o.city} <span className="text-slate-500">→</span> {d.city}
                </span>
                <span className="block text-xs text-slate-500">
                  {o.iata} – {d.iata}
                  {fare ? ` · ${formatDateShort(fare.date)}` : ""}
                </span>
              </span>
              <span className="shrink-0 text-right">
                {fare && (
                  <span className="block text-sm font-bold tabular-nums text-navy-900">
                    from {formatMoney(fare.price)}
                  </span>
                )}
                <span className="block text-[11px] text-slate-500">round trip</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function HomePage() {
  const faqs = getFaqGroup("price-lock")?.items.slice(0, 5) ?? [];
  const destinations = POPULAR_DESTINATIONS.slice(0, 8);
  const articles = ARTICLES.slice(0, 3);
  const dealsDeepLink = (() => {
    const depart = addDays(new Date().toISOString().slice(0, 10), 21);
    return buildSearchUrl({ origin: "JFK", destination: "MIA", departDate: depart, returnDate: addDays(depart, 5), passengers: { adults: 1, children: 0, infants: 0 }, cabin: "economy" });
  })();

  return (
    <>
      <JsonLd data={[webPageJsonLd({ name: `${site.name} — cheap flights`, description: metadata.description ?? "", path: "/" }), faqPageJsonLd(faqs)]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <HeroMedia slot="home" theme="city" gradient={["#071229", "#1a75d8"]} seed="air1-hero" />
        <div className="container-page relative pb-10 pt-14 sm:pt-20">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ocean-200 backdrop-blur">
            <PlaneTakeoff className="h-3.5 w-3.5" aria-hidden /> US-based travel agency · real agents on WhatsApp
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl lg:text-6xl">Tell us where you&apos;re going. Get the price on WhatsApp.</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80 sm:text-xl">Flights, hotels and things to do. Fill in your trip, hit the button, and a real agent replies with a last-minute deal in about {site.priceLock.responseMinutes} minutes. Free, no account, no card.</p>
          <div className="mt-8">
            <SearchTabs suggestions={destinationSuggestions()} />
          </div>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map((t) => (
              <li key={t.title} className="flex items-center gap-3 text-sm">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-ocean-300">
                  <t.icon className="h-4 w-4" aria-hidden />
                </span>
                <span>
                  <span className="block font-semibold">{t.title}</span>
                  <span className="block text-xs text-white/65">{t.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CaseStudies kind="flight" />

      <PartnerStrip partners={PARTNERS.slice(0, 10)} title="Fares and rates compared across" subtitle="Brand names are shown for reference only. Air1 Tickets is an independent travel agency and is not affiliated with these companies." />

      {/* Popular destinations */}
      <section className="container-page py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl">Popular destinations</h2>
            <p className="mt-1 text-slate-600">Where US travelers are flying this season, with typical round-trip fares.</p>
          </div>
          <Link href="/destinations" className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-ocean-700 hover:underline sm:inline-flex">
            All destinations <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {destinations.map((d, i) => (
            <li key={d.slug}>
              <DestinationTile d={d} priority={i < 4} />
            </li>
          ))}
        </ul>
        <Link href="/destinations" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ocean-700 hover:underline sm:hidden">
          All destinations <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </section>

      {/* Trending routes */}
      <section className="bg-white py-14">
        <div className="container-page">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl">Trending routes this week</h2>
              <p className="mt-1 text-slate-600">Lowest round-trip fares per traveler over the next 60 days, taxes and fees included.</p>
            </div>
            <Link href="/cheap-flights" className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-ocean-700 hover:underline sm:inline-flex">
              All routes <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-6">
            <TrendingRoutes />
          </div>
        </div>
      </section>

      {/* Why Air1 */}
      <section className="container-page py-14">
        <h2 className="text-2xl sm:text-3xl">Why travelers choose Air1</h2>
        <ul className="mt-6 grid gap-5 md:grid-cols-2">
          {WHY.map((w) => (
            <li key={w.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
                <w.icon className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="block text-lg font-bold text-navy-900">{w.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-slate-600">{w.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section className="bg-navy-900 py-14 text-white">
        <div className="container-page">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl text-white sm:text-3xl">How it works</h2>
              <p className="mt-1 text-white/75">Three steps, one WhatsApp thread. You never pay until you say yes.</p>
            </div>
            <Link href="/price-lock" className="inline-flex items-center gap-1 text-sm font-semibold text-ocean-200 hover:text-white">
              Full details <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              ["Tell us the trip", "Fill in where you're going and when — flights, a hotel or something to do. One tap sends it to us on WhatsApp with everything already typed out."],
              [`A real agent replies`, `In about ${site.priceLock.responseMinutes} minutes you get a price, plus the cheaper options you'd never find yourself: a nearby airport, a date shifted by a day, a resort with more included.`],
              ["Lock it in, pay later", `Like a price? We hold it for ${site.priceLock.hours} hours free. Close to departure we re-shop it and send your final last-minute deal — you only pay when you accept.`],
            ].map(([title, text], i) => (
              <li key={title} className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sunrise-500 font-display text-sm font-extrabold text-navy-950">{i + 1}</span>
                <p className="mt-4 text-lg font-bold">{title}</p>
                <p className="mt-1 text-sm text-white/75">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Deals + guides */}
      <section className="container-page grid gap-8 py-14 lg:grid-cols-[1fr_1.4fr]">
        <div className="relative overflow-hidden rounded-2xl bg-navy-950 p-8 text-white">
          <div className="absolute inset-0 opacity-50" aria-hidden>
            <DestinationArt theme="beach" gradient={["#0b1d3a", "#1a75d8"]} seed="deals-teaser" />
          </div>
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-wide text-ocean-200">This week&apos;s deals</p>
            <h2 className="mt-2 text-2xl text-white sm:text-3xl">Fares refreshed every few hours</h2>
            <p className="mt-2 max-w-md text-sm text-white/80">See the cheapest dates to fly from your home airport in the next 90 days, or try a sample search to New York–Miami.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button href="/deals" variant="primary">
                See flight deals
              </Button>
              <Button href={dealsDeepLink} variant="white">
                Try a sample search
              </Button>
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl">Travel smarter</h2>
            <Link href="/travel-guides" className="shrink-0 text-sm font-semibold text-ocean-700 hover:underline">
              All guides
            </Link>
          </div>
          <ul className="mt-5 grid gap-4 sm:grid-cols-3">
            {articles.map((a) => (
              <li key={a.slug}>
                <Link href={articlePath(a.slug)} className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:shadow-card-hover">
                  <div className="aspect-[16/10]">
                    <DestinationArt theme={a.heroTheme} gradient={a.gradient} seed={a.slug} />
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ocean-700">{a.category}</p>
                    <p className="mt-1 line-clamp-2 font-semibold text-navy-900 group-hover:underline">{a.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{a.readingMinutes} min read</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-14">
        <div className="container-page max-w-3xl">
          <h2 className="text-2xl sm:text-3xl">Good to know before you lock</h2>
          <div className="mt-6">
            <FaqAccordion items={faqs} />
          </div>
          <p className="mt-4 text-sm text-slate-500">
            More questions? Visit the{" "}
            <Link href="/help" className="font-medium text-ocean-700 hover:underline">
              help center
            </Link>{" "}
            or call {site.supportPhone}.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container-page pb-16">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-sunrise-500 px-6 py-10 text-center text-navy-950 sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="text-2xl text-navy-950">Ready when you are</h2>
            <p className="mt-1 text-navy-900/85">Search once, lock what you like, and let an agent find your deal.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button href="/flights" variant="secondary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" aria-hidden />}>
              Search flights
            </Button>
            <ChatButtons showMessenger={false} whatsappLabel="WhatsApp an agent" />
          </div>
        </div>
      </section>
    </>
  );
}
