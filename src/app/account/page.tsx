import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq, or } from "drizzle-orm";
import { ArrowRight, BellRing, Plane } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listBookingsForUser } from "@/lib/booking/service";
import { getDb, schema } from "@/lib/db/client";
import { getAirport } from "@/data/airports";
import { airlineName } from "@/data/airlines";
import { formatDateShort, toDateOnly } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SignOutButton } from "@/components/account/AuthForms";
import { DeleteAlertButton } from "@/components/account/ManageBookingActions";
import { AirlineLogo } from "@/components/results/AirlineLogo";
import type { Booking } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My trips", robots: { index: false, follow: false } };

const TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = { confirmed: "success", pending: "warning", failed: "danger", cancelled: "neutral" };

function TripCard({ b }: { b: Booking }) {
  const o = getAirport(b.origin);
  const d = getAirport(b.destination);
  return (
    <li>
      <Link href={`/booking/${b.reference}`} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition hover:border-ocean-300 hover:shadow-card-hover">
        <AirlineLogo iata={b.owner} size={40} />
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-navy-900">
            {o?.city ?? b.origin} → {d?.city ?? b.destination}
          </span>
          <span className="block text-sm text-slate-500">
            {formatDateShort(b.departDate)}
            {b.returnDate ? ` – ${formatDateShort(b.returnDate)}` : ""} · {airlineName(b.owner)} · {b.reference}
          </span>
        </span>
        <Badge tone={TONE[b.status] ?? "neutral"}>{b.status}</Badge>
        <ArrowRight className="hidden h-4 w-4 text-slate-500 sm:block" aria-hidden />
      </Link>
    </li>
  );
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login?next=/account");
  const bookings = await listBookingsForUser(user.id, user.email);
  const today = toDateOnly(new Date());
  const upcoming = bookings.filter((b) => b.departDate >= today && b.status !== "cancelled");
  const past = bookings.filter((b) => b.departDate < today || b.status === "cancelled");
  const db = await getDb();
  const alerts = await db
    .select()
    .from(schema.priceAlerts)
    .where(or(eq(schema.priceAlerts.userId, user.id), eq(schema.priceAlerts.email, user.email)))
    .orderBy(desc(schema.priceAlerts.createdAt));

  return (
    <div className="bg-slate-50">
      <div className="container-page max-w-5xl py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl">Hi {user.firstName}</h1>
            <p className="mt-1 text-slate-600">Your trips, alerts and account details.</p>
          </div>
          <SignOutButton />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_18rem]">
          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-bold text-navy-900">Upcoming trips</h2>
              {upcoming.length ? (
                <ul className="mt-3 space-y-3">
                  {upcoming.map((b) => (
                    <TripCard key={b.id} b={b} />
                  ))}
                </ul>
              ) : (
                <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                  <Plane className="mx-auto h-8 w-8 text-slate-300" aria-hidden />
                  <p className="mt-2 font-semibold text-navy-900">No upcoming trips</p>
                  <p className="mt-1 text-sm text-slate-500">Bookings made with {user.email} show up here automatically.</p>
                  <Button href="/flights" className="mt-4">
                    Search flights
                  </Button>
                </div>
              )}
            </section>
            {past.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-navy-900">Past &amp; cancelled</h2>
                <ul className="mt-3 space-y-3">
                  {past.map((b) => (
                    <TripCard key={b.id} b={b} />
                  ))}
                </ul>
              </section>
            )}
            <section>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-navy-900">Price alerts</h2>
                <Link href="/price-alerts" className="text-sm font-semibold text-ocean-700 hover:underline">
                  New alert
                </Link>
              </div>
              {alerts.length ? (
                <ul className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
                  {alerts.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                      <BellRing className="h-4 w-4 text-ocean-600" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="font-semibold text-navy-900">
                          {getAirport(a.origin)?.city ?? a.origin} → {getAirport(a.destination)?.city ?? a.destination}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {formatDateShort(a.departDate)}
                          {a.returnDate ? ` – ${formatDateShort(a.returnDate)}` : ""} · {a.passengers} traveler{a.passengers > 1 ? "s" : ""}
                        </span>
                      </span>
                      <DeleteAlertButton id={a.id} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-500">No alerts yet. Track a route and we&apos;ll email you when the fare drops.</p>
              )}
            </section>
          </div>
          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="text-base font-bold text-navy-900">Profile</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Name</dt>
                <dd className="text-navy-900">
                  {user.firstName} {user.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Email</dt>
                <dd className="break-all text-navy-900">{user.email}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Phone</dt>
                <dd className="text-navy-900">{user.phone ?? "—"}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-slate-500">
              To update your details or delete your account, email{" "}
              <a href="mailto:support@aironeagency.com" className="underline">
                support
              </a>
              .
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
