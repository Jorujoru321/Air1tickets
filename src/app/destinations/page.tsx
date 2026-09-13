import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/seo/PageHeader";
import { SectionHeading } from "@/components/seo/SectionHeading";
import { JumpNav } from "@/components/seo/JumpNav";
import { LinkCardGrid, type LinkCardItem } from "@/components/seo/LinkCardGrid";
import { DestinationCard } from "@/components/marketing/DestinationCard";
import { buildMetadata } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/jsonld";
import { articlePath } from "@/lib/seo/slugs";
import { DESTINATIONS, POPULAR_DESTINATIONS, featuredDestinations } from "@/data/destinations";
import { REGION_LABELS, type Region } from "@/data/types";
import { ARTICLES } from "@/content/articles";

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: "Destination Guides — Where to Fly, When to Go & What It Costs",
  description: "Editor-written guides to the most popular places Americans fly: airports and transit, best time to visit, neighborhoods, weather by season and typical round-trip fares from major US cities.",
  path: "/destinations",
  keywords: ["destination guides", "where to fly", "best time to visit", "cheap flights to popular destinations"],
});

const REGION_ORDER: Region[] = ["us-northeast", "us-southeast", "us-midwest", "us-southwest", "us-west", "us-hawaii-alaska", "canada", "mexico-caribbean", "central-south-america", "europe", "middle-east-africa", "asia", "oceania"];

export default function DestinationsPage() {
  const groups = REGION_ORDER.map((r) => ({ id: r, label: REGION_LABELS[r], items: DESTINATIONS.filter((d) => d.region === r).sort((a, b) => Number(b.popular) - Number(a.popular) || a.city.localeCompare(b.city)) })).filter((g) => g.items.length);
  const us = groups.filter((g) => g.id.startsWith("us-"));
  const intl = groups.filter((g) => !g.id.startsWith("us-"));
  const guides: LinkCardItem[] = ARTICLES.filter((a) => a.category === "tips" || a.category === "guides")
    .slice(0, 6)
    .map((a) => ({ href: articlePath(a.slug), title: a.title, subtitle: `${a.readingMinutes} min read` }));

  return (
    <>
      <JsonLd data={webPageJsonLd({ name: "Destinations", description: metadata.description ?? "", path: "/destinations", type: "CollectionPage" })} />
      <PageHeader crumbs={[{ name: "Home", path: "/" }, { name: "Destinations", path: "/destinations" }]} eyebrow={`${DESTINATIONS.length} city guides`} title="Where do you want to go?" lead="Every guide is written from real schedules and fares: which airport to fly into, how to get downtown, when to visit, what the weather does and what a round trip typically costs from major US cities.">
        <JumpNav className="mt-6" items={groups.map((g) => ({ id: g.id, label: g.label }))} />
      </PageHeader>

      <section className="container-page py-12">
        <SectionHeading title="Most popular right now" description="The destinations Air1 travelers search and book most." />
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredDestinations(8).map((d, i) => (
            <DestinationCard key={d.slug} d={d} priority={i < 4} />
          ))}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container-page space-y-12">
          <SectionHeading title="United States" description="Domestic favorites, from big-city weekends to beach and mountain escapes." />
          {us.map((g) => (
            <div key={g.id}>
              <SectionHeading as="h3" id={g.id} title={g.label} />
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {g.items.map((d) => (
                  <DestinationCard key={d.slug} d={d} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page space-y-12 py-12">
        <SectionHeading title="International" description="Nonstop-friendly international cities with the shortest flights and best fares from the US." />
        {intl.map((g) => (
          <div key={g.id}>
            <SectionHeading as="h3" id={g.id} title={g.label} />
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {g.items.map((d) => (
                <DestinationCard key={d.slug} d={d} />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="bg-white py-12">
        <div className="container-page">
          <SectionHeading title="Before you book" description="Guides that help you pay less and travel smoother." link={{ href: "/travel-guides", label: "All travel guides" }} />
          <LinkCardGrid className="mt-6" items={guides} columns={3} ariaLabel="Travel guides" />
        </div>
      </section>
    </>
  );
}
