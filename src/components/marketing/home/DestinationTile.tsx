import Link from "next/link";
import type { Destination } from "@/data/types";
import { DestinationArt } from "@/components/marketing/DestinationArt";
import { destinationPath } from "@/lib/seo/slugs";
import { destinationPhoto } from "@/data/photos";
import { formatMoney } from "@/lib/utils";

export function DestinationTile({ d, priority }: { d: Destination; priority?: boolean }) {
  const from = Math.min(...d.typicalFares.map((f) => f.price));
  return (
    <Link href={destinationPath(d.slug)} className="group relative block overflow-hidden rounded-2xl shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-500">
      <div className="aspect-[4/3]">
        <DestinationArt theme={d.heroTheme} gradient={d.gradient} seed={d.slug} priority={priority} image={destinationPhoto(d.slug) ?? undefined} alt={`${d.city}, ${d.countryCode === "US" ? d.state : d.country}`} />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <p className="font-display text-xl font-bold leading-tight">{d.city}</p>
        <p className="text-sm text-white/80">{d.countryCode === "US" ? d.state : d.country}</p>
        {Number.isFinite(from) && (
          <p className="mt-2 inline-flex items-center rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold backdrop-blur">
            Round trips from {formatMoney(from)}
          </p>
        )}
      </div>
    </Link>
  );
}
