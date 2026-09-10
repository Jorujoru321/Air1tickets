import Link from "next/link";
import { ArrowRight, BadgeDollarSign, Clock, Lock, MessageCircle, Search, ShieldCheck, Tag } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/seo/PageHeader";
import { SectionHeading } from "@/components/seo/SectionHeading";
import { FaqAccordion } from "@/components/seo/FaqAccordion";
import { ChatButtons } from "@/components/leads/ChatButtons";
import { Button } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqPageJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { routePath } from "@/lib/seo/slugs";
import { getFaqGroup } from "@/data/faqs";
import { POPULAR_ROUTES } from "@/data/routes";
import { getAirport } from "@/data/airports";
import { site } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Price Lock — Hold a Low Fare Free, Get a Last-Minute Deal",
  description: `Found a cheap flight? Lock the price free for ${site.priceLock.hours} hours, no card needed. Our US-based agents re-check every airline 1–2 days before you fly and send your final last-minute deal on WhatsApp. Pay only when you accept.`,
  path: "/price-lock",
  keywords: ["price lock flights", "hold airfare", "last minute flight deals", "lock in flight price", "cheap flights whatsapp"],
});

const STEPS = [
  { icon: Search, title: "Find a fare you like", text: "Search 500+ airlines from any US airport. Every result shows the true total with taxes and what the fare includes." },
  { icon: Lock, title: "Lock it — free, 30 seconds", text: `Tap "Lock this price", leave your name and WhatsApp number. We hold that exact itinerary and price for ${site.priceLock.hours} hours. No card, no commitment.` },
  { icon: MessageCircle, title: "An agent confirms with you", text: `Within about ${site.priceLock.responseMinutes} minutes during business hours you get a message with your reference, the itinerary and any smarter options (nearby airports, better dates).` },
  { icon: Tag, title: "Get your last-minute deal", text: "1–2 days before departure we re-shop every airline for your route and send your final quote — the locked price is the most you'll pay, and it's often less." },
  { icon: ShieldCheck, title: "Accept, pay, fly", text: "Say yes, pay through a secure link, and your e-ticket and airline confirmation code land in your inbox." },
];

const WHY = [
  { icon: BadgeDollarSign, title: "A ceiling, not a guess", text: "Your locked fare is the maximum you pay for that itinerary. If prices drop, you pay less; if they rise, you're covered." },
  { icon: Clock, title: "We do the watching", text: "Fares move up to the last day. Our agents track your route so you don't have to refresh a search every morning." },
  { icon: MessageCircle, title: "A person, not a bot", text: "US-based agents on WhatsApp, Messenger or the phone who can see every airline's availability and rebook you if anything changes." },
];

export default function PriceLockPage() {
  const faqs = getFaqGroup("price-lock")?.items ?? [];
  const examples = POPULAR_ROUTES.slice(0, 6)
    .map((r) => ({ o: getAirport(r.origin), d: getAirport(r.destination) }))
    .filter((x): x is { o: NonNullable<typeof x.o>; d: NonNullable<typeof x.d> } => Boolean(x.o && x.d));
  return (
    <>
      <JsonLd data={[webPageJsonLd({ name: "Price lock", description: metadata.description ?? "", path: "/price-lock" }), faqPageJsonLd(faqs)]} />
      <PageHeader
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Price lock", path: "/price-lock" },
        ]}
        eyebrow="How Air1 works"
        title="Lock a low fare now. Pay less later."
        lead={`See a cheap flight? Lock the price free — no card — and let our agents find you a last-minute deal one to two days before you fly. You only pay when you accept.`}
        aside={
          <div className="flex flex-col gap-2">
            <Button href="/flights" size="lg" rightIcon={<ArrowRight className="h-4 w-4" aria-hidden />}>
              Find a fare to lock
            </Button>
            <ChatButtons size="sm" showMessenger={false} whatsappLabel="Or just WhatsApp us" />
          </div>
        }
      />

      <section className="container-page py-12">
        <SectionHeading title="Five steps, one message thread" description="Everything happens on the channel you choose. Most travelers never fill in anything more than a name and a number." />
        <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sunrise-500 font-display text-sm font-extrabold text-navy-950">{i + 1}</span>
                <s.icon className="h-5 w-5 text-ocean-600" aria-hidden />
              </div>
              <p className="mt-4 font-bold text-navy-900">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-white py-12">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <SectionHeading title="Why lock instead of booking on the spot?" />
            <ul className="mt-6 space-y-4">
              {WHY.map((w) => (
                <li key={w.title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
                    <w.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-bold text-navy-900">{w.title}</span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-slate-600">{w.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-navy-950 p-6 text-white sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-ocean-200">Example</p>
            <p className="mt-2 font-display text-2xl font-extrabold">You lock $287 New York → Los Angeles</p>
            <ol className="mt-5 space-y-3 text-sm text-white/85">
              <li className="flex gap-3">
                <span className="font-mono text-ocean-300">Day 0</span> Lock confirmed on WhatsApp, reference L-7K2M9Q. Ceiling: $287 per traveler.
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-ocean-300">Day 12</span> Agent flags a nonstop on the same dates for $246. You say &ldquo;hold that&rdquo;.
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-ocean-300">Day 26</span> 48 hours before departure: final last-minute quote $231. You accept and pay via secure link.
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-ocean-300">Day 28</span> You fly. E-ticket and airline code were emailed the moment you paid.
              </li>
            </ol>
            <p className="mt-5 text-xs text-white/60">Illustrative example. Final prices depend on airline availability at the time of ticketing; your locked price is always the maximum.</p>
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <SectionHeading title="Popular routes to lock this week" description="Start from a route page to see the lowest fares by month, then lock the one you like." link={{ href: "/cheap-flights", label: "All routes" }} />
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {examples.map(({ o, d }) => (
            <li key={`${o.iata}-${d.iata}`}>
              <Link href={routePath(o, d)} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-xs transition hover:border-ocean-300 hover:shadow-card">
                <span className="text-sm font-semibold text-navy-900">
                  {o.city} to {d.city}
                </span>
                <ArrowRight className="h-4 w-4 text-ocean-600" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white py-12">
        <div className="container-page max-w-3xl">
          <SectionHeading id="faq" title="Price lock: common questions" />
          <FaqAccordion className="mt-6" items={faqs} idPrefix="lock-faq" />
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-sunrise-500 px-6 py-10 text-center text-navy-950 sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="text-2xl text-navy-950">Ready to lock a fare?</h2>
            <p className="mt-1 text-navy-900/85">Search once, lock what you like, and let an agent do the rest.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button href="/flights" variant="secondary" size="lg">
              Search flights
            </Button>
            <ChatButtons showMessenger={false} whatsappLabel="WhatsApp an agent" />
          </div>
        </div>
      </section>
    </>
  );
}
