import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/seo/PageHeader";
import { SectionHeading } from "@/components/seo/SectionHeading";
import { JumpNav } from "@/components/seo/JumpNav";
import { LinkCardGrid, type LinkCardItem } from "@/components/seo/LinkCardGrid";
import { US_REGIONS, groupBy, regionForAirport, regionLabel } from "@/components/seo/geo-groups";
import { buildMetadata } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/jsonld";
import { flightsFromPath } from "@/lib/seo/slugs";
import { allCities, cityLocationLabel, originCitySlugs } from "@/lib/seo/city-pages";

export const revalidate = 21600;

export const metadata = buildMetadata({
  title: "Cheap Flights from Your City — Every US Departure Airport",
  description: "Browse cheap flights from 100+ US cities. See the most popular routes, lowest fares and airlines flying from your home airport, from New York to Honolulu.",
  path: "/flights-from",
});

export default function FlightsFromIndexPage() {
  const wanted = new Set(originCitySlugs());
  const cities = allCities()
    .filter((c) => wanted.has(c.slug) || (["US", "PR", "VI", "GU"].includes(c.primary.countryCode) && c.primary.size >= 3))
    .sort((a, b) => b.primary.size - a.primary.size || a.city.localeCompare(b.city));
  const groups = groupBy(cities, (c) => regionForAirport(c.primary));
  const sections = US_REGIONS.filter((r) => groups.get(r)?.length);

  return (
    <>
      <JsonLd data={webPageJsonLd({ name: "Flights from US cities", description: metadata.description ?? "", path: "/flights-from", type: "CollectionPage" })} />
      <PageHeader crumbs={[{ name: "Home", path: "/" }, { name: "Flights from", path: "/flights-from" }]} eyebrow="Browse by departure city" title="Cheap flights from your city" lead="Choose your home airport to see the most popular routes, the lowest round-trip fares and the airlines that fly from it.">
        <JumpNav items={sections.map((r) => ({ id: r, label: regionLabel(r) }))} />
      </PageHeader>
      {sections.map((region, i) => {
        const list = groups.get(region) ?? [];
        const items: LinkCardItem[] = list.map((c) => ({
          key: c.slug,
          href: flightsFromPath(c.primary),
          title: `Flights from ${c.city}`,
          subtitle: `${cityLocationLabel(c.primary)} · ${c.airports.map((a) => a.iata).join(", ")}`,
        }));
        return (
          <section key={region} className={i % 2 === 0 ? "container-page py-12" : "bg-white py-12"}>
            <div className={i % 2 === 0 ? "" : "container-page"}>
              <SectionHeading id={region} title={regionLabel(region)} description={`${list.length} departure cit${list.length === 1 ? "y" : "ies"}.`} />
              <LinkCardGrid className="mt-6" items={items} columns={3} ariaLabel={`Departure cities in ${regionLabel(region)}`} />
            </div>
          </section>
        );
      })}
    </>
  );
}
