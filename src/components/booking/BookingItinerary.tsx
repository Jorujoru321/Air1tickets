import type { Offer, PassengerInput } from "@/lib/flights/types";
import { SliceTimeline, FareChips } from "@/components/results/ItineraryDetails";
import { cabinLabel } from "@/lib/flights/format";
import { airlineName } from "@/data/airlines";

const TITLES: Record<string, string> = { mr: "Mr", ms: "Ms", mrs: "Mrs", mx: "Mx", dr: "Dr" };
const TYPES: Record<string, string> = { adult: "Adult", child: "Child", infant: "Infant (lap)" };

/** Server-safe itinerary block used on the confirmation and manage-booking pages. */
export function BookingItinerary({ offer, passengers }: { offer: Offer; passengers?: PassengerInput[] }) {
  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {offer.slices.map((s, i) => (
          <SliceTimeline key={s.id} slice={s} title={offer.slices.length > 1 ? (i === 0 ? "Outbound" : "Return") : "Itinerary"} />
        ))}
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {airlineName(offer.owner)} · {offer.fare.brand} · {cabinLabel(offer.cabin)}
        </p>
        <FareChips offer={offer} />
      </div>
      {passengers && passengers.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Passengers</p>
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            {passengers.map((p, i) => (
              <li key={i} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm">
                <span className="font-semibold text-navy-900">
                  {TITLES[p.title]} {p.firstName} {p.middleName ? `${p.middleName} ` : ""}
                  {p.lastName}
                </span>
                <span className="text-xs text-slate-500">
                  {TYPES[p.type]}
                  {p.knownTravelerNumber ? " · KTN on file" : ""}
                  {p.passportNumber ? " · Passport on file" : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
