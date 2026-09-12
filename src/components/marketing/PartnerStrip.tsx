import type { Partner } from "@/data/partners";
import { cn } from "@/lib/utils";

/**
 * "Rates compared across" strip. Brand names render as text wordmarks in our
 * own typeface — we do not reproduce anyone's logo artwork. Drop a licensed
 * file at public/partners/<slug>.svg and flag it in src/data/partners.ts to
 * show a real logo instead.
 */
export function PartnerStrip({ partners, title = "We shop these brands for you", subtitle, className, onDark = false }: { partners: Partner[]; title?: string; subtitle?: string; className?: string; onDark?: boolean }) {
  return (
    <section className={cn("py-10", onDark ? "bg-navy-950 text-white" : "bg-white", className)} aria-labelledby="partners-heading">
      <div className="container-page">
        <p id="partners-heading" className={cn("text-center text-xs font-semibold uppercase tracking-[0.18em]", onDark ? "text-ocean-200" : "text-slate-500")}>
          {title}
        </p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-5 sm:gap-x-12">
          {partners.map((p) => (
            <li key={p.slug}>
              {p.hasLogoFile ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/partners/${p.slug}.svg`} alt={p.name} className={cn("h-7 w-auto object-contain", onDark ? "opacity-90" : "opacity-70")} loading="lazy" />
              ) : (
                <span className={cn("font-display text-lg font-extrabold tracking-tight sm:text-xl", onDark ? "text-white/70" : "text-slate-500")}>{p.name}</span>
              )}
            </li>
          ))}
        </ul>
        {subtitle && <p className={cn("mt-5 text-center text-xs", onDark ? "text-white/50" : "text-slate-500")}>{subtitle}</p>}
      </div>
    </section>
  );
}
