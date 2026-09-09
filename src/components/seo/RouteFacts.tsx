import { BadgePercent, CalendarCheck, CalendarDays, Clock, Globe2, PlaneTakeoff, Ruler } from "lucide-react";
import { AirlineLogo } from "@/components/results/AirlineLogo";
import type { RouteInfo } from "@/lib/flights/route-info";
import { formatDuration } from "@/lib/utils";
import { formatMiles } from "./seo-text";

function tzLabel(diff: number): string {
  if (diff === 0) return "Same time zone";
  const abs = Math.abs(diff);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const amount = m ? `${h}h ${m}m` : `${h}h`;
  return `${amount} ${diff > 0 ? "ahead" : "behind"}`;
}

/** Quick-facts grid for a route page, all values computed from route data. */
export function RouteFacts({ info }: { info: RouteInfo }) {
  const nonstop = info.nonstopAirlines;
  const facts: { label: string; value: React.ReactNode; icon: typeof Ruler; note?: string }[] = [
    { label: "Distance", value: formatMiles(info.distanceMiles), icon: Ruler, note: "great-circle" },
    { label: "Typical flight time", value: formatDuration(info.typicalDurationMinutes), icon: Clock, note: nonstop.length ? "nonstop, gate to gate" : "if flown nonstop" },
    {
      label: "Nonstop airlines",
      icon: PlaneTakeoff,
      value: nonstop.length ? (
        <span className="flex items-center gap-1.5">
          <span className="flex -space-x-1.5">
            {nonstop.slice(0, 4).map((al) => (
              <AirlineLogo key={al.iata} iata={al.iata} size={24} className="ring-2 ring-white" />
            ))}
          </span>
          <span>
            {nonstop.length}
            {nonstop.length > 4 ? " airlines" : nonstop.length === 1 ? " airline" : " airlines"}
          </span>
        </span>
      ) : (
        "None (connecting only)"
      ),
      note: nonstop.length ? nonstop.slice(0, 3).map((a) => a.name.replace(" Airlines", "").replace(" Air Lines", "")).join(", ") : undefined,
    },
    { label: "Nonstop flights per day", value: info.flightsPerDay > 0 ? String(info.flightsPerDay) : "0", icon: CalendarDays, note: info.flightsPerDay > 0 ? "all airlines combined" : "connections available" },
    { label: "Cheapest month", value: info.cheapestMonth ? info.cheapestMonth.label : "No fare data", icon: BadgePercent, note: info.cheapestMonth ? "over the next six months" : undefined },
    { label: "Best day to fly", value: info.cheapestDayOfWeek ?? "No fare data", icon: CalendarCheck, note: info.priciestDayOfWeek && info.weekdaySavingsPercent > 0 ? `${info.weekdaySavingsPercent}% less than ${info.priciestDayOfWeek}` : undefined },
    { label: "Time difference", value: tzLabel(info.timeZoneDiffMinutes), icon: Globe2, note: info.timeZoneDiffMinutes === 0 ? undefined : `${info.destination.city} vs ${info.origin.city}` },
  ];
  return (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {facts.map((f) => (
        <div key={f.label} className="grid grid-cols-[2.5rem_1fr] gap-x-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
          <dt className="col-start-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{f.label}</dt>
          <dd className="col-start-1 row-span-2 row-start-1 flex h-10 w-10 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
            <f.icon className="h-5 w-5" aria-hidden />
          </dd>
          <dd className="col-start-2 mt-0.5 min-w-0 text-base font-bold text-navy-900">
            {f.value}
            {f.note && <span className="block text-xs font-normal text-slate-500">{f.note}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
