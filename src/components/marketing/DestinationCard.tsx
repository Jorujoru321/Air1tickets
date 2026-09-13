import Link from "next/link";
import { Clock, Plane } from "lucide-react";
import type { Destination } from "@/data/types";
import { DestinationArt } from "@/components/marketing/DestinationArt";
import { destinationPath } from "@/lib/seo/slugs";
import { destinationPhoto } from "@/data/photos";
import { placeLabel } from "@/components/seo/geo-groups";
import { formatDuration, formatMoney } from "@/lib/utils";

/** Horizontal destination card for index and "related" modules. */
export function DestinationCard({ d, priority }: { d: Destination; priority?: boolean }) {
  const from = Math.min(...d.typicalFares.map((f) => f.price));
  const time = d.flightTimes.length ? Math.min(...d.flightTimes.map((f) => f.minutes)) : null;
  return (
    <Link href={destinationPath(d.slug)} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-500">
      <div className="aspect-[16/9]">
        <DestinationArt theme={d.heroTheme} gradient={d.gradient} seed={d.slug} priority={priority} image={destinationPhoto(d.slug) ?? undefined} alt={`${d.city}, ${placeLabel(d)}`} />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ocean-700">{d.state ? `${d.state} · ${d.country}` : d.country}</p>
        <p className="mt-1 font-display text-lg font-bold text-navy-900 group-hover:text-ocean-700">{d.city}</p>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{d.tagline}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 text-xs text-slate-500">
          {Number.isFinite(from) && (
            <span className="inline-flex items-center gap-1 font-semibold text-navy-900">
              <Plane className="h-3.5 w-3.5 text-ocean-600" aria-hidden /> from {formatMoney(from)} round trip
            </span>
          )}
          {time && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden /> {formatDuration(time)}+
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
