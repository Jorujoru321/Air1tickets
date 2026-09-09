import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/seo/PageHeader";
import { SectionHeading } from "@/components/seo/SectionHeading";
import { JumpNav } from "@/components/seo/JumpNav";
import { LinkCardGrid, type LinkCardItem } from "@/components/seo/LinkCardGrid";
import { AirlineLogo } from "@/components/results/AirlineLogo";
import { INTERNATIONAL_REGIONS, groupBy, regionForCountry, regionLabel } from "@/components/seo/geo-groups";
import { buildMetadata } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/jsonld";
import { airlinePath } from "@/lib/seo/slugs";
import { AIRLINES, ALLIANCE_LABELS, US_AIRLINES, type AirlineProfile } from "@/data/airlines";
import { getAirport } from "@/data/airports";

export const revalidate = 21600;

export const metadata = buildMetadata({
  title: "Airlines We Compare — Fares, Bag Fees & Fare Types",
  description: "Every airline Air1 Tickets compares: US carriers and 40+ international airlines with hubs, alliances, checked-bag fees, fare families and popular routes.",
  path: "/airlines",
});

function item(al: AirlineProfile): LinkCardItem {
  const hubs = al.hubs
    .slice(0, 3)
    .map((h) => getAirport(h)?.city ?? h)
    .join(", ");
  return {
    key: al.iata,
    href: airlinePath(al.slug),
    title: al.name,
    subtitle: `${al.alliance ? `${ALLIANCE_LABELS[al.alliance]} · ` : ""}${al.lowCost ? "Low-cost · " : ""}Hubs: ${hubs}`,
    leading: <AirlineLogo iata={al.iata} size={36} />,
  };
}

export default function AirlinesIndexPage() {
  const international = AIRLINES.filter((a) => a.countryCode !== "US");
  const groups = groupBy(international, (a) => regionForCountry(a.countryCode));
  const sections = INTERNATIONAL_REGIONS.filter((r) => groups.get(r)?.length);
  return (
    <>
      <JsonLd data={webPageJsonLd({ name: "Airlines", description: metadata.description ?? "", path: "/airlines", type: "CollectionPage" })} />
      <PageHeader crumbs={[{ name: "Home", path: "/" }, { name: "Airlines", path: "/airlines" }]} eyebrow={`${AIRLINES.length} airlines`} title="Airlines we compare" lead="US legacy carriers, low-cost airlines and the international carriers flying to and from the United States. Each page explains fare types, bag fees and popular routes.">
        <JumpNav items={[{ id: "us", label: "United States" }, ...sections.map((r) => ({ id: r, label: regionLabel(r) }))]} />
      </PageHeader>
      <section className="container-page py-12">
        <SectionHeading id="us" title="US airlines" description="Legacy carriers, JetBlue and Alaska, plus the ultra-low-cost airlines whose fares look cheapest until you add bags." />
        <LinkCardGrid className="mt-6" items={US_AIRLINES.map(item)} columns={3} ariaLabel="US airlines" />
      </section>
      {sections.map((region, i) => (
        <section key={region} className={i % 2 === 0 ? "bg-white py-12" : "container-page py-12"}>
          <div className={i % 2 === 0 ? "container-page" : ""}>
            <SectionHeading id={region} title={regionLabel(region)} />
            <LinkCardGrid className="mt-6" items={(groups.get(region) ?? []).map(item)} columns={3} ariaLabel={`Airlines in ${regionLabel(region)}`} />
          </div>
        </section>
      ))}
    </>
  );
}
