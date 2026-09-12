import { BadgeCheck, Lightbulb, TrendingDown } from "lucide-react";
import { SectionHeading } from "@/components/seo/SectionHeading";
import { ChatButtons } from "@/components/leads/ChatButtons";
import { caseStudiesFor, type CaseStudy } from "@/content/case-studies";
import { site } from "@/lib/site";
import { cn, formatMoney } from "@/lib/utils";

function saving(c: CaseStudy): number | null {
  if (!c.paid || !c.publicPrice || c.publicPrice <= c.paid) return null;
  return Math.round(((c.publicPrice - c.paid) / c.publicPrice) * 100);
}

export function CaseStudyCard({ c }: { c: CaseStudy }) {
  const pct = saving(c);
  return (
    <article className={cn("flex h-full flex-col rounded-2xl border bg-white p-6 shadow-card", c.verified ? "border-success-200 ring-1 ring-success-100" : "border-slate-200")}>
      <p className={cn("inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", c.verified ? "bg-success-50 text-success-700" : "bg-slate-100 text-slate-600")}>
        {c.verified ? <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> : <Lightbulb className="h-3.5 w-3.5" aria-hidden />}
        {c.verified ? "Customer story" : "Example scenario"}
      </p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ocean-700">{c.context}</p>
      <h3 className="mt-2 font-display text-xl font-bold text-navy-900">{c.headline}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{c.story}</p>

      {c.paid && c.publicPrice ? (
        <dl className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Shown publicly</dt>
            <dd className="font-display text-xl font-bold text-slate-500 line-through">{formatMoney(c.publicPrice)}</dd>
          </div>
          <div className="rounded-xl bg-success-50 p-3">
            <dt className="text-xs text-success-700">{c.traveler} paid</dt>
            <dd className="font-display text-xl font-extrabold text-success-700">{formatMoney(c.paid)}</dd>
          </div>
        </dl>
      ) : null}

      <p className="mt-auto flex items-start gap-2 pt-5 text-sm font-semibold text-navy-900">
        {pct ? <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-success-700" aria-hidden /> : <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-ocean-600" aria-hidden />}
        <span>{c.result}</span>
      </p>
    </article>
  );
}

/**
 * "What we've actually done" — real customer stories. Every entry is vetted in
 * src/content/case-studies.ts; nothing here is invented.
 */
export function CaseStudies({
  kind = "flight",
  title = "What that looks like in practice",
  description = "One real customer story, plus the situations we handle most. Prices in the customer story are what the traveler actually paid.",
  onDark = false,
  className,
}: {
  kind?: CaseStudy["kind"];
  title?: string;
  description?: string;
  onDark?: boolean;
  className?: string;
}) {
  const studies = caseStudiesFor(kind);
  if (!studies.length) return null;
  return (
    <section className={cn("py-12", onDark ? "bg-navy-950 text-white" : "bg-white", className)} aria-labelledby="cases-heading">
      <div className="container-page">
        <SectionHeading id="cases-heading" title={title} description={description} className={onDark ? "[&_h2]:text-white [&_p]:text-white/75" : undefined} />
        <div className={cn("mt-6 grid gap-5", studies.length > 2 ? "md:grid-cols-2 lg:grid-cols-3" : studies.length > 1 ? "md:grid-cols-2" : "max-w-2xl")}>
          {studies.map((c) => (
            <CaseStudyCard key={c.id} c={c} />
          ))}
        </div>
        <div className={cn("mt-6 flex flex-col gap-3 sm:flex-row sm:items-center", onDark ? "text-white/75" : "text-slate-600")}>
          <p className="text-sm">Stuck at the airport right now, or watching a fare climb? Message us and we&apos;ll work it.</p>
          <ChatButtons size="sm" showMessenger={false} onDark={onDark} whatsappLabel="Message an agent" text={`Hi ${site.name}! I need help with a trip. `} />
        </div>
      </div>
    </section>
  );
}
