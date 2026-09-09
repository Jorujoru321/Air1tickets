import type { Metadata } from "next";
import { CalendarPlus, Mail, Phone, ShieldCheck, XCircle } from "lucide-react";
import { BookingLookupForm } from "@/components/account/BookingLookupForm";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Manage your booking", description: "Find your Air1 Tickets booking with your reference and last name to view your itinerary, resend your confirmation, add flights to your calendar or cancel.", robots: { index: false, follow: true } };

const CAN_DO = [
  { icon: Mail, text: "View your itinerary and resend the confirmation email" },
  { icon: CalendarPlus, text: "Add flights to your calendar" },
  { icon: XCircle, text: "Cancel within 24 hours of booking for a full refund (7+ days before departure)" },
  { icon: ShieldCheck, text: "See your airline confirmation code for online check-in" },
];

export default async function ManageBookingPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  return (
    <div className="bg-slate-50">
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div>
          <h1 className="text-3xl sm:text-4xl">Manage your booking</h1>
          <p className="mt-3 text-slate-600">Enter your Air1 booking reference and the lead passenger&apos;s last name. You&apos;ll find both on your confirmation email.</p>
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            <BookingLookupForm initialReference={ref} />
          </div>
        </div>
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            <h2 className="text-lg font-bold text-navy-900">What you can do here</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {CAN_DO.map((c) => (
                <li key={c.text} className="flex gap-3">
                  <c.icon className="mt-0.5 h-4 w-4 shrink-0 text-ocean-600" aria-hidden />
                  {c.text}
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-2xl bg-navy-900 p-6 text-white">
            <h2 className="text-lg font-bold text-white">Need to change flights?</h2>
            <p className="mt-2 text-sm text-white/80">Date and name changes are handled by our US-based agents so we can check the airline&apos;s fare rules for you. Call us 24/7 — have your reference ready.</p>
            <a href={`tel:${site.supportPhone.replace(/[^\d+]/g, "")}`} className="mt-4 inline-flex items-center gap-2 text-lg font-bold">
              <Phone className="h-5 w-5 text-ocean-300" aria-hidden /> {site.supportPhone}
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
