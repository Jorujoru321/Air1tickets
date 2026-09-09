import type { Airport } from "@/lib/flights/types";
import { routePath } from "@/lib/seo/slugs";
import { formatMoney } from "@/lib/utils";
import { LinkCardGrid, type LinkCardItem } from "./LinkCardGrid";

export interface RouteLinkItem {
  origin: Airport;
  destination: Airport;
  /** Lowest round-trip fare when known. */
  price?: number | null;
  /** Override the visible title (defaults to "Origin to Destination"). */
  label?: string;
  subtitle?: string;
}

/** Grid of route-page links with optional "from $X" fares. De-duplicates by slug. */
export function RouteLinks({ routes, columns = 3, className, ariaLabel }: { routes: RouteLinkItem[]; columns?: 2 | 3 | 4; className?: string; ariaLabel?: string }) {
  const seen = new Set<string>();
  const items: LinkCardItem[] = [];
  for (const r of routes) {
    const href = routePath(r.origin, r.destination);
    if (seen.has(href)) continue;
    seen.add(href);
    items.push({
      href,
      title: r.label ?? `${r.origin.city} to ${r.destination.city}`,
      subtitle: r.subtitle ?? `${r.origin.iata} → ${r.destination.iata}`,
      aside: typeof r.price === "number" ? <span>from {formatMoney(r.price)}</span> : undefined,
    });
  }
  return <LinkCardGrid items={items} columns={columns} className={className} ariaLabel={ariaLabel} />;
}
