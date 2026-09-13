import { Mail, Phone } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/seo/PageHeader";
import { FaqSearch } from "@/components/marketing/FaqSearch";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqPageJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { ALL_FAQS, FAQ_GROUPS } from "@/data/faqs";
import { site } from "@/lib/site";
import { TeamShot } from "@/components/marketing/TeamPhotos";
import { contactHref } from "@/lib/leads/chat-links";

export const metadata = buildMetadata({
  title: "Help Center — Bookings, Changes, Baggage & Travel Documents",
  description:
    "Answers to common questions about booking with Air1 Tickets: payments, changes and refunds, baggage rules, check-in, travel documents and how to reach our 24/7 US-based team.",
  path: "/help",
});

export default function HelpPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: "Help center",
            description: metadata.description ?? "",
            path: "/help",
          }),
          faqPageJsonLd(ALL_FAQS.slice(0, 40)),
        ]}
      />
      <PageHeader
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Help center", path: "/help" },
        ]}
        eyebrow="Support"
        title="Help center"
        lead="Straight answers about booking, paying, changing and flying. Can't find it? Our US-based team answers the phone 24/7."
      />
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_18rem]">
        <FaqSearch groups={FAQ_GROUPS} />
        <aside className="space-y-4 lg:sticky lg:top-[calc(var(--header-height)+1rem)] lg:self-start">
          <nav
            aria-label="Help topics"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              On this page
            </p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {FAQ_GROUPS.map((g) => (
                <li key={g.id}>
                  <a
                    href={`#${g.id}`}
                    className="text-navy-900 hover:text-ocean-700 hover:underline"
                  >
                    {g.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="overflow-hidden rounded-2xl bg-navy-900 text-white">
            <TeamShot
              slot="support"
              rounded="rounded-none"
              className="border-b border-white/10"
            />
            <div className="p-5">
              <p className="font-display text-lg font-bold">Talk to a person</p>
              <p className="mt-1 text-sm text-white/75">
                24 hours a day, 7 days a week, from the US.
              </p>
              <a
                href={`tel:${site.supportPhone.replace(/[^\d+]/g, "")}`}
                className="mt-3 flex items-center gap-2 font-semibold"
              >
                <Phone className="h-4 w-4 text-ocean-300" aria-hidden />{" "}
                {site.supportPhone}
              </a>
              <a
                href={`mailto:${site.supportEmail}`}
                className="mt-2 flex items-center gap-2 text-sm text-white/85"
              >
                <Mail className="h-4 w-4 text-ocean-300" aria-hidden />{" "}
                {site.supportEmail}
              </a>
              <a
                href={contactHref()}
                className="mt-4 inline-block text-sm font-semibold text-ocean-200 hover:underline"
              >
                Send us a message →
              </a>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
