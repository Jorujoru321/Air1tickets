"use client";

import { ArrowLeft, Luggage, Minus, Plus, ShieldCheck, Sparkles, TicketCheck } from "lucide-react";
import type { ExtrasInput, ExtrasPricing, Offer } from "@/lib/flights/types";
import { cn, formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface ExtrasFormProps {
  offer: Offer;
  extras: ExtrasInput;
  pricing: ExtrasPricing;
  onChange: (patch: Partial<ExtrasInput>) => void;
  onBack: () => void;
  onContinue: () => void;
}

function ToggleCard({ title, price, priceNote, bullets, checked, onChange, icon: Icon, note }: { title: string; price: number; priceNote: string; bullets: string[]; checked: boolean; onChange: (c: boolean) => void; icon: React.ComponentType<{ className?: string }>; note?: string }) {
  return (
    <label className={cn("flex cursor-pointer gap-4 rounded-2xl border-2 bg-white p-5 transition", checked ? "border-ocean-600 bg-ocean-50/40" : "border-slate-200 hover:border-slate-300")}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 rounded border-slate-300 accent-ocean-600" />
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="font-bold text-navy-900">{title}</span>
          <span className="text-sm font-semibold text-navy-900">
            {formatMoney(price)} <span className="font-normal text-slate-500">{priceNote}</span>
          </span>
        </span>
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          {bullets.map((b) => (
            <li key={b} className="flex gap-2">
              <span className="text-success-600" aria-hidden>
                ✓
              </span>
              {b}
            </li>
          ))}
        </ul>
        {note && <span className="mt-2 block text-xs text-slate-500">{note}</span>}
      </span>
    </label>
  );
}

export function ExtrasForm({ offer, extras, pricing, onChange, onBack, onContinue }: ExtrasFormProps) {
  const paying = offer.passengers.adults + offer.passengers.children;
  const directions = offer.slices.length;
  const included = offer.fare.checkedBagsIncluded;
  const pref = extras.seats?.preference ?? "none";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6" aria-labelledby="bags-heading">
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
            <Luggage className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="bags-heading" className="text-lg font-bold text-navy-900">
              Checked bags
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Your {offer.fare.brand} fare includes {offer.fare.carryOnIncluded ? "a carry-on bag and a personal item" : "a personal item only"}
              {included > 0 ? ` plus ${included} checked bag${included > 1 ? "s" : ""} per traveler` : ""}. Add checked bags now — they&apos;re usually cheaper than at the airport.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
              <div>
                <p className="text-sm font-semibold text-navy-900">Extra checked bags per traveler, each way</p>
                <p className="text-xs text-slate-500">
                  {formatMoney(pricing.checkedBagFee)} per bag · up to 50 lb (23 kg) · {paying} traveler{paying > 1 ? "s" : ""} × {directions} direction{directions > 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" aria-label="Remove a bag" disabled={extras.checkedBags <= 0} onClick={() => onChange({ checkedBags: extras.checkedBags - 1 })} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 hover:bg-slate-50 disabled:opacity-40">
                  <Minus className="h-4 w-4" aria-hidden />
                </button>
                <span className="w-6 text-center text-lg font-bold tabular-nums" aria-live="polite">
                  {extras.checkedBags}
                </span>
                <button type="button" aria-label="Add a bag" disabled={extras.checkedBags >= 3} onClick={() => onChange({ checkedBags: extras.checkedBags + 1 })} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 hover:bg-slate-50 disabled:opacity-40">
                  <Plus className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
            {extras.checkedBags > 0 && (
              <p className="mt-2 text-sm font-semibold text-navy-900">
                {extras.checkedBags * paying * directions} bag{extras.checkedBags * paying * directions > 1 ? "s" : ""} · {formatMoney(extras.checkedBags * paying * directions * pricing.checkedBagFee)}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6" aria-labelledby="seats-heading">
        <h2 id="seats-heading" className="text-lg font-bold text-navy-900">
          Seat preference
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {offer.fare.seatSelection === "free"
            ? "Seat selection is included with your fare. Tell us what you prefer and we'll request it with the airline; you can also pick exact seats after booking on the airline's site."
            : offer.fare.seatSelection === "paid"
              ? `Seat selection costs extra on this fare (from ${formatMoney(pricing.seatFeeFrom)} per flight on the airline's site). We'll pass on your preference at no charge; if you don't choose, the airline assigns seats at check-in.`
              : "This fare doesn't allow advance seat selection. Seats are assigned at check-in, but we'll pass on your preference in case the airline can accommodate it."}
        </p>
        <div role="radiogroup" aria-labelledby="seats-heading" className="mt-4 grid grid-cols-3 gap-2 sm:max-w-md">
          {[
            ["window", "Window"],
            ["aisle", "Aisle"],
            ["none", "No preference"],
          ].map(([val, label]) => (
            <button
              key={val}
              type="button"
              role="radio"
              aria-checked={pref === val}
              onClick={() => onChange({ seats: val === "none" ? {} : { preference: val } })}
              className={cn("rounded-xl border-2 px-3 py-3 text-sm font-semibold transition", pref === val ? "border-ocean-600 bg-ocean-50 text-ocean-800" : "border-slate-200 text-navy-900 hover:border-slate-300")}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <ToggleCard
        icon={ShieldCheck}
        title="Travel protection"
        price={pricing.travelInsurance}
        priceNote="per traveler"
        checked={extras.travelInsurance}
        onChange={(c) => onChange({ travelInsurance: c })}
        bullets={["Trip cancellation and interruption for covered reasons", "Emergency medical and evacuation while traveling", "Baggage loss and delay reimbursement"]}
        note="Plans are provided by third-party insurers. Coverage, limits and exclusions are in the policy document sent with your confirmation."
      />

      {offer.fare.changeable ? (
        <ToggleCard
          icon={TicketCheck}
          title="Flexible ticket"
          price={pricing.flexibleTicket}
          priceNote="per traveler"
          checked={extras.flexibleTicket}
          onChange={(c) => onChange({ flexibleTicket: c })}
          bullets={["Change your travel dates once with no Air1 change fee", "Only pay any fare difference", "Request changes up to 24 hours before departure through our support team"]}
          note="Available on changeable fares only. Airline fare rules still apply."
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
          <span className="font-semibold text-navy-900">Flexible ticket isn&apos;t available</span> on {offer.fare.brand} fares because the airline doesn&apos;t allow date changes. Go back to choose a changeable fare if you need flexibility.
        </div>
      )}

      <ToggleCard
        icon={Sparkles}
        title="Priority boarding"
        price={pricing.priorityBoarding}
        priceNote="per traveler, each way"
        checked={extras.priorityBoarding}
        onChange={(c) => onChange({ priorityBoarding: c })}
        bullets={["Board in an earlier group so your carry-on fits overhead", "Available on most airlines; refunded automatically if the airline can't offer it"]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden />}>
          Back to passengers
        </Button>
        <Button type="button" size="lg" onClick={onContinue}>
          Continue to payment
        </Button>
      </div>
    </div>
  );
}
