import Link from "next/link";
import { ArrowRight, BadgePercent, CalendarClock, MapPinned, ShieldCheck } from "lucide-react";
import { SearchForm } from "@/components/search";
import { AirlineLogo } from "@/components/results/AirlineLogo";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqPageJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { airlinePath, routePath } from "@/lib/seo/slugs";
import { POPULAR_ROUTES } from "@/data/routes";
import { US_AIRLINES } from "@/data/airlines";
import { getAirport } from "@/data/airports";
import { getFaqGroup } from "@/data/faqs";
import { FaqAccordion } from "@/components/seo/FaqAccordion";

export const metadata = buildMetadata({
  title: "Cheap Flights — Compare & Book Airline Tickets",
  description: "Search cheap flights from every US airport. Compare 500+ airlines side by side, filter by stops and bags, and book with 24/7 US-based support.",
  path: "/flights",
});

const TIPS = [
  { icon: CalendarClock, title: "Book 1–3 months ahead", text: "Domestic fares are usually lowest 3–8 weeks before departure; international 2–5 months. Prices climb fast inside 14 days." },
  { icon: BadgePercent, title: "Fly Tuesday, Wednesday or Saturday", text: "Mid-week and Saturday departures typically cost 8–15% less than Friday and Sunday on the same route." },
  { icon: MapPinned, title: "Check nearby airports", text: "Flying from Newark instead of JFK, or into Oakland instead of San Francisco, can cut fares by $50–$150 round trip." },
  { icon: ShieldCheck, title: "Compare the total, not the base fare", text: "Basic fares can add $70–$150 in bag and seat fees. We show what's included so you can compare like for like." },
];

export default async function FlightsHubPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const { from, to } = await searchParams;
  const initial = from || to ? { origin: from?.toUpperCase(), destination: to?.toUpperCase() } : undefined;
  const faqs = getFaqGroup("booking")?.items.slice(0, 6) ?? [];
  return (
    <>
      <JsonLd data={[webPageJsonLd({ name: "Cheap flights", description: metadata.description ?? "", path: "/flights" }), faqPageJsonLd(faqs)]} />
      <section className="bg-navy-950 bg-[radial-gradient(ellipse_at_top_left,rgba(47,147,239,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,107,53,0.18),transparent_50%)] pb-16 pt-12 text-white sm:pb-20 sm:pt-16">
        <div className="container-page">
          <h1 className="max-w-3xl text-3xl text-white sm:text-4xl lg:text-5xl">Search cheap flights</h1>
          <p className="mt-3 max-w-2xl text-base text-white/75 sm:text-lg">Compare fares from 500+ airlines, see the true total with taxes and fees, and book in minutes.</p>
          <div className="mt-8">
            <SearchForm variant="hero" initial={initial} />
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl">Popular routes from the US</h2>
            <p className="mt-1 text-slate-600">The city pairs our travelers search most, with live fare tracking on every route page.</p>
          </div>
          <Link href="/cheap-flights" className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-ocean-700 hover:underline sm:inline-flex">
            All routes <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAR_ROUTES.slice(0, 18).map((r) => {
            const o = getAirport(r.origin);
            const d = getAirport(r.destination);
            if (!o || !d) return null;
            return (
              <li key={`${r.origin}-${r.destination}`}>
                <Link href={routePath(o, d)} className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-xs transition hover:border-ocean-300 hover:shadow-card">
                  <span>
                    <span className="block text-sm font-semibold text-navy-900">
                      {o.city} to {d.city}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {o.iata} → {d.iata} · {r.category === "domestic" ? "Domestic" : "International"}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-ocean-600" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="bg-white py-14">
        <div className="container-page">
          <h2 className="text-2xl sm:text-3xl">Top airlines we compare</h2>
          <p className="mt-1 text-slate-600">Legacy carriers, low-cost airlines and international partners, side by side in one search.</p>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {US_AIRLINES.map((al) => (
              <li key={al.iata}>
                <Link href={airlinePath(al.slug)} className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 transition hover:border-ocean-300 hover:shadow-card">
                  <AirlineLogo iata={al.iata} size={32} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-navy-900">{al.name}</span>
                    <span className="block text-xs text-slate-500">{al.lowCost ? "Low-cost" : "Full service"}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page py-14">
        <h2 className="text-2xl sm:text-3xl">How to find the cheapest flight</h2>
        <ul className="mt-6 grid gap-5 md:grid-cols-2">
          {TIPS.map((t) => (
            <li key={t.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
                <t.icon className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="block font-semibold text-navy-900">{t.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-slate-600">{t.text}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-slate-500">
          Want more? Read our guide to{" "}
          <Link href="/travel-guides/how-to-find-cheap-flights" className="font-medium text-ocean-700 hover:underline">
            finding cheap flights in 2026
          </Link>
          .
        </p>
      </section>

      <section className="bg-white py-14">
        <div className="container-page max-w-3xl">
          <h2 className="text-2xl sm:text-3xl">Searching and booking: common questions</h2>
          <div className="mt-6">
            <FaqAccordion items={faqs} />
          </div>
        </div>
      </section>
    </>
  );
}
