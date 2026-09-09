import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/seo/PageHeader";
import { ContactForm } from "@/components/marketing/ContactForm";
import { buildMetadata } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/jsonld";
import { getCurrentUser } from "@/lib/auth/current-user";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Contact Us — 24/7 US-Based Support",
  description: "Reach Air1 Tickets by phone 24/7, by email, or with the contact form. Help with existing bookings, refunds, new trips and website issues from our US-based team.",
  path: "/contact",
});

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ ref?: string; topic?: string }> }) {
  const { ref, topic } = await searchParams;
  const user = await getCurrentUser();
  return (
    <>
      <JsonLd data={webPageJsonLd({ name: "Contact", description: metadata.description ?? "", path: "/contact", type: "ContactPage" })} />
      <PageHeader crumbs={[{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }]} eyebrow="We're here 24/7" title="Contact Air1 Tickets" lead="For anything about a flight departing in the next 48 hours, call — it's the fastest way to reach an agent who can rebook you. For everything else, the form works well." />
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_20rem]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
          <ContactForm initialTopic={topic ?? ""} initialReference={ref ?? ""} initialEmail={user?.email ?? ""} />
        </div>
        <aside className="space-y-4">
          <div className="rounded-2xl bg-navy-900 p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-ocean-200">Call us</p>
            <a href={`tel:${site.supportPhone.replace(/[^\d+]/g, "")}`} className="mt-1 block font-display text-2xl font-extrabold">
              {site.supportPhone}
            </a>
            <p className="mt-2 flex items-center gap-2 text-sm text-white/80">
              <Clock className="h-4 w-4 text-ocean-300" aria-hidden /> 24 hours a day, every day
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-white/80">
              <Phone className="h-4 w-4 text-ocean-300" aria-hidden /> US-based agents · English and Spanish
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            <p className="flex items-center gap-2 text-sm font-semibold text-navy-900">
              <Mail className="h-4 w-4 text-ocean-600" aria-hidden /> Email
            </p>
            <a href={`mailto:${site.supportEmail}`} className="mt-1 block text-sm text-ocean-700 hover:underline">
              {site.supportEmail}
            </a>
            <p className="mt-1 text-xs text-slate-500">Replies within a few hours; include your booking reference.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            <p className="flex items-center gap-2 text-sm font-semibold text-navy-900">
              <MapPin className="h-4 w-4 text-ocean-600" aria-hidden /> Mailing address
            </p>
            <address className="mt-1 text-sm not-italic text-slate-600">
              {site.legalName}
              <br />
              {site.address.streetAddress}
              <br />
              {site.address.addressLocality}, {site.address.addressRegion} {site.address.postalCode}
            </address>
          </div>
        </aside>
      </div>
    </>
  );
}
