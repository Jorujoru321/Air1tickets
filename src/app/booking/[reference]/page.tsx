import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Phone } from "lucide-react";
import { findBookingByReference, isWithinFreeCancellationWindow } from "@/lib/booking/service";
import { canAccessBooking } from "@/lib/booking/access";
import { isValidReference } from "@/lib/booking/reference";
import type { ExtrasInput, Offer, PassengerInput } from "@/lib/flights/types";
import { BookingItinerary } from "@/components/booking/BookingItinerary";
import { CalendarButton, CancelBooking, PrintButton, ResendButton } from "@/components/account/ManageBookingActions";
import { Badge } from "@/components/ui/Badge";
import { airlineName, getAirline } from "@/data/airlines";
import { getAirport } from "@/data/airports";
import { formatDateLong, formatMoney, toDateOnly } from "@/lib/utils";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your booking", robots: { index: false, follow: false } };

const STATUS: Record<string, { label: string; tone: "success" | "warning" | "danger" | "neutral" }> = {
  confirmed: { label: "Confirmed", tone: "success" },
  pending: { label: "Pending airline confirmation", tone: "warning" },
  failed: { label: "Failed", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

export default async function BookingDetailPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  if (!isValidReference(reference)) redirect("/booking");
  const booking = await findBookingByReference(reference);
  if (!booking) redirect(`/booking?ref=${encodeURIComponent(reference)}`);
  if (!(await canAccessBooking(booking))) redirect(`/booking?ref=${encodeURIComponent(booking.reference)}`);

  const offer = booking.offer as Offer;
  const passengers = booking.passengers as PassengerInput[];
  const extras = booking.extras as ExtrasInput;
  const airline = getAirline(booking.owner);
  const o = getAirport(booking.origin);
  const d = getAirport(booking.destination);
  const status = STATUS[booking.status] ?? STATUS.pending;
  const future = booking.departDate >= toDateOnly(new Date());
  const canCancel = booking.status === "confirmed" && future;

  return (
    <div className="bg-slate-50 print:bg-white">
      <div className="container-page max-w-5xl py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500 print:hidden">
              <Link href="/booking" className="hover:underline">
                Manage booking
              </Link>{" "}
              / {booking.reference}
            </p>
            <h1 className="mt-1 text-3xl">
              {o?.city ?? booking.origin} to {d?.city ?? booking.destination}
            </h1>
            <p className="mt-1 text-slate-600">
              {formatDateLong(booking.departDate)}
              {booking.returnDate ? ` – ${formatDateLong(booking.returnDate)}` : " · One way"} · {booking.passengerCount} traveler{booking.passengerCount > 1 ? "s" : ""}
            </p>
          </div>
          <Badge tone={status.tone} className="text-sm">
            {status.label}
          </Badge>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <dt className="text-xs uppercase tracking-wide text-slate-500">Air1 reference</dt>
            <dd className="mt-1 font-display text-2xl font-extrabold tracking-wider text-navy-900">{booking.reference}</dd>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <dt className="text-xs uppercase tracking-wide text-slate-500">{airline?.name ?? airlineName(booking.owner)} confirmation</dt>
            <dd className="mt-1 font-display text-2xl font-extrabold tracking-wider text-navy-900">{booking.airlinePnr ?? "Pending"}</dd>
            {booking.ticketNumbers.length > 0 && <dd className="mt-1 text-xs text-slate-500">E-ticket {booking.ticketNumbers.join(", ")}</dd>}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <dt className="text-xs uppercase tracking-wide text-slate-500">Total paid</dt>
            <dd className="mt-1 font-display text-2xl font-extrabold text-navy-900">{formatMoney(booking.priceTotal, { cents: true })}</dd>
            <dd className="mt-1 text-xs text-slate-500">Paid by card · {booking.paymentProvider === "demo" ? "demo payment" : "Stripe"}</dd>
          </div>
        </dl>

        {booking.status === "confirmed" && (
          <div className="mt-5 flex flex-wrap gap-2 print:hidden">
            <CalendarButton reference={booking.reference} />
            <ResendButton reference={booking.reference} />
            <PrintButton />
            {canCancel && <CancelBooking reference={booking.reference} fullRefund={isWithinFreeCancellationWindow(booking)} fareBrand={offer.fare.brand} refundable={offer.fare.refundable} />}
          </div>
        )}
        {booking.status === "cancelled" && (
          <p className="mt-5 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            This booking was cancelled{booking.cancelledAt ? ` on ${formatDateLong(booking.cancelledAt.slice(0, 10))}` : ""}. Any refund due is returned to the original payment method within 7 business days; we&apos;ll email you the amount once the airline confirms it.
          </p>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            <h2 className="mb-5 text-lg font-bold text-navy-900">Itinerary</h2>
            <BookingItinerary offer={offer} passengers={passengers} />
          </section>
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <h2 className="text-base font-bold text-navy-900">Payment summary</h2>
              <dl className="mt-3 space-y-1.5 text-sm text-slate-600">
                <div className="flex justify-between">
                  <dt>Fare</dt>
                  <dd>{formatMoney(booking.priceBase, { cents: true })}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Taxes &amp; fees</dt>
                  <dd>{formatMoney(booking.priceTaxes, { cents: true })}</dd>
                </div>
                {booking.priceExtras > 0 && (
                  <div className="flex justify-between">
                    <dt>
                      Extras
                      {extras.checkedBags ? ` · ${extras.checkedBags} bag${extras.checkedBags > 1 ? "s" : ""}/traveler each way` : ""}
                      {extras.travelInsurance ? " · protection" : ""}
                      {extras.flexibleTicket ? " · flexible" : ""}
                    </dt>
                    <dd>{formatMoney(booking.priceExtras, { cents: true })}</dd>
                  </div>
                )}
                {booking.serviceFee > 0 && (
                  <div className="flex justify-between">
                    <dt>Service fee</dt>
                    <dd>{formatMoney(booking.serviceFee, { cents: true })}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-navy-900">
                  <dt>Total</dt>
                  <dd>{formatMoney(booking.priceTotal, { cents: true })}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-slate-500">
                Contact: {booking.contactEmail} · {booking.contactPhone}
              </p>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card print:hidden">
              <h2 className="text-base font-bold text-navy-900">Check-in</h2>
              <p className="mt-2 text-sm text-slate-600">
                Check in with {airline?.name ?? "the airline"} from 24 hours before departure using confirmation <span className="font-semibold text-navy-900">{booking.airlinePnr ?? "(pending)"}</span>.
              </p>
              {airline?.website && (
                <a href={airline.website} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-ocean-700 hover:underline">
                  Go to {airline.name} →
                </a>
              )}
            </section>
            <section className="rounded-2xl bg-navy-900 p-6 text-white print:hidden">
              <h2 className="text-base font-bold text-white">Change flights or names</h2>
              <p className="mt-2 text-sm text-white/80">Changes go through our agents so we can apply the airline&apos;s fare rules correctly. Call 24/7 with your reference.</p>
              <a href={`tel:${site.supportPhone.replace(/[^\d+]/g, "")}`} className="mt-3 inline-flex items-center gap-2 font-bold">
                <Phone className="h-4 w-4 text-ocean-300" aria-hidden /> {site.supportPhone}
              </a>
              <p className="mt-3 text-xs text-white/60">
                Or{" "}
                <Link href={`/contact?ref=${booking.reference}&topic=existing`} className="underline">
                  send us a message
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
