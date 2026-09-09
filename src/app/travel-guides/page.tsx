import Link from "next/link";
import { Clock } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/seo/PageHeader";
import { SectionHeading } from "@/components/seo/SectionHeading";
import { JumpNav } from "@/components/seo/JumpNav";
import { DestinationArt } from "@/components/marketing/DestinationArt";
import { DestinationCard } from "@/components/marketing/DestinationCard";
import { Badge } from "@/components/ui/Badge";
import { buildMetadata } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/jsonld";
import { articlePath } from "@/lib/seo/slugs";
import { ARTICLES } from "@/content/articles";
import { POPULAR_DESTINATIONS } from "@/data/destinations";
import type { Article } from "@/data/types";
import { formatDateLong } from "@/lib/utils";

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: "Travel Guides & Flight Tips From Our Editors",
  description: "Practical guides on finding cheap flights, choosing fares, airline baggage fees, airport security programs, passenger rights and flying with kids — written by Air1 Tickets' US-based travel editors.",
  path: "/travel-guides",
  keywords: ["travel guides", "cheap flight tips", "when to book flights", "airline baggage fees", "flight delay rights"],
});

const CATEGORY_LABELS: Record<Article["category"], { label: string; blurb: string }> = {
  tips: { label: "Saving money on flights", blurb: "When to book, which days to fly and how to read a fare." },
  airlines: { label: "Airlines & fares", blurb: "Fare families, baggage fees and what each airline includes." },
  airports: { label: "Airports & security", blurb: "Getting through the airport faster and choosing the right one." },
  guides: { label: "Trip planning", blurb: "Checklists and know-how for smoother trips." },
};

const CATEGORY_ORDER: Article["category"][] = ["tips", "airlines", "airports", "guides"];

function ArticleCard({ a, featured }: { a: Article; featured?: boolean }) {
  return (
    <Link href={articlePath(a.slug)} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-500">
      <div className={featured ? "aspect-[2/1]" : "aspect-[16/9]"}>
        <DestinationArt theme={a.heroTheme} gradient={a.gradient} seed={`article-${a.slug}`} priority={featured} />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <Badge tone="ocean">{CATEGORY_LABELS[a.category].label}</Badge>
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5" aria-hidden /> {a.readingMinutes} min read
          </span>
        </div>
        <h3 className={`mt-3 font-display font-bold text-navy-900 group-hover:text-ocean-700 ${featured ? "text-2xl" : "text-lg"}`}>{a.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-slate-600">{a.description}</p>
        <p className="mt-auto pt-4 text-xs text-slate-500">Updated {formatDateLong(a.updatedAt)}</p>
      </div>
    </Link>
  );
}

export default function TravelGuidesPage() {
  const sorted = [...ARTICLES].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const [featured, ...rest] = sorted;
  const groups = CATEGORY_ORDER.map((c) => ({ id: c, ...CATEGORY_LABELS[c], items: sorted.filter((a) => a.category === c) })).filter((g) => g.items.length);
  return (
    <>
      <JsonLd data={webPageJsonLd({ name: "Travel guides", description: metadata.description ?? "", path: "/travel-guides", type: "CollectionPage" })} />
      <PageHeader crumbs={[{ name: "Home", path: "/" }, { name: "Travel guides", path: "/travel-guides" }]} eyebrow="From the Air1 editorial team" title="Travel guides and flight tips" lead="Straight, specific advice from people who book flights all day: how fares really work, what each airline includes, and how to make the airport painless.">
        <JumpNav className="mt-6" items={groups.map((g) => ({ id: g.id, label: g.label }))} />
      </PageHeader>

      <section className="container-page py-12">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <ArticleCard a={featured} featured />
          <div className="grid gap-4">
            {rest.slice(0, 3).map((a) => (
              <Link key={a.slug} href={articlePath(a.slug)} className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition hover:border-ocean-300">
                <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl">
                  <DestinationArt theme={a.heroTheme} gradient={a.gradient} seed={`article-${a.slug}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ocean-700">{CATEGORY_LABELS[a.category].label}</p>
                  <p className="mt-1 line-clamp-2 font-semibold text-navy-900 group-hover:text-ocean-700">{a.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{a.readingMinutes} min read</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {groups.map((g) => (
        <section key={g.id} className="container-page pb-12">
          <SectionHeading id={g.id} title={g.label} description={g.blurb} />
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((a) => (
              <ArticleCard key={a.slug} a={a} />
            ))}
          </div>
        </section>
      ))}

      <section className="bg-white py-12">
        <div className="container-page">
          <SectionHeading title="Plan the trip, not just the flight" description="City guides with airports, transit, neighborhoods, weather and typical fares." link={{ href: "/destinations", label: "All destinations" }} />
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {POPULAR_DESTINATIONS.slice(0, 4).map((d) => (
              <DestinationCard key={d.slug} d={d} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
