import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Clock, Lightbulb, UserRound } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SectionHeading } from "@/components/seo/SectionHeading";
import { FaqAccordion } from "@/components/seo/FaqAccordion";
import { DestinationArt } from "@/components/marketing/DestinationArt";
import { DestinationCard } from "@/components/marketing/DestinationCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo/metadata";
import { articleJsonLd, faqPageJsonLd } from "@/lib/seo/jsonld";
import { articlePath, routePath } from "@/lib/seo/slugs";
import { ARTICLES } from "@/content/articles";
import { getDestination } from "@/data/destinations";
import { getAirport } from "@/data/airports";
import type { Destination } from "@/data/types";
import { formatDateLong, slugify } from "@/lib/utils";

export const revalidate = 86400;
export const dynamicParams = false;

type PageProps = { params: Promise<{ slug: string }> };

const CATEGORY_LABELS = { tips: "Saving money on flights", airlines: "Airlines & fares", airports: "Airports & security", guides: "Trip planning" } as const;

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const a = ARTICLES.find((x) => x.slug === slug);
  if (!a) return {};
  return buildMetadata({ title: a.title, description: a.description, path: articlePath(a.slug), type: "article", publishedTime: a.publishedAt, modifiedTime: a.updatedAt, keywords: a.keywords });
}

/** Related slugs can be destination slugs ("las-vegas") or route slugs ("new-york-to-los-angeles"). */
function relatedLinks(slugs: string[] = []): { destinations: Destination[]; routes: { href: string; label: string }[] } {
  const destinations: Destination[] = [];
  const routes: { href: string; label: string }[] = [];
  for (const s of slugs) {
    const d = getDestination(s);
    if (d) {
      destinations.push(d);
      continue;
    }
    const m = s.match(/^([a-z-]+)-to-([a-z-]+)$/);
    if (m) {
      const o = getDestination(m[1]);
      const dd = getDestination(m[2]);
      if (o && dd) {
        const oa = getAirport(o.airports[0]);
        const da = getAirport(dd.airports[0]);
        if (oa && da) routes.push({ href: routePath(oa, da), label: `Cheap flights from ${o.city} to ${dd.city}` });
      }
    }
  }
  return { destinations, routes };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const a = ARTICLES.find((x) => x.slug === slug);
  if (!a) notFound();
  const path = articlePath(a.slug);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Travel guides", path: "/travel-guides" },
    { name: a.title, path },
  ];
  const toc = a.sections.map((s) => ({ id: slugify(s.heading), label: s.heading }));
  const related = relatedLinks(a.relatedDestinations);
  const more = ARTICLES.filter((x) => x.slug !== a.slug)
    .sort((x, y) => Number(y.category === a.category) - Number(x.category === a.category))
    .slice(0, 3);

  return (
    <>
      <JsonLd data={[articleJsonLd({ title: a.title, description: a.description, path, publishedAt: a.publishedAt, updatedAt: a.updatedAt, author: a.author.name, keywords: a.keywords }), ...(a.faqs?.length ? [faqPageJsonLd(a.faqs)] : [])]} />

      <header className="border-b border-slate-200/80 bg-white">
        <div className="container-page pt-6 sm:pt-8">
          <Breadcrumbs items={crumbs} />
          <div className="mt-6 grid gap-8 pb-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <Badge tone="ocean">{CATEGORY_LABELS[a.category]}</Badge>
              <h1 className="mt-3 text-3xl sm:text-4xl lg:text-[2.6rem] lg:leading-[1.1]">{a.title}</h1>
              <p className="mt-4 text-lg text-slate-600">{a.description}</p>
              <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                <div>
                  <dt className="sr-only">Author</dt>
                  <dd className="flex items-center gap-1.5">
                    <UserRound className="h-4 w-4" aria-hidden />
                    {a.author.name} · {a.author.role}
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">Updated</dt>
                  <dd className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" aria-hidden />
                    Updated <time dateTime={a.updatedAt}>{formatDateLong(a.updatedAt)}</time>
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">Reading time</dt>
                  <dd className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" aria-hidden />
                    {a.readingMinutes} min read
                  </dd>
                </div>
              </dl>
            </div>
            <div className="aspect-[16/9] overflow-hidden rounded-2xl shadow-card lg:aspect-[4/3]">
              <DestinationArt theme={a.heroTheme} gradient={a.gradient} seed={`article-${a.slug}`} priority />
            </div>
          </div>
        </div>
      </header>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[16rem_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-[calc(var(--header-height)+1rem)] lg:self-start">
          <nav aria-label="In this guide" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">In this guide</p>
            <ol className="mt-3 space-y-1.5 text-sm">
              {toc.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="text-navy-900 hover:text-ocean-700 hover:underline">
                    {t.label}
                  </a>
                </li>
              ))}
              {a.faqs?.length ? (
                <li>
                  <a href="#faq" className="text-navy-900 hover:text-ocean-700 hover:underline">
                    Frequently asked questions
                  </a>
                </li>
              ) : null}
            </ol>
          </nav>
          <div className="rounded-2xl bg-navy-900 p-5 text-white">
            <p className="font-display text-lg font-bold">Ready to put it to use?</p>
            <p className="mt-1 text-sm text-white/75">Compare fares from 500+ airlines with the true total price shown up front.</p>
            <Button href="/flights" variant="primary" className="mt-4 w-full">
              Search flights
            </Button>
          </div>
        </aside>

        <article className="max-w-3xl">
          <p className="text-lg leading-relaxed text-slate-700">{a.intro}</p>

          <aside className="mt-8 rounded-2xl border border-sunrise-200 bg-sunrise-50 p-5" aria-labelledby="takeaways-heading">
            <p id="takeaways-heading" className="flex items-center gap-2 font-display text-base font-bold text-navy-900">
              <Lightbulb className="h-5 w-5 text-sunrise-600" aria-hidden /> Key takeaways
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {a.takeaways.map((t) => (
                <li key={t.slice(0, 40)} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sunrise-500" aria-hidden />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </aside>

          <div className="prose-air1">
            {a.sections.map((s) => (
              <section key={s.heading} id={slugify(s.heading)} className="scroll-mt-24">
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

          {a.faqs?.length ? (
            <section id="faq" className="mt-12 scroll-mt-24">
              <SectionHeading title="Frequently asked questions" />
              <FaqAccordion className="mt-5" items={a.faqs} idPrefix="article-faq" />
            </section>
          ) : null}

          {related.routes.length > 0 && (
            <section className="mt-12">
              <SectionHeading as="h3" title="Related routes" />
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {related.routes.map((r) => (
                  <li key={r.href}>
                    <Link href={r.href} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-navy-900 transition hover:border-ocean-300">
                      {r.label} <ArrowRight className="h-4 w-4 text-ocean-600" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            Written by {a.author.name}. First published <time dateTime={a.publishedAt}>{formatDateLong(a.publishedAt)}</time>; fees, rules and prices verified as of the update date above. Airline policies change: always confirm the fare rules shown at checkout for your specific ticket.
          </p>
        </article>
      </div>

      {related.destinations.length > 0 && (
        <section className="bg-white py-12">
          <div className="container-page">
            <SectionHeading title="Destinations mentioned in this guide" link={{ href: "/destinations", label: "All destinations" }} />
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.destinations.slice(0, 3).map((d) => (
                <DestinationCard key={d.slug} d={d} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container-page py-12">
        <SectionHeading title="More guides" link={{ href: "/travel-guides", label: "All travel guides" }} />
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {more.map((m) => (
            <li key={m.slug}>
              <Link href={articlePath(m.slug)} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover">
                <div className="aspect-[16/9]">
                  <DestinationArt theme={m.heroTheme} gradient={m.gradient} seed={`article-${m.slug}`} />
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ocean-700">{CATEGORY_LABELS[m.category]}</p>
                  <p className="mt-1 font-semibold text-navy-900 group-hover:text-ocean-700">{m.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{m.readingMinutes} min read</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
