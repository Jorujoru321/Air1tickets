import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarPlus, CheckCircle2, Clock, Mail, Phone, XCircle } from "lucide-react";
import { findBookingByReference } from "@/lib/booking/service";
import { canAccessBooking } from "@/lib/booking/access";
import { isValidReference } from "@/lib/booking/reference";
import type { Offer, PassengerInput } from "@/lib/flights/types";
import { BookingItinerary } from "@/components/booking/BookingItinerary";
import { PendingPoller, PrintButton } from "@/components/booking/ConfirmationClient";
import { Button } from "@/components/ui/Button";
import { airlineName, getAirline } from "@/data/airlines";
import { getAirport, isDomesticUS } from "@/data/airports";
import { formatMoney } from "@/lib/utils";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Booking confirmation", robots: { index: false, follow: false } };

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  if (!ref || !isValidReference(ref)) redirect("/booking");
  const booking = await findBookingByReference(ref);
  if (!booking) redirect(`/booking?ref=${encodeURIComponent(ref)}`);
  if (!(await canAccessBooking(booking))) redirect(`/booking?ref=${encodeURIComponent(booking.reference)}`);

  const offer = booking.offer as Offer;
  const passengers = booking.passengers as PassengerInput[];
  const airline = getAirline(booking.owner);
  const dest = getAirport(booking.destination);
  const international = offer.slices.some((s) => s.segments.some((seg) => !isDomesticUS(seg.origin, seg.destination)));
  const status = booking.status;

  return (
    <div className="bg-slate-50">
      <div className="container-page max-w-5xl py-10">
        <section className={`rounded-2xl p-6 text-white sm:p-8 ${status === "confirmed" ? "bg-navy-900" : status === "failed" ? "bg-danger-700" : "bg-navy-800"}`}>
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10">
              {status === "confirmed" ? <CheckCircle2 className="h-7 w-7 text-success-500" aria-hidden /> : status === "failed" ? <XCircle className="h-7 w-7" aria-hidden /> : <Clock className="h-7 w-7 text-sunrise-300" aria-hidden />}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl text-white sm:text-3xl">{status === "confirmed" ? `You're booked, ${booking.leadFirstName}!` : status === "failed" ? "We couldn't complete this booking" : "Almost there — confirming with the airline"}</h1>
              <p className="mt-2 text-white/80">
                {status === "confirmed" && (
                  <>
                    Your trip to {dest?.city ?? booking.destination} is confirmed. We&apos;ve emailed your e-ticket receipt to <span className="font-semibold text-white">{booking.contactEmail}</span>.
                  </>
                )}
                {status === "failed" && <>The airline could not issue tickets for this fare{booking.failureReason ? ` (${booking.failureReason})` : ""}. Your payment will be released automatically within 5–7 business days, and you have not been charged for the ticket. Please search again or call us and we&apos;ll rebook you.</>}
                {status === "pending" && <PendingPoller reference={booking.reference} />}
              </p>
              <dl className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-white/10 p-4">
                  <dt className="text-xs uppercase tracking-wide text-white/60">Air1 reference</dt>
                  <dd className="mt-1 font-display text-2xl font-extrabold tracking-wider">{booking.reference}</dd>
                </div>
                <div className="rounded-xl bg-white/10 p-4">
                  <dt className="text-xs uppercase tracking-wide text-white/60">{airline?.name ?? airlineName(booking.owner)} confirmation</dt>
                  <dd className="mt-1 font-display text-2xl font-extrabold tracking-wider">{booking.airlinePnr ?? "Pending"}</dd>
                </div>
                <div className="rounded-xl bg-white/10 p-4">
                  <dt className="text-xs uppercase tracking-wide text-white/60">Total paid</dt>
                  <dd className="mt-1 font-display text-2xl font-extrabold">{formatMoney(booking.priceTotal, { cents: true })}</dd>
                </div>
              </dl>
            </div>
          </div>
          {status === "confirmed" && (
            <div className="mt-6 flex flex-wrap gap-2 print:hidden">
              <Button href={`/booking/${booking.reference}`} variant="white">
                Manage booking
              </Button>
              <Button href={`/api/bookings/${booking.reference}/calendar`} variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10" leftIcon={<CalendarPlus className="h-4 w-4" aria-hidden />}>
                Add to calendar
              </Button>
              <PrintButton />
            </div>
          )}
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            <h2 className="mb-5 text-lg font-bold text-navy-900">Your itinerary</h2>
            <BookingItinerary offer={offer} passengers={passengers} />
          </section>

          <div className="space-y-6">
            {status === "confirmed" && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
                <h2 className="text-base font-bold text-navy-900">What&apos;s next</h2>
                <ol className="mt-3 space-y-3 text-sm text-slate-600">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ocean-50 text-xs font-bold text-ocean-700">1</span>
                    <span>
                      Check in online with {airline?.name ?? "the airline"} starting 24 hours before departure using confirmation <span className="font-semibold text-navy-900">{booking.airlinePnr}</span>.
                      {airline?.website && (
                        <>
                          {" "}
                          <a href={airline.website} target="_blank" rel="noopener noreferrer" className="text-ocean-700 underline">
                            Airline website
                          </a>
                        </>
                      )}
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ocean-50 text-xs font-bold text-ocean-700">2</span>
                    <span>{international ? "Bring a passport valid for your whole trip. Check visa or travel-authorization requirements for your destination." : "Bring a REAL ID–compliant license or a passport for TSA screening."}</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ocean-50 text-xs font-bold text-ocean-700">3</span>
                    <span>Arrive {international ? "3 hours" : "2 hours"} before departure. Bag allowance: {offer.fare.carryOnIncluded ? "carry-on + personal item" : "personal item"} {offer.fare.checkedBagsIncluded > 0 ? `+ ${offer.fare.checkedBagsIncluded} checked` : ""}.</span>
                  </li>
                </ol>
              </section>
            )}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <h2 className="text-base font-bold text-navy-900">Need help?</h2>
              <p className="mt-1 text-sm text-slate-600">Our US-based team is available 24/7.</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a href={`tel:${site.supportPhone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-2 font-semibold text-navy-900">
                    <Phone className="h-4 w-4 text-ocean-600" aria-hidden /> {site.supportPhone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${site.supportEmail}`} className="inline-flex items-center gap-2 font-semibold text-navy-900">
                    <Mail className="h-4 w-4 text-ocean-600" aria-hidden /> {site.supportEmail}
                  </a>
                </li>
              </ul>
              <p className="mt-3 text-xs text-slate-500">
                Quote reference <span className="font-semibold">{booking.reference}</span> when you contact us. See our{" "}
                <Link href="/help#changes" className="text-ocean-700 underline">
                  change and cancellation policy
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
