/**
 * Parse and serialise flight search URLs.
 *   /flights/search?from=JFK&to=LAX&depart=2026-10-12&return=2026-10-19&adults=1&children=0&infants=0&cabin=economy&direct=1
 */
import { z } from "zod";
import { CABIN_CLASSES, type CabinClass, type SearchParams } from "./types";
import { addDays, toDateOnly } from "@/lib/utils";

const iata = z
  .string()
  .trim()
  .transform((s) => s.toUpperCase())
  .pipe(z.string().regex(/^[A-Z]{3}$/, "Use a 3-letter airport code"));

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

const intFromQuery = (min: number, max: number, fallback: number) =>
  z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (v === undefined || v === "") return fallback;
      const n = typeof v === "number" ? v : parseInt(v, 10);
      return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
    });

export const searchQuerySchema = z
  .object({
    from: iata,
    to: iata,
    depart: dateOnly,
    return: z.union([dateOnly, z.literal("")]).optional(),
    adults: intFromQuery(1, 9, 1),
    children: intFromQuery(0, 8, 0),
    infants: intFromQuery(0, 4, 0),
    cabin: z
      .string()
      .optional()
      .transform((c) => (CABIN_CLASSES.includes(c as CabinClass) ? (c as CabinClass) : "economy")),
    direct: z
      .union([z.string(), z.boolean()])
      .optional()
      .transform((v) => v === true || v === "1" || v === "true"),
  })
  .refine((q) => q.from !== q.to, { message: "Origin and destination must differ", path: ["to"] })
  .refine((q) => !q.return || q.return >= q.depart, {
    message: "Return date must be on or after the departure date",
    path: ["return"],
  })
  .refine((q) => q.infants <= q.adults, {
    message: "Each infant must travel with an adult",
    path: ["infants"],
  })
  .refine((q) => q.adults + q.children + q.infants <= 9, {
    message: "Maximum 9 passengers per booking",
    path: ["adults"],
  });

export type SearchQuery = z.infer<typeof searchQuerySchema>;

export type RawQuery = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/** Parse Next.js `searchParams` into SearchParams. Throws ZodError on invalid input. */
export function parseSearchQuery(raw: RawQuery): SearchParams {
  const q = searchQuerySchema.parse({
    from: first(raw.from),
    to: first(raw.to),
    depart: first(raw.depart),
    return: first(raw.return),
    adults: first(raw.adults),
    children: first(raw.children),
    infants: first(raw.infants),
    cabin: first(raw.cabin),
    direct: first(raw.direct),
  });
  return toSearchParams(q);
}

/** Non-throwing variant. */
export function safeParseSearchQuery(raw: RawQuery): { ok: true; params: SearchParams } | { ok: false; error: string } {
  try {
    return { ok: true, params: parseSearchQuery(raw) };
  } catch (e) {
    const issue = e instanceof z.ZodError ? e.issues[0]?.message : (e as Error).message;
    return { ok: false, error: issue ?? "Invalid search" };
  }
}

export function toSearchParams(q: SearchQuery): SearchParams {
  return {
    origin: q.from,
    destination: q.to,
    departDate: q.depart,
    returnDate: q.return ? q.return : undefined,
    passengers: { adults: q.adults, children: q.children, infants: q.infants },
    cabin: q.cabin,
    directOnly: q.direct || undefined,
  };
}

/** Build the canonical search URL for a set of params. */
export function buildSearchUrl(p: SearchParams): string {
  const sp = new URLSearchParams();
  sp.set("from", p.origin);
  sp.set("to", p.destination);
  sp.set("depart", p.departDate);
  if (p.returnDate) sp.set("return", p.returnDate);
  sp.set("adults", String(p.passengers.adults));
  if (p.passengers.children) sp.set("children", String(p.passengers.children));
  if (p.passengers.infants) sp.set("infants", String(p.passengers.infants));
  if (p.cabin !== "economy") sp.set("cabin", p.cabin);
  if (p.directOnly) sp.set("direct", "1");
  return `/flights/search?${sp.toString()}`;
}

/** Sensible default dates for SEO deep links: ~3 weeks out, 7-night trip. */
export function defaultTripDates(now = new Date()): { depart: string; ret: string } {
  const today = toDateOnly(now);
  const depart = addDays(today, 21);
  return { depart, ret: addDays(depart, 7) };
}

export function isRoundTrip(p: SearchParams): boolean {
  return Boolean(p.returnDate);
}
