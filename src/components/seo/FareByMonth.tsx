import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { MonthFare } from "@/lib/flights/route-info";
import { buildSearchUrl } from "@/lib/flights/search-params";
import { addDays, cn, formatDateShort, formatMoney } from "@/lib/utils";

/**
 * "Fares by month" bar list. Pure CSS bars; every row is a deep link into a
 * search for the cheapest date of that month (7-night round trip).
 */
export function FareByMonth({ months, origin, destination, className }: { months: MonthFare[]; origin: string; destination: string; className?: string }) {
  if (!months.length) {
    return <p className={cn("text-sm text-slate-500", className)}>We don&apos;t have fare data for this route yet. Run a search to see live prices.</p>;
  }
  const max = Math.max(...months.map((m) => m.price));
  const min = Math.min(...months.map((m) => m.price));
  return (
    <ol className={cn("divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-card", className)}>
      {months.map((m) => {
        const cheapest = m.price === min;
        const href = buildSearchUrl({ origin, destination, departDate: m.date, returnDate: addDays(m.date, 7), passengers: { adults: 1, children: 0, infants: 0 }, cabin: "economy" });
        const width = Math.max(12, Math.round((m.price / max) * 100));
        return (
          <li key={m.month}>
            <Link
              href={href}
              className="group grid grid-cols-[7.5rem_1fr_auto] items-center gap-3 px-4 py-3 transition hover:bg-slate-50 sm:grid-cols-[9rem_1fr_auto] sm:px-5"
              aria-label={`${m.label}: round trips from ${formatMoney(m.price)}, cheapest on ${formatDateShort(m.date)}. Search fares.`}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-navy-900">{m.label}</span>
                <span className="block text-xs text-slate-500">from {formatDateShort(m.date)}</span>
              </span>
              <span className="h-3 w-full overflow-hidden rounded-full bg-slate-100" aria-hidden>
                <span className={cn("block h-full rounded-full transition-[width]", cheapest ? "bg-success-500" : "bg-ocean-500 group-hover:bg-ocean-600")} style={{ width: `${width}%` }} />
              </span>
              <span className="flex items-center gap-2 text-right">
                {cheapest && (
                  <Badge tone="success" className="hidden sm:inline-flex">
                    Cheapest
                  </Badge>
                )}
                <span className="text-sm font-bold tabular-nums text-navy-900">{formatMoney(m.price)}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
