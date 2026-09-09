import { BellRing, MailCheck, TrendingDown } from "lucide-react";
import { PriceAlertForm } from "@/components/account/PriceAlertForm";
import { FaqAccordion } from "@/components/seo/FaqAccordion";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqPageJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getFaqGroup } from "@/data/faqs";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Flight Price Alerts — Get Notified When Fares Drop",
  description: "Track any route and travel dates. Air1 Tickets emails you when the fare drops so you book at the right moment — free, no account required.",
  path: "/price-alerts",
});

const STEPS = [
  { icon: BellRing, title: "Pick a route and dates", text: "Tell us where you're flying and when. Round trips and one-ways both work." },
  { icon: TrendingDown, title: "We watch the fare", text: "Our fare engine re-checks prices throughout the day across 500+ airlines." },
  { icon: MailCheck, title: "You get the email", text: "When the price drops, you'll know within minutes — with a link straight to the deal." },
];

export default async function PriceAlertsPage() {
  const user = await getCurrentUser();
  const faqs = (getFaqGroup("booking")?.items ?? []).filter((f) => /alert|price|hold/i.test(f.question)).slice(0, 4);
  return (
    <>
      <JsonLd data={[webPageJsonLd({ name: "Flight price alerts", description: metadata.description ?? "", path: "/price-alerts" }), ...(faqs.length ? [faqPageJsonLd(faqs)] : [])]} />
      <section className="bg-navy-950 py-14 text-white">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-3xl text-white sm:text-4xl lg:text-5xl">Know the moment your fare drops</h1>
            <p className="mt-4 max-w-xl text-lg text-white/75">Set a free price alert for any route. We watch it around the clock and email you when it&apos;s time to book.</p>
            <ul className="mt-8 space-y-4">
              {STEPS.map((s) => (
                <li key={s.title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-ocean-300">
                    <s.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-semibold">{s.title}</span>
                    <span className="block text-sm text-white/70">{s.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-navy-900">
            <PriceAlertForm defaultEmail={user?.email ?? ""} />
          </div>
        </div>
      </section>
      {faqs.length > 0 && (
        <section className="container-page max-w-3xl py-14">
          <h2 className="text-2xl">Price alert questions</h2>
          <div className="mt-6">
            <FaqAccordion items={faqs} />
          </div>
        </section>
      )}
    </>
  );
}
