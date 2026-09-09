"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import type { FAQGroup } from "@/data/types";
import { FaqAccordion } from "@/components/seo/FaqAccordion";
import { Input } from "@/components/ui/Input";

/** Live filter across all FAQ groups. Renders the full grouped list when the query is empty. */
export function FaqSearch({ groups }: { groups: FAQGroup[] }) {
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();
  const filtered = q
    ? groups
        .map((g) => ({ ...g, items: g.items.filter((f) => `${f.question} ${f.answer}`.toLowerCase().includes(q)) }))
        .filter((g) => g.items.length)
    : groups;
  const count = filtered.reduce((n, g) => n + g.items.length, 0);

  return (
    <div>
      <div className="max-w-xl">
        <Input
          id="faq-search"
          label="Search the help center"
          placeholder="Try “cancel”, “bag”, “passport”…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftIcon={<Search className="h-5 w-5" aria-hidden />}
          rightSlot={
            query ? (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="rounded p-1 text-slate-400 hover:text-navy-900">
                <X className="h-4 w-4" aria-hidden />
              </button>
            ) : undefined
          }
        />
        <p className="mt-2 text-sm text-slate-500" role="status" aria-live="polite">
          {q ? `${count} answer${count === 1 ? "" : "s"} match “${query.trim()}”` : `${count} answers across ${groups.length} topics`}
        </p>
      </div>
      {filtered.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          Nothing matches yet. Try a shorter word, or contact us — we answer 24/7.
        </p>
      ) : (
        <div className="mt-8 space-y-12">
          {filtered.map((g) => (
            <section key={g.id} id={g.id} className="scroll-mt-24" aria-labelledby={`faq-${g.id}`}>
              <h2 id={`faq-${g.id}`} className="text-2xl">
                {g.title}
              </h2>
              <FaqAccordion className="mt-4" items={g.items} idPrefix={`faq-${g.id}`} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
