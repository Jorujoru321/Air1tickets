import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/seo/PageHeader";
import { SectionHeading } from "@/components/seo/SectionHeading";
import { JumpNav } from "@/components/seo/JumpNav";
import { LinkCardGrid, type LinkCardItem } from "@/components/seo/LinkCardGrid";
import { REGION_ORDER, groupBy, regionForAirport, regionLabel } from "@/components/seo/geo-groups";
import { buildMetadata } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/jsonld";
import { flightsToPath } from "@/lib/seo/slugs";
import { allCities, cityLocationLabel, destinationCitySlugs } from "@/lib/seo/city-pages";
import { getDestinationByAirport } from "@/data/destinations";

export const revalidate = 21600;

export const metadata = buildMetadata({
  title: "Cheap Flights to Every Destination — Browse by City",
  description: "Find cheap flights to 200+ cities in the US, Mexico, the Caribbean, Europe and Asia. Compare fares, airlines and the best time to fly for every destination.",
  path: "/flights-to",
});

export default function FlightsToIndexPage() {
  const wanted = new Set(destinationCitySlugs());
  const cities = allCities()
    .filter((c) => wanted.has(c.slug) || c.primary.size >= 3)
    .sort((a, b) => b.primary.size - a.primary.size || a.city.localeCompare(b.city));
  const groups = groupBy(cities, (c) => regionForAirport(c.primary));
  const sections = REGION_ORDER.filter((r) => groups.get(r)?.length);

  return (
    <>
      <JsonLd data={webPageJsonLd({ name: "Flights to every destination", description: metadata.description ?? "", path: "/flights-to", type: "CollectionPage" })} />
      <PageHeader crumbs={[{ name: "Home", path: "/" }, { name: "Flights to", path: "/flights-to" }]} eyebrow="Browse destinations" title="Cheap flights to every destination" lead="Pick a city to see which airlines fly there, the lowest fares by month, the best day to travel and the routes from your home airport.">
        <JumpNav items={sections.map((r) => ({ id: r, label: regionLabel(r) }))} />
      </PageHeader>
      {sections.map((region, i) => {
        const list = groups.get(region) ?? [];
        const items: LinkCardItem[] = list.map((c) => {
          const guide = getDestinationByAirport(c.primary.iata);
          return {
            key: c.slug,
            href: flightsToPath(c.primary),
            title: `Flights to ${c.city}`,
            subtitle: `${cityLocationLabel(c.primary)} · ${c.airports.map((a) => a.iata).join(", ")}${guide ? " · Travel guide" : ""}`,
          };
        });
        return (
          <section key={region} className={i % 2 === 0 ? "container-page py-12" : "bg-white py-12"}>
            <div className={i % 2 === 0 ? "" : "container-page"}>
              <SectionHeading id={region} title={regionLabel(region)} description={`${list.length} destination${list.length === 1 ? "" : "s"} with fare tracking.`} />
              <LinkCardGrid className="mt-6" items={items} columns={3} ariaLabel={`Destinations in ${regionLabel(region)}`} />
            </div>
          </section>
        );
      })}
    </>
  );
}
