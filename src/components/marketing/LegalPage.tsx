import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/seo/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { webPageJsonLd } from "@/lib/seo/jsonld";
import { LEGAL_DOCS, type LegalDoc } from "@/content/legal";

/** Shared layout for /legal/* documents: header, sticky table of contents, prose sections. */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  const path = `/legal/${doc.slug}`;
  return (
    <>
      <JsonLd data={webPageJsonLd({ name: doc.title, description: doc.description, path })} />
      <PageHeader crumbs={[{ name: "Home", path: "/" }, { name: "Legal", path: "/legal/terms" }, { name: doc.shortTitle, path }]} eyebrow={`Last updated: ${doc.lastUpdated}`} title={doc.title} lead={doc.summary} />
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[16rem_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-[calc(var(--header-height)+1rem)] lg:self-start">
          <nav aria-label="Document sections" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">On this page</p>
            <ol className="mt-3 space-y-1.5 text-sm">
              {doc.sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-navy-900 hover:text-ocean-700 hover:underline">
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <nav aria-label="Other legal documents" className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Also read</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {LEGAL_DOCS.filter((d) => d.slug !== doc.slug).map((d) => (
                <li key={d.slug}>
                  <Link href={`/legal/${d.slug}`} className="text-navy-900 hover:text-ocean-700 hover:underline">
                    {d.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <article className="max-w-3xl">
          <Alert tone="warning" title="Draft for legal review">
            This document was prepared as a starting point and has not yet been reviewed by an attorney. It should be confirmed by counsel before the site goes live.
          </Alert>
          <div className="prose-air1 mt-4">
            {doc.sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2>{s.heading}</h2>
                {s.paragraphs.map((p) => (
                  <p key={p.slice(0, 40)}>{p}</p>
                ))}
                {s.bullets && (
                  <ul>
                    {s.bullets.map((b) => (
                      <li key={b.slice(0, 40)}>{b}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </article>
      </div>
    </>
  );
}
