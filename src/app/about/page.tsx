import Link from "next/link";
import { BadgeDollarSign, Headset, Lock, ShieldCheck, Users } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/seo/PageHeader";
import { DestinationArt } from "@/components/marketing/DestinationArt";
import { Button } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/jsonld";
import { site } from "@/lib/site";
import { TEAM_PHOTO } from "@/data/photos";
import { contactHref } from "@/lib/leads/chat-links";

export const metadata = buildMetadata({
  title: "About Air1 Tickets — A US Travel Agency With Real People",
  description: "Air1 Tickets is a US-based online travel agency founded in 2018. We compare 500+ airlines, show the true total price and back every booking with 24/7 US-based support.",
  path: "/about",
});

const VALUES = [
  { icon: BadgeDollarSign, title: "Lock the fare, then we beat it", text: "Found a low fare? Lock it free. Your locked price is the most you'll pay, and 1–2 days before departure our agents re-shop every airline and send you a last-minute deal." },
  { icon: Headset, title: "Humans, 24/7, in the United States", text: "Flight cancelled at 2am? A real agent picks up, sees every airline's availability and rebooks you. No overseas call queues." },
  { icon: ShieldCheck, title: "Your rights, built in", text: "Free cancellation within 24 hours of booking, DOT-compliant refunds, and plain-English fare rules on every result." },
  { icon: Lock, title: "Secure by design", text: "Card payments are processed by a PCI-compliant processor and never stored on our servers. Your data stays yours." },
];

const MILESTONES = [
  { year: "2018", text: `${site.legalName} founded in San Francisco by a small team of former airline and travel-tech people who were tired of hidden fees.` },
  { year: "2020", text: "24-hour free cancellation extended to every fare we sell, ahead of the industry, during the pandemic." },
  { year: "2023", text: "Fare-family comparison launched: Basic, Main and Flexible shown side by side with bag and seat rules." },
  { year: "2025", text: "Live fare calendars and route guides for more than 800 city pairs, refreshed several times a day." },
  { year: "2026", text: "New booking platform with fare re-pricing, calendar export and self-service cancellations." },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={webPageJsonLd({ name: `About ${site.name}`, description: metadata.description ?? "", path: "/about", type: "AboutPage" })} />
      <PageHeader crumbs={[{ name: "Home", path: "/" }, { name: "About", path: "/about" }]} eyebrow={`Founded ${site.founded} · ${site.address.addressLocality}, ${site.address.addressRegion}`} title="A travel agency that shows its work" lead="We started Air1 Tickets because booking a flight had become an exercise in decoding fees. Our answer is simple: compare every airline, show the true total, explain the fare, and put a person on the phone when things go wrong." />

      <section className="container-page py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="prose-air1">
            <h2 className="text-2xl sm:text-3xl">What we do</h2>
            <p>Air1 Tickets is an online travel agency based in the United States. We search fares from more than 500 airlines — the legacy carriers, the low-cost airlines and the international partners — and present them in one results page sorted by what matters: value, price or speed.</p>
            <p>We work differently from a self-service booking site. You lock the fare you like, free and with no card. An agent confirms it with you on WhatsApp, Messenger or by phone, then watches the route and sends you a final, last-minute deal one to two days before departure. When you accept, we issue the ticket with the airline and stay responsible for the reservation: one number to message for changes, cancellations and irregular operations.</p>
            <p>We make money from commissions and incentives paid by airlines and from optional extras you choose at checkout, such as travel protection. When a service fee applies, it is shown as its own line before you pay.</p>
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-card">
            <DestinationArt theme="city" gradient={["#0b1d3a", "#2f93ef"]} seed="about-air1" />
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container-page">
          <h2 className="text-2xl sm:text-3xl">Why book with Air1</h2>
          <ul className="mt-6 grid gap-5 md:grid-cols-2">
            {VALUES.map((v) => (
              <li key={v.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
                  <v.icon className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-lg font-bold text-navy-900">{v.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-slate-600">{v.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="text-2xl sm:text-3xl">Our story</h2>
            <ol className="mt-6 space-y-5 border-l-2 border-ocean-100 pl-6">
              {MILESTONES.map((m) => (
                <li key={m.year} className="relative">
                  <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-ocean-500 ring-4 ring-white" aria-hidden />
                  <p className="text-sm font-bold text-ocean-700">{m.year}</p>
                  <p className="mt-0.5 text-sm text-slate-700">{m.text}</p>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl">Who you&apos;re messaging</h2>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              {TEAM_PHOTO ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={TEAM_PHOTO} alt={`The ${site.name} team`} className="aspect-[4/3] w-full rounded-xl object-cover" loading="lazy" />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sunrise-50 text-sunrise-700">
                  <Users className="h-5 w-5" aria-hidden />
                </span>
              )}
              <p className="mt-4 text-slate-700">
                When you message {site.name} you reach a person, not a queue. We are a small US-based agency, which is the point: the agent who quotes your trip is the one who rebooks you when a flight moves, and you keep the same thread rather than starting again with a call centre.
              </p>
              <p className="mt-3 text-slate-700">
                We don&apos;t publish invented review scores, booking counts or testimonials. What we promise is on every page: the total price up front, the fare rules in plain English, and someone who answers.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button href={contactHref()} variant="secondary">
                  Contact us
                </Button>
                <Button href="/help" variant="outline">
                  Help center
                </Button>
              </div>
            </div>
            <p className="mt-6 text-sm text-slate-500">
              {site.legalName} · {site.address.streetAddress}, {site.address.addressLocality}, {site.address.addressRegion} {site.address.postalCode} ·{" "}
              <Link href="/legal/terms" className="underline">
                Terms
              </Link>{" "}
              ·{" "}
              <Link href="/legal/privacy" className="underline">
                Privacy
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
