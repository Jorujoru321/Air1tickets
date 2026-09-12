import { partnerLogo, type Partner } from "@/data/partners";
import { cn } from "@/lib/utils";

/**
 * "Rates compared across" strip.
 *
 * Shows each brand's real logo when a licensed file exists at
 * public/partners/<slug>.*, and a typographic wordmark otherwise, so the strip
 * never has holes. Logos are desaturated and optically sized to a common
 * height, which is what stops a logo wall looking like a pile of clip art.
 *
 * Run scripts/fetch-brand-logos.mjs to populate the files. The non-affiliation
 * line matters: it is what keeps this nominative use rather than an implied
 * endorsement.
 */
export function PartnerStrip({ partners, title = "We shop these brands for you", subtitle, className, onDark = false }: { partners: Partner[]; title?: string; subtitle?: string; className?: string; onDark?: boolean }) {
  return (
    <section className={cn("py-10", onDark ? "bg-navy-950 text-white" : "bg-white", className)} aria-labelledby="partners-heading">
      <div className="container-page">
        <p id="partners-heading" className={cn("text-center text-xs font-semibold uppercase tracking-[0.18em]", onDark ? "text-ocean-200" : "text-slate-500")}>
          {title}
        </p>
        <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-7 sm:gap-x-14">
          {partners.map((p) => {
            const logo = partnerLogo(p);
            return (
              <li key={p.slug} className="flex h-8 items-center">
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logo}
                    alt={p.name}
                    className={cn("max-h-8 w-auto object-contain grayscale transition duration-200 hover:grayscale-0", onDark ? "opacity-80 invert hover:opacity-100" : "opacity-60 hover:opacity-100")}
                    loading="lazy"
                  />
                ) : (
                  <span className={cn("font-display text-lg font-extrabold tracking-tight sm:text-xl", onDark ? "text-white/70" : "text-slate-500")}>{p.name}</span>
                )}
              </li>
            );
          })}
        </ul>
        {subtitle && <p className={cn("mt-5 text-center text-xs", onDark ? "text-white/50" : "text-slate-500")}>{subtitle}</p>}
      </div>
    </section>
  );
}
