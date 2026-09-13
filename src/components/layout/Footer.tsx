import Link from "next/link";
import { CreditCard, Lock, Phone, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";
import { FOOTER_COMPANY, FOOTER_LEGAL, FOOTER_SUPPORT, visibleLinks } from "./nav";
import { NewsletterForm } from "./NewsletterForm";
import { isLeadMode, site } from "@/lib/site";
import { POPULAR_ROUTES } from "@/data/routes";
import { POPULAR_DESTINATIONS, featuredDestinations } from "@/data/destinations";
import { getAirport } from "@/data/airports";
import { destinationPath, routePath } from "@/lib/seo/slugs";

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/60">{title}</h2>
      {children}
    </div>
  );
}

const linkClass = "text-sm text-white/80 hover:text-white hover:underline underline-offset-4";

export function Footer() {
  const routes = POPULAR_ROUTES.slice(0, 8);
  const destinations = featuredDestinations(8);
  return (
    <footer className="mt-auto bg-navy-950 text-white">
      <div className="border-b border-white/10">
        <div className="container-page grid gap-8 py-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Get the best fares first</h2>
            <p className="mt-1 max-w-xl text-sm text-white/70">Weekly deal alerts from US airports, mistake fares, and tips from our travel editors. No spam — unsubscribe any time.</p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo inverse />
          <p className="mt-4 text-sm leading-relaxed text-white/70">{site.tagline} US-based travel agency with real people on the phone, 24/7.</p>
          <a href={`tel:${site.supportPhone.replace(/[^\d+]/g, "")}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white">
            <Phone className="h-4 w-4 text-ocean-400" aria-hidden /> {site.supportPhone}
          </a>
          <p className="mt-1 text-xs text-white/50">
            {site.address.streetAddress}, {site.address.addressLocality}, {site.address.addressRegion} {site.address.postalCode}
          </p>
        </div>

        <FooterColumn title="Company">
          <ul className="space-y-2">
            {visibleLinks(FOOTER_COMPANY).map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkClass}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </FooterColumn>

        <FooterColumn title="Support">
          <ul className="space-y-2">
            {visibleLinks(FOOTER_SUPPORT).map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkClass}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </FooterColumn>

        <FooterColumn title="Popular routes">
          <ul className="space-y-2">
            {routes.map((r) => {
              const o = getAirport(r.origin);
              const d = getAirport(r.destination);
              if (!o || !d) return null;
              return (
                <li key={`${r.origin}-${r.destination}`}>
                  <Link href={routePath(o, d)} className={linkClass}>
                    {o.city} to {d.city}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link href="/cheap-flights" className="text-sm font-semibold text-ocean-300 hover:text-ocean-200">
                All routes →
              </Link>
            </li>
          </ul>
        </FooterColumn>

        <FooterColumn title="Top destinations">
          <ul className="space-y-2">
            {destinations.map((d) => (
              <li key={d.slug}>
                <Link href={destinationPath(d.slug)} className={linkClass}>
                  Flights to {d.city}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/destinations" className="text-sm font-semibold text-ocean-300 hover:text-ocean-200">
                All destinations →
              </Link>
            </li>
          </ul>
        </FooterColumn>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-4 py-6 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" aria-hidden /> {isLeadMode ? "Locking a fare is free — no card" : "256-bit SSL secure checkout"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" aria-hidden /> {isLeadMode ? "Pay only when you accept your deal" : "Visa · Mastercard · Amex · Discover"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> {isLeadMode ? "Real US-based agents on WhatsApp" : "24-hour free cancellation"}
            </span>
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {visibleLinks(FOOTER_LEGAL).map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="container-page pb-6 text-xs text-white/60">
          © {new Date().getFullYear()} {site.legalName}. All rights reserved. Prices shown in US dollars and include taxes and fees unless noted. Airline names and logos are trademarks of their respective owners.
        </div>
      </div>
    </footer>
  );
}
