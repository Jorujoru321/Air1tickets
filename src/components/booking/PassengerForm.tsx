"use client";

import * as React from "react";
import { Check } from "lucide-react";
import type { Offer } from "@/lib/flights/types";
import { airlineName } from "@/data/airlines";
import { fareSummaryChips, offerCarriers } from "@/lib/flights/format";
import { cn, formatMoney } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { PASSPORT_COUNTRIES, type PassengerFormValues } from "./schemas";

export interface ContactValues {
  email: string;
  confirmEmail: string;
  phone: string;
  newsletter: boolean;
}

export type FieldErrors = Record<string, string>;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function DateOfBirthField({ idPrefix, value, onChange, error, label = "Date of birth" }: { idPrefix: string; value: string; onChange: (v: string) => void; error?: string; label?: string }) {
  const [y, m, d] = value ? value.split("-") : ["", "", ""];
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 111 }, (_, i) => String(thisYear - i));
  const set = (part: "y" | "m" | "d", v: string) => {
    const ny = part === "y" ? v : y;
    const nm = part === "m" ? v : m;
    const nd = part === "d" ? v : d;
    onChange(ny && nm && nd ? `${ny}-${nm}-${nd}` : ny || nm || nd ? `${ny || "0000"}-${nm || "00"}-${nd || "00"}` : "");
  };
  const errId = `${idPrefix}-dob-error`;
  return (
    <fieldset>
      <legend className="mb-1.5 block text-sm font-medium text-navy-900">{label}</legend>
      <div className="grid grid-cols-3 gap-2" aria-describedby={error ? errId : undefined}>
        <Select aria-label={`${label} month`} value={m} onChange={(e) => set("m", e.target.value)} aria-invalid={error ? true : undefined} id={`${idPrefix}-dob-m`}>
          <option value="">Month</option>
          {MONTHS.map((name, i) => (
            <option key={name} value={String(i + 1).padStart(2, "0")}>
              {name}
            </option>
          ))}
        </Select>
        <Select aria-label={`${label} day`} value={d} onChange={(e) => set("d", e.target.value)} aria-invalid={error ? true : undefined} id={`${idPrefix}-dob-d`}>
          <option value="">Day</option>
          {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0")).map((day) => (
            <option key={day} value={day}>
              {Number(day)}
            </option>
          ))}
        </Select>
        <Select aria-label={`${label} year`} value={y} onChange={(e) => set("y", e.target.value)} aria-invalid={error ? true : undefined} id={`${idPrefix}-dob-y`}>
          <option value="">Year</option>
          {years.map((yr) => (
            <option key={yr} value={yr}>
              {yr}
            </option>
          ))}
        </Select>
      </div>
      {error && (
        <p id={errId} className="mt-1.5 text-sm text-danger-600" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}

const TYPE_LABEL: Record<string, string> = { adult: "Adult", child: "Child (2–11)", infant: "Infant (under 2, on lap)" };

export function FareOptions({ options, activeId, onSelect }: { options: Offer[]; activeId: string; onSelect: (o: Offer) => void }) {
  if (options.length < 2) return null;
  const base = options[0].price.total;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6" aria-labelledby="fare-options-heading">
      <h2 id="fare-options-heading" className="text-lg font-bold text-navy-900">
        Choose your fare
      </h2>
      <p className="mt-1 text-sm text-slate-600">Same flights, different flexibility. Prices are the total for all travelers.</p>
      <div role="radiogroup" aria-labelledby="fare-options-heading" className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {options.map((o) => {
          const selected = o.id === activeId;
          const diff = o.price.total - base;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(o)}
              className={cn("relative flex flex-col rounded-xl border-2 p-4 text-left transition", selected ? "border-ocean-600 bg-ocean-50/60" : "border-slate-200 hover:border-slate-300")}
            >
              {selected && (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-ocean-600 text-white">
                  <Check className="h-3 w-3" aria-hidden />
                </span>
              )}
              <span className="pr-6 text-sm font-bold text-navy-900">{o.fare.brand}</span>
              <span className="mt-0.5 text-sm text-slate-600">{diff === 0 ? formatMoney(o.price.total, { cents: true }) : `+${formatMoney(diff, { cents: true })}`}</span>
              <ul className="mt-3 space-y-1 text-xs">
                {fareSummaryChips(o).map((c) => (
                  <li key={c.label} className={cn("flex items-center gap-1.5", c.included ? "text-slate-700" : "text-slate-500")}>
                    <span aria-hidden className={c.included ? "text-success-600" : ""}>
                      {c.included ? "✓" : "✕"}
                    </span>
                    {c.label}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
    </section>
  );
}

interface PassengerFormProps {
  offer: Offer;
  passengers: PassengerFormValues[];
  contact: ContactValues;
  errors: FieldErrors;
  international: boolean;
  onPassengerChange: (index: number, patch: Partial<PassengerFormValues>) => void;
  onContactChange: (patch: Partial<ContactValues>) => void;
  onContinue: () => void;
}

export function PassengerForm({ offer, passengers, contact, errors, international, onPassengerChange, onContactChange, onContinue }: PassengerFormProps) {
  const carriers = offerCarriers(offer);
  const errorCount = Object.keys(errors).length;
  return (
    <div className="space-y-6">
      {errorCount > 0 && (
        <Alert tone="danger" title="Please fix the highlighted fields">
          {errorCount === 1 ? "There is 1 problem with the details below." : `There are ${errorCount} problems with the details below.`}
        </Alert>
      )}
      {passengers.map((p, i) => {
        const e = (f: string) => errors[`p${i}.${f}`];
        const id = `p${i}`;
        return (
          <section key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6" aria-labelledby={`${id}-heading`}>
            <h2 id={`${id}-heading`} className="text-lg font-bold text-navy-900">
              Passenger {i + 1} <span className="ml-2 text-sm font-medium text-slate-500">{TYPE_LABEL[p.type]}</span>
            </h2>
            <p className="mt-1 text-sm text-slate-600">Enter names exactly as they appear on the government ID used for travel.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-6">
              <Select label="Title" containerClassName="sm:col-span-1" value={p.title} onChange={(ev) => onPassengerChange(i, { title: ev.target.value as PassengerFormValues["title"] })} id={`${id}-title`} autoComplete="honorific-prefix">
                <option value="mr">Mr</option>
                <option value="ms">Ms</option>
                <option value="mrs">Mrs</option>
                <option value="mx">Mx</option>
                <option value="dr">Dr</option>
              </Select>
              <Input label="First name" containerClassName="sm:col-span-2" value={p.firstName} onChange={(ev) => onPassengerChange(i, { firstName: ev.target.value })} error={e("firstName")} autoComplete={i === 0 ? "given-name" : "off"} id={`${id}-first`} />
              <Input label="Middle name (optional)" containerClassName="sm:col-span-1" value={p.middleName ?? ""} onChange={(ev) => onPassengerChange(i, { middleName: ev.target.value })} error={e("middleName")} autoComplete={i === 0 ? "additional-name" : "off"} id={`${id}-middle`} />
              <Input label="Last name" containerClassName="sm:col-span-2" value={p.lastName} onChange={(ev) => onPassengerChange(i, { lastName: ev.target.value })} error={e("lastName")} autoComplete={i === 0 ? "family-name" : "off"} id={`${id}-last`} />
              <div className="sm:col-span-4">
                <DateOfBirthField idPrefix={id} value={p.dateOfBirth} onChange={(v) => onPassengerChange(i, { dateOfBirth: v })} error={e("dateOfBirth")} />
              </div>
              <Select label="Gender" containerClassName="sm:col-span-2" value={p.gender} onChange={(ev) => onPassengerChange(i, { gender: ev.target.value as PassengerFormValues["gender"] })} hint="As shown on your ID (TSA Secure Flight)" id={`${id}-gender`}>
                <option value="m">Male</option>
                <option value="f">Female</option>
                <option value="x">Unspecified (X)</option>
              </Select>
            </div>

            {international && (
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-bold text-navy-900">Passport</h3>
                <p className="mt-0.5 text-xs text-slate-500">Required for international itineraries. Must be valid for your whole trip; many countries require 6 months beyond your return date.</p>
                <div className="mt-3 grid gap-4 sm:grid-cols-3">
                  <Input label="Passport number" value={p.passportNumber ?? ""} onChange={(ev) => onPassengerChange(i, { passportNumber: ev.target.value.toUpperCase() })} error={e("passportNumber")} autoComplete="off" id={`${id}-passport`} />
                  <Select label="Issuing country" value={p.passportCountry ?? ""} onChange={(ev) => onPassengerChange(i, { passportCountry: ev.target.value })} error={e("passportCountry")} id={`${id}-passport-country`}>
                    <option value="">Select country</option>
                    {PASSPORT_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                  <DateOfBirthField idPrefix={`${id}-pp`} label="Expiration date" value={p.passportExpiry ?? ""} onChange={(v) => onPassengerChange(i, { passportExpiry: v })} error={e("passportExpiry")} />
                </div>
              </div>
            )}

            <details className="mt-5 group">
              <summary className="cursor-pointer list-none text-sm font-semibold text-ocean-700 hover:underline marker:content-none [&::-webkit-details-marker]:hidden">
                Add Known Traveler Number, Redress or frequent flyer (optional)
              </summary>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Input label="Known Traveler Number" hint="TSA PreCheck / Global Entry" value={p.knownTravelerNumber ?? ""} onChange={(ev) => onPassengerChange(i, { knownTravelerNumber: ev.target.value })} error={e("knownTravelerNumber")} id={`${id}-ktn`} />
                <Input label="Redress number" value={p.redressNumber ?? ""} onChange={(ev) => onPassengerChange(i, { redressNumber: ev.target.value })} error={e("redressNumber")} id={`${id}-redress`} />
                <Select label="Frequent flyer program" value={p.frequentFlyerAirline ?? ""} onChange={(ev) => onPassengerChange(i, { frequentFlyerAirline: ev.target.value })} id={`${id}-ff-airline`}>
                  <option value="">None</option>
                  {carriers.map((c) => (
                    <option key={c} value={c}>
                      {airlineName(c)}
                    </option>
                  ))}
                </Select>
                <Input label="Frequent flyer number" value={p.frequentFlyerNumber ?? ""} onChange={(ev) => onPassengerChange(i, { frequentFlyerNumber: ev.target.value })} error={e("frequentFlyerNumber")} id={`${id}-ff-number`} />
              </div>
            </details>
          </section>
        );
      })}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6" aria-labelledby="contact-heading">
        <h2 id="contact-heading" className="text-lg font-bold text-navy-900">
          Contact details
        </h2>
        <p className="mt-1 text-sm text-slate-600">We&apos;ll send your e-tickets here and text you if anything changes with your flight.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Input label="Email" type="email" inputMode="email" value={contact.email} onChange={(ev) => onContactChange({ email: ev.target.value })} error={errors["contact.email"]} autoComplete="email" id="contact-email" />
          <Input label="Confirm email" type="email" inputMode="email" value={contact.confirmEmail} onChange={(ev) => onContactChange({ confirmEmail: ev.target.value })} error={errors["contact.confirmEmail"]} autoComplete="off" id="contact-confirm-email" />
          <Input label="Mobile phone" type="tel" inputMode="tel" placeholder="+1 (555) 123-4567" value={contact.phone} onChange={(ev) => onContactChange({ phone: ev.target.value })} error={errors["contact.phone"]} autoComplete="tel" id="contact-phone" />
        </div>
        <Checkbox className="mt-4" checked={contact.newsletter} onChange={(ev) => onContactChange({ newsletter: ev.target.checked })} label="Send me fare drops and travel deals" description="A few emails a month. Unsubscribe any time." id="contact-newsletter" />
      </section>

      <div className="flex justify-end">
        <Button type="button" size="lg" onClick={onContinue}>
          Continue to extras
        </Button>
      </div>
    </div>
  );
}
