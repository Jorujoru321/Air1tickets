import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/seo/PageHeader";
import { SectionHeading } from "@/components/seo/SectionHeading";
import { JumpNav } from "@/components/seo/JumpNav";
import { LinkCardGrid, type LinkCardItem } from "@/components/seo/LinkCardGrid";
import {
  SIZE_TIER_LABELS,
  groupBy,
  stateName,
} from "@/components/seo/geo-groups";
import { buildMetadata } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/jsonld";
import { airportPath } from "@/lib/seo/slugs";
import { AIRPORTS } from "@/data/airports";
import type { Airport } from "@/lib/flights/types";

export const revalidate = 21600;

export const metadata = buildMetadata({
  title:
    "Airport Guides — Every US, Canadian and International Airport We Serve",
  description:
    "Facts, airlines and popular routes for every airport we serve: major US airports by state, Canadian airports by province and territory, and the international gateways beyond. Find your airport code and start a search.",
  path: "/airports",
});

function item(a: Airport): LinkCardItem {
  return {
    key: a.iata,
    href: airportPath(a),
    title: `${a.city} (${a.iata})`,
    subtitle: `${a.name} · ${SIZE_TIER_LABELS[a.size]}`,
    leading: (
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-xs font-bold text-white"
        aria-hidden
      >
        {a.iata}
      </span>
    ),
  };
}

export default function AirportsIndexPage() {
  const US_CODES = ["US", "PR", "VI", "GU"];
  const us = AIRPORTS.filter((a) => US_CODES.includes(a.countryCode)).sort(
    (a, b) => a.city.localeCompare(b.city),
  );
  // Canada gets its own section rather than being buried under "International":
  // to a traveler in Winnipeg, Winnipeg is not an international gateway.
  const canada = AIRPORTS.filter((a) => a.countryCode === "CA").sort((a, b) =>
    a.city.localeCompare(b.city),
  );
  const intl = AIRPORTS.filter(
    (a) => !US_CODES.includes(a.countryCode) && a.countryCode !== "CA",
  ).sort(
    (a, b) =>
      a.country.localeCompare(b.country) || a.city.localeCompare(b.city),
  );
  const byState = groupBy(us, (a) => a.state ?? a.countryCode);
  const states = Array.from(byState.keys()).sort((a, b) =>
    stateName(a).localeCompare(stateName(b)),
  );
  const byProvince = groupBy(canada, (a) => a.state ?? "CA");
  const provinces = Array.from(byProvince.keys()).sort((a, b) =>
    stateName(a).localeCompare(stateName(b)),
  );
  const byCountry = groupBy(intl, (a) => a.country);
  const countries = Array.from(byCountry.keys()).sort();

  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          name: "Airports",
          description: metadata.description ?? "",
          path: "/airports",
          type: "CollectionPage",
        })}
      />
      <PageHeader
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Airports", path: "/airports" },
        ]}
        eyebrow={`${AIRPORTS.length} airports · US, Canada and worldwide`}
        title="Airport guides"
        lead="Airlines, popular routes and practical facts for every airport in our network. Find yours by state, province or country."
      >
        <JumpNav
          items={[
            { id: "united-states", label: "United States" },
            { id: "canada", label: "Canada" },
            { id: "international", label: "International" },
          ]}
        />
      </PageHeader>
      <section className="container-page py-12">
        <SectionHeading
          id="united-states"
          title="United States"
          description="Grouped by state, including Puerto Rico, the US Virgin Islands and Guam."
        />
        <div className="mt-6 space-y-8">
          {states.map((st) => (
            <div key={st}>
              <h3 className="text-lg">{stateName(st) || st}</h3>
              <LinkCardGrid
                className="mt-3"
                items={(byState.get(st) ?? []).map(item)}
                columns={3}
                ariaLabel={`Airports in ${stateName(st)}`}
              />
            </div>
          ))}
        </div>
      </section>
      <section className="bg-white py-12">
        <div className="container-page">
          <SectionHeading
            id="canada"
            title="Canada"
            description={`Grouped by province and territory — ${canada.length} airports from Vancouver Island to Iqaluit.`}
          />
          <div className="mt-6 space-y-8">
            {provinces.map((pv) => (
              <div key={pv}>
                <h3 className="text-lg">{stateName(pv) || pv}</h3>
                <LinkCardGrid
                  className="mt-3"
                  items={(byProvince.get(pv) ?? []).map(item)}
                  columns={3}
                  ariaLabel={`Airports in ${stateName(pv)}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-12">
        <div className="container-page">
          <SectionHeading
            id="international"
            title="International"
            description="Gateways in Mexico, the Caribbean, Latin America, Europe, the Middle East, Asia and the Pacific."
          />
          <div className="mt-6 space-y-8">
            {countries.map((c) => (
              <div key={c}>
                <h3 className="text-lg">{c}</h3>
                <LinkCardGrid
                  className="mt-3"
                  items={(byCountry.get(c) ?? []).map(item)}
                  columns={3}
                  ariaLabel={`Airports in ${c}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
