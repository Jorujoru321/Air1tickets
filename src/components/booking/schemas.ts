/**
 * Zod schemas shared by the checkout UI (client) and the bookings API (server).
 * Keep this file free of client-only or server-only imports.
 */
import { z } from "zod";
import type { Offer, PassengerInput, PassengerType } from "@/lib/flights/types";
import { daysBetween } from "@/lib/utils";

const NAME_RE = /^[A-Za-z][A-Za-z' .-]*$/;

export const nameSchema = z.string().trim().min(1, "Required").max(40, "Too long").regex(NAME_RE, "Letters, spaces, hyphens and apostrophes only");

export const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use MM/DD/YYYY")
  .refine((s) => {
    const [y, m, d] = s.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
  }, "Enter a valid date");

export const passengerSchema = z.object({
  type: z.enum(["adult", "child", "infant"]),
  title: z.enum(["mr", "ms", "mrs", "mx", "dr"]),
  firstName: nameSchema,
  middleName: z.string().trim().max(40).regex(/^([A-Za-z][A-Za-z' .-]*)?$/, "Letters only").optional().or(z.literal("")),
  lastName: nameSchema,
  dateOfBirth: dateOnlySchema,
  gender: z.enum(["m", "f", "x"]),
  passportNumber: z.string().trim().max(20).regex(/^[A-Za-z0-9]*$/, "Letters and numbers only").optional().or(z.literal("")),
  passportCountry: z.string().trim().regex(/^([A-Z]{2})?$/).optional().or(z.literal("")),
  passportExpiry: dateOnlySchema.optional().or(z.literal("")),
  knownTravelerNumber: z.string().trim().max(25).regex(/^[A-Za-z0-9]*$/, "Letters and numbers only").optional().or(z.literal("")),
  redressNumber: z.string().trim().max(15).regex(/^[A-Za-z0-9]*$/, "Letters and numbers only").optional().or(z.literal("")),
  frequentFlyerAirline: z.string().trim().max(2).optional().or(z.literal("")),
  frequentFlyerNumber: z.string().trim().max(25).regex(/^[A-Za-z0-9]*$/, "Letters and numbers only").optional().or(z.literal("")),
});

export const contactSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  phone: z.string().trim().regex(/^\+?[0-9\s().-]{7,20}$/, "Enter a valid phone number"),
  newsletter: z.boolean().optional(),
});

export const extrasSchema = z.object({
  checkedBags: z.number().int().min(0).max(3),
  seats: z.record(z.string(), z.string().max(20)).optional(),
  travelInsurance: z.boolean(),
  flexibleTicket: z.boolean(),
  priorityBoarding: z.boolean(),
});

export const demoCardSchema = z.object({
  number: z.string().trim().min(12).max(23),
  expMonth: z.number().int().min(1).max(12),
  expYear: z.number().int().min(2024).max(2060),
  cvc: z.string().trim().regex(/^\d{3,4}$/, "3 or 4 digits"),
  name: z.string().trim().min(2, "Name on card").max(60),
  zip: z.string().trim().min(3).max(10),
});

export const paymentSchema = z.discriminatedUnion("provider", [
  z.object({ provider: z.literal("stripe"), paymentIntentId: z.string().min(5) }),
  z.object({ provider: z.literal("demo"), card: demoCardSchema }),
]);

export const bookingRequestSchema = z.object({
  offerId: z.string().min(3).max(2000),
  passengers: z.array(passengerSchema).min(1).max(9),
  contact: contactSchema,
  extras: extrasSchema,
  payment: paymentSchema,
});

export type BookingRequest = z.infer<typeof bookingRequestSchema>;
export type PassengerFormValues = z.infer<typeof passengerSchema>;

/* ───────────────────────── Business-rule validation ───────────────────────── */

export function ageOn(dateOfBirth: string, onDate: string): number {
  const days = daysBetween(dateOfBirth, onDate);
  return Math.floor(days / 365.25);
}

/** Age rules per passenger type as of the departure date. */
export function passengerAgeProblem(p: Pick<PassengerFormValues, "type" | "dateOfBirth">, departDate: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.dateOfBirth)) return null;
  if (p.dateOfBirth > departDate) return "Date of birth can't be in the future";
  const age = ageOn(p.dateOfBirth, departDate);
  if (p.type === "infant" && age >= 2) return "Infants must be under 2 on the departure date";
  if (p.type === "child" && (age < 2 || age > 11)) return "Children must be 2–11 on the departure date";
  if (p.type === "adult" && age < 12) return "Adults must be 12 or older";
  if (age > 120) return "Enter a valid date of birth";
  return null;
}

export function passportRequired(offer: Offer, isDomestic: (a: string, b: string) => boolean): boolean {
  return offer.slices.some((s) => s.segments.some((seg) => !isDomestic(seg.origin, seg.destination)));
}

export function passportProblems(p: PassengerFormValues, lastTravelDate: string): Partial<Record<"passportNumber" | "passportCountry" | "passportExpiry", string>> {
  const out: Partial<Record<"passportNumber" | "passportCountry" | "passportExpiry", string>> = {};
  if (!p.passportNumber) out.passportNumber = "Passport number is required for international travel";
  if (!p.passportCountry) out.passportCountry = "Select the issuing country";
  if (!p.passportExpiry) out.passportExpiry = "Enter the expiration date";
  else if (p.passportExpiry <= lastTravelDate) out.passportExpiry = "Passport expires before your trip ends";
  return out;
}

/** Expected passenger types, in order, for an offer (adults first, then children, then infants). */
export function expectedPassengerTypes(offer: Offer): PassengerType[] {
  const list: PassengerType[] = [];
  for (let i = 0; i < offer.passengers.adults; i++) list.push("adult");
  for (let i = 0; i < offer.passengers.children; i++) list.push("child");
  for (let i = 0; i < offer.passengers.infants; i++) list.push("infant");
  return list;
}

export function emptyPassenger(type: PassengerType): PassengerFormValues {
  return { type, title: "mr", firstName: "", middleName: "", lastName: "", dateOfBirth: "", gender: "m", passportNumber: "", passportCountry: "", passportExpiry: "", knownTravelerNumber: "", redressNumber: "", frequentFlyerAirline: "", frequentFlyerNumber: "" };
}

/** Strip empty optional strings so the stored record is clean. */
export function toPassengerInput(p: PassengerFormValues): PassengerInput {
  const clean = (s?: string) => (s && s.trim() ? s.trim() : undefined);
  return {
    type: p.type,
    title: p.title,
    firstName: p.firstName.trim(),
    middleName: clean(p.middleName),
    lastName: p.lastName.trim(),
    dateOfBirth: p.dateOfBirth,
    gender: p.gender,
    passportNumber: clean(p.passportNumber)?.toUpperCase(),
    passportCountry: clean(p.passportCountry),
    passportExpiry: clean(p.passportExpiry),
    knownTravelerNumber: clean(p.knownTravelerNumber),
    redressNumber: clean(p.redressNumber),
    frequentFlyerAirline: clean(p.frequentFlyerAirline),
    frequentFlyerNumber: clean(p.frequentFlyerNumber),
  };
}

/** Passport-issuing countries offered in checkout (most common for US travelers first). */
export const PASSPORT_COUNTRIES: { code: string; name: string }[] = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "MX", name: "Mexico" },
  { code: "GB", name: "United Kingdom" },
  { code: "IN", name: "India" },
  { code: "CN", name: "China" },
  { code: "PH", name: "Philippines" },
  { code: "BR", name: "Brazil" },
  { code: "CO", name: "Colombia" },
  { code: "DO", name: "Dominican Republic" },
  { code: "KR", name: "South Korea" },
  { code: "JP", name: "Japan" },
  { code: "VN", name: "Vietnam" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "AU", name: "Australia" },
  { code: "NG", name: "Nigeria" },
  { code: "JM", name: "Jamaica" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "PL", name: "Poland" },
  { code: "NL", name: "Netherlands" },
  { code: "AR", name: "Argentina" },
  { code: "PE", name: "Peru" },
  { code: "TR", name: "Turkey" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "ZA", name: "South Africa" },
  { code: "NZ", name: "New Zealand" },
];
