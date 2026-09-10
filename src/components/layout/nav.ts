/** Primary navigation — single source of truth for header + footer + sitemap hubs. */
export const PRIMARY_NAV = [
  { label: "Flights", href: "/flights" },
  { label: "Deals", href: "/deals" },
  { label: "Destinations", href: "/destinations" },
  { label: "Travel guides", href: "/travel-guides" },
  { label: "Price lock", href: "/price-lock" },
  { label: "Help", href: "/help" },
] as const;

export const FOOTER_COMPANY = [
  { label: "About Air1 Tickets", href: "/about" },
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
