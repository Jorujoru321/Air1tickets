import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AirlineLogo } from "@/components/results/AirlineLogo";
import { Badge } from "@/components/ui/Badge";
import type { RouteAirline } from "@/lib/flights/route-info";
import { ALLIANCE_LABELS } from "@/data/airlines";
import { airlinePath } from "@/lib/seo/slugs";
import { cn } from "@/lib/utils";

/** Airlines serving a route: nonstop carriers first, then one-stop options with their hubs. */
export function AirlineList({ items, className }: { items: RouteAirline[]; className?: string }) {
  if (!items.length) return null;
  return (
    <ul className={cn("divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-card", className)}>
      {items.map(({ airline, nonstop, flightsPerDay, via }) => (
        <li key={airline.iata}>
          <Link href={airlinePath(airline.slug)} className="group flex items-center gap-4 px-4 py-3.5 transition hover:bg-slate-50 sm:px-5">
            <AirlineLogo iata={airline.iata} size={40} />
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-navy-900">{airline.name}</span>
                {airline.alliance && <Badge tone="outline">{ALLIANCE_LABELS[airline.alliance]}</Badge>}
                {airline.lowCost && <Badge tone="neutral">Low-cost</Badge>}
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                {nonstop ? `Nonstop · ${flightsPerDay} ${flightsPerDay === 1 ? "flight" : "flights"} a day` : `Connecting via ${via.join(", ")}`}
                {airline.checkedBagFee > 0 ? ` · first checked bag from $${airline.checkedBagFee}` : " · first checked bag included"}
              </span>
            </span>
            <Badge tone={nonstop ? "success" : "neutral"} className="hidden sm:inline-flex">
              {nonstop ? "Nonstop" : "1 stop"}
            </Badge>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-ocean-600" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}
