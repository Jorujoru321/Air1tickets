/**
 * Central site configuration. Everything brand-related lives here so it can
 * be changed in one place (and read from env where it makes sense).
 */
const rawUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");

export const site = {
  name: "Air1 Tickets",
  legalName: "Air1 Tickets LLC",
  shortName: "Air1",
  tagline: "Fly for less. Book with confidence.",
  description:
    "Air1 Tickets is a US-based online travel agency. Compare hundreds of airlines, find the cheapest flights and book in minutes — with 24/7 US-based support.",
  url: rawUrl && rawUrl.length > 0 ? rawUrl : "http://localhost:3000",
  locale: "en_US",
  language: "en-US",
  currency: "USD",
  country: "US",
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? "+1 (888) 555-0147",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@air1tickets.com",
  address: {
    streetAddress: "1250 Market Street, Suite 400",
    addressLocality: "San Francisco",
    addressRegion: "CA",
    postalCode: "94102",
    addressCountry: "US",
  },
  founded: "2018",
  social: {
    twitter: "https://x.com/air1tickets",
    facebook: "https://www.facebook.com/air1tickets",
    instagram: "https://www.instagram.com/air1tickets",
    linkedin: "https://www.linkedin.com/company/air1tickets",
  },
  twitterHandle: "@air1tickets",
} as const;

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
