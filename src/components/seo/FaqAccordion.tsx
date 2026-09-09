import { ChevronDown } from "lucide-react";
import type { FAQ } from "@/data/types";
import { cn } from "@/lib/utils";

/** Accessible FAQ list using native <details>. Pair with faqPageJsonLd() for rich results. */
export function FaqAccordion({ items, className, idPrefix }: { items: FAQ[]; className?: string; idPrefix?: string }) {
  return (
    <div className={cn("divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white", className)}>
      {items.map((f, i) => (
        <details key={f.question} id={idPrefix ? `${idPrefix}-${i}` : undefined} className="group px-5 py-4 open:bg-slate-50/60">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-semibold text-navy-900 marker:content-none [&::-webkit-details-marker]:hidden">
            <span>{f.question}</span>
            <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}
