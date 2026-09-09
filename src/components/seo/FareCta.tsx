import { ArrowRight, CalendarDays, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { MonthFare } from "@/lib/flights/route-info";
import { cn, formatDateShort, formatMoney } from "@/lib/utils";

/**
 * Lowest-fare hero card: the single most important conversion element on a
 * route page. Uses the sunrise primary button (the only orange on the page).
 */
export function FareCta({ lowest, cheapestMonth, href, originCity, destinationCity, className }: { lowest: MonthFare | null; cheapestMonth: MonthFare | null; href: string; originCity: string; destinationCity: string; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-navy-950 p-6 text-white shadow-card sm:p-7", className)}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(47,147,239,0.4),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,107,53,0.2),transparent_50%)]" aria-hidden />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-wide text-ocean-200">
          {originCity} to {destinationCity}
        </p>
        {lowest ? (
          <>
            <p className="mt-2 font-display text-3xl font-extrabold leading-none sm:text-4xl">
              <span className="text-lg font-semibold text-white/70">Round trips from</span> <span className="block mt-1">{formatMoney(lowest.price)}</span>
            </p>
            <p className="mt-2 text-sm text-white/75">Per traveler, taxes and fees included. Lowest fare we found departs {formatDateShort(lowest.date)}.</p>
            {cheapestMonth && (
              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                <CalendarDays className="h-3.5 w-3.5 text-ocean-300" aria-hidden /> Cheapest month: {cheapestMonth.label}
              </p>
            )}
          </>
        ) : (
          <p className="mt-2 text-lg font-semibold">Search live fares for this route</p>
        )}
        <Button href={href} size="lg" full className="mt-5" rightIcon={<ArrowRight className="h-4 w-4" aria-hidden />}>
          {lowest ? "See fares on these dates" : "Search fares"}
        </Button>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-white/60">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Free cancellation within 24 hours of booking
        </p>
      </div>
    </div>
  );
}
