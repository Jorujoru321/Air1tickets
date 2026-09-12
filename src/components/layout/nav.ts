import { isStaticPreview } from "@/lib/site";

/** Pages the static preview does not build (they need a database or an API route). */
const SERVER_ONLY = ["/booking", "/price-alerts", "/contact", "/account", "/admin", "/flights/search"];

/** Hide links to server-only pages when running as the static preview. */
export function visibleLinks<T extends { href: string }>(links: readonly T[]): T[] {
  if (!isStaticPreview) return [...links];
  return links.filter((l) => !SERVER_ONLY.some((p) => l.href === p || l.href.startsWith(`${p}/`) || l.href.startsWith(`${p}#`)));
}

/** Primary navigation — single source of truth for header + footer + sitemap hubs. */
export const PRIMARY_NAV = [
  { label: "Flights", href: "/flights" },
  { label: "Hotels", href: "/hotels" },
  { label: "Things to do", href: "/activities" },
  { label: "Deals", href: "/deals" },
  { label: "Destinations", href: "/destinations" },
  { label: "Help", href: "/help" },
] as const;

export const FOOTER_COMPANY = [
  { label: "About Air1 Tickets", href: "/about" },
  { label: "Hotels", href: "/hotels" },
  { label: "Things to do", href: "/activities" },
  { label: "Contact us", href: "/contact" },
  { label: "Help center", href: "/help" },
  { label: "Deals", href: "/deals" },
  { label: "Travel guides", href: "/travel-guides" },
  { label: "Airlines", href: "/airlines" },
  { label: "Airports", href: "/airports" },
] as const;

export const FOOTER_SUPPORT = [
  { label: "How price lock works", href: "/price-lock" },
  { label: "Price lock & deals FAQ", href: "/help#price-lock" },
  { label: "Manage a ticket", href: "/booking" },
  { label: "Changes & cancellations", href: "/help#changes" },
  { label: "Baggage & seats", href: "/help#baggage" },
  { label: "Check-in & travel documents", href: "/help#travel" },
  { label: "Payments & pricing", href: "/help#payments" },
  { label: "Price alerts", href: "/price-alerts" },
] as const;

export const FOOTER_LEGAL = [
  { label: "Terms of service", href: "/legal/terms" },
  { label: "Privacy policy", href: "/legal/privacy" },
  { label: "Cookie policy", href: "/legal/cookies" },
  { label: "Accessibility", href: "/legal/accessibility" },
  { label: "Do not sell my info", href: "/legal/privacy#your-rights" },
] as const;
