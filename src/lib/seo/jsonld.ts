/**
 * schema.org JSON-LD builders. Render with <JsonLd data={...} /> from
 * `@/components/seo/JsonLd`. Keep output minimal and accurate — search
 * engines penalise structured data that doesn't match visible content.
 */
import { site, absoluteUrl } from "@/lib/site";
import type { FAQ } from "@/data/types";

export type JsonLdObject = Record<string, unknown>;

export function organizationJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "TravelAgency"],
    "@id": `${site.url}/#organization`,
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: absoluteUrl("/icons/icon-512.png"),
    description: site.description,
    foundingDate: site.founded,
    telephone: site.supportPhone,
    email: site.supportEmail,
    priceRange: "$$",
    currenciesAccepted: "USD",
    paymentAccepted: "Credit Card, Debit Card",
    areaServed: { "@type": "Country", name: "United States" },
    address: { "@type": "PostalAddress", ...site.address },
    sameAs: Object.values(site.social),
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: site.supportPhone,
        contactType: "customer service",
        areaServed: "US",
        availableLanguage: ["English", "Spanish"],
        hoursAvailable: { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "00:00", closes: "23:59" },
      },
    ],
  };
}

export function websiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: site.url,
    name: site.name,
    description: site.description,
    publisher: { "@id": `${site.url}/#organization` },
    inLanguage: site.language,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${site.url}/flights/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(crumbs: Crumb[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function faqPageJsonLd(faqs: FAQ[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function webPageJsonLd(input: { name: string; description: string; path: string; type?: string }): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": input.type ?? "WebPage",
    "@id": `${absoluteUrl(input.path)}#webpage`,
    url: absoluteUrl(input.path),
    name: input.name,
    description: input.description,
    isPartOf: { "@id": `${site.url}/#website` },
    inLanguage: site.language,
  };
}

export function articleJsonLd(input: { title: string; description: string; path: string; publishedAt: string; updatedAt: string; author: string; image?: string; keywords?: string[] }): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    mainEntityOfPage: absoluteUrl(input.path),
    datePublished: input.publishedAt,
    dateModified: input.updatedAt,
    author: { "@type": "Organization", name: input.author, url: site.url },
    publisher: { "@id": `${site.url}/#organization` },
    image: input.image ? absoluteUrl(input.image) : absoluteUrl(`/opengraph-image?title=${encodeURIComponent(input.title)}`),
    keywords: input.keywords?.join(", "),
    inLanguage: site.language,
  };
}

/** A route page's "lowest fare" as a schema.org Offer on a Trip/Flight. */
export function flightRouteJsonLd(input: { originName: string; originCode: string; destinationName: string; destinationCode: string; lowestPrice: number; path: string; airlines?: string[] }): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Flight",
    name: `Flights from ${input.originName} to ${input.destinationName}`,
    departureAirport: { "@type": "Airport", name: input.originName, iataCode: input.originCode },
    arrivalAirport: { "@type": "Airport", name: input.destinationName, iataCode: input.destinationCode },
    ...(input.airlines?.length ? { provider: input.airlines.map((n) => ({ "@type": "Airline", name: n })) } : {}),
    offers: {
      "@type": "AggregateOffer",
      lowPrice: input.lowestPrice,
      priceCurrency: "USD",
      url: absoluteUrl(input.path),
      availability: "https://schema.org/InStock",
    },
  };
}

export function airportJsonLd(input: { name: string; iata: string; city: string; countryCode: string; lat: number; lon: number; path: string }): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Airport",
    name: input.name,
    iataCode: input.iata,
    address: { "@type": "PostalAddress", addressLocality: input.city, addressCountry: input.countryCode },
    geo: { "@type": "GeoCoordinates", latitude: input.lat, longitude: input.lon },
    url: absoluteUrl(input.path),
  };
}

export function airlineJsonLd(input: { name: string; iata: string; website?: string; path: string }): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Airline",
    name: input.name,
    iataCode: input.iata,
    url: input.website ?? absoluteUrl(input.path),
  };
}

export function touristDestinationJsonLd(input: { name: string; description: string; path: string; countryCode: string; image?: string }): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    address: { "@type": "PostalAddress", addressCountry: input.countryCode },
    ...(input.image ? { image: absoluteUrl(input.image) } : {}),
  };
}

/** A service the agency offers (hotel booking, activity booking), for rich results. */
export function serviceJsonLd(input: { name: string; description: string; path: string; serviceType: string; areaServed?: string }): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    serviceType: input.serviceType,
    url: absoluteUrl(input.path),
    provider: { "@id": `${site.url}/#organization` },
    areaServed: input.areaServed ?? "Worldwide",
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: absoluteUrl(input.path),
      servicePhone: site.supportPhone,
      availableLanguage: ["English", "Spanish"],
    },
  };
}
