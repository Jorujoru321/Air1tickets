import "server-only";
import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb, schema } from "@/lib/db/client";
import type { FareLock } from "@/lib/db/schema";
import type { Offer } from "@/lib/flights/types";
import { getAirport } from "@/data/airports";
import { getAirline } from "@/data/airlines";
import { sendPlainEmail } from "@/lib/email/send";
import { describeOffer, whatsappLink } from "@/lib/leads/chat-links";
import { site } from "@/lib/site";
import { generateLockReference, isValidLockReference, lockedPriceFor } from "@/lib/leads/reference";
import { formatDateLong, formatMoney } from "@/lib/utils";

export type LeadChannel = FareLock["channel"];
export type LeadStatus = FareLock["status"];
export const LEAD_STATUSES: LeadStatus[] = ["new", "contacted", "quoted", "won", "lost"];

export { generateLockReference, isValidLockReference, lockedPriceFor };

export interface CreateFareLockInput {
  offer: Offer;
  name: string;
  email: string;
  phone: string;
  channel: LeadChannel;
  notes?: string;
  source?: string;
  userId?: string | null;
}

export async function createFareLock(input: CreateFareLockInput): Promise<FareLock> {
  const db = await getDb();
  const { offer } = input;
  const out = offer.slices[0];
  const back = offer.slices[1];
  const expiresAt = new Date(Date.now() + site.priceLock.hours * 3_600_000).toISOString();
  let reference = generateLockReference();
  for (let i = 0; i < 5; i++) {
    const clash = await db.select({ id: schema.fareLocks.id }).from(schema.fareLocks).where(eq(schema.fareLocks.reference, reference)).limit(1);
    if (!clash.length) break;
    reference = generateLockReference();
  }
  const row: typeof schema.fareLocks.$inferInsert = {
    id: `lock_${nanoid(14)}`,
    reference,
    name: input.name,
    email: input.email,
    phone: input.phone,
    channel: input.channel,
    notes: input.notes || null,
    source: input.source ?? "results",
    origin: out.origin,
    destination: out.destination,
    departDate: out.departure.slice(0, 10),
    returnDate: back ? back.departure.slice(0, 10) : null,
    cabin: offer.cabin,
    adults: offer.passengers.adults,
    children: offer.passengers.children,
    infants: offer.passengers.infants,
    airline: offer.owner,
    offerId: offer.id,
    offerJson: JSON.stringify({
      summary: describeOffer(offer),
      total: offer.price.total,
      slices: offer.slices.map((s) => ({ origin: s.origin, destination: s.destination, departure: s.departure, arrival: s.arrival, stops: s.stops, durationMinutes: s.durationMinutes, segments: s.segments.map((g) => ({ flight: `${g.marketingCarrier}${g.flightNumber}`, from: g.origin, to: g.destination, dep: g.departure, arr: g.arrival })) })),
      fare: offer.fare,
    }),
    lockedPrice: lockedPriceFor(offer),
    currency: "USD",
    expiresAt,
    userId: input.userId ?? null,
  };
  await db.insert(schema.fareLocks).values(row);
  const [created] = await db.select().from(schema.fareLocks).where(eq(schema.fareLocks.id, row.id)).limit(1);
  void notify(created, offer).catch((e) => console.error("[air1] lead notification failed", e));
  return created;
}

async function notify(lock: FareLock, offer: Offer) {
  const o = getAirport(lock.origin);
  const d = getAirport(lock.destination);
  const airline = getAirline(lock.airline ?? "")?.name ?? lock.airline ?? "";
  const route = `${o?.city ?? lock.origin} (${lock.origin}) → ${d?.city ?? lock.destination} (${lock.destination})`;
  const chat = whatsappLink(`Hi Air1, this is ${lock.name} about fare lock ${lock.reference}.`);
  // 1) The agency: everything an agent needs to act, in one email.
  await sendPlainEmail(
    site.priceLock.leadsEmail,
    `[Lead] ${lock.reference} · ${route} · ${formatMoney(lock.lockedPrice)} · ${lock.channel}`,
    [
      `New fare lock ${lock.reference}`,
      ``,
      `Traveler: ${lock.name}`,
      `Phone / WhatsApp: ${lock.phone}`,
      `Email: ${lock.email}`,
      `Preferred channel: ${lock.channel}`,
      lock.notes ? `Notes: ${lock.notes}` : ``,
      ``,
      `Trip: ${describeOffer(offer)}`,
      `Airline: ${airline}`,
      `Locked price: ${formatMoney(lock.lockedPrice)} per traveler (${formatMoney(offer.price.total)} total)`,
      `Lock expires: ${formatDateLong(lock.expiresAt)} (${site.priceLock.hours}h)`,
      ``,
      `Admin: ${site.url}/admin/leads`,
    ]
      .filter((l) => l !== undefined)
      .join("\n"),
  );
  // 2) The traveler: confirmation with the reference and how to reach us.
  await sendPlainEmail(
    lock.email,
    `Your fare is locked — ${lock.reference} · ${route}`,
    [
      `Hi ${lock.name.split(" ")[0]},`,
      ``,
      `We've locked this fare for you:`,
      `${describeOffer(offer)}`,
      `Locked price: ${formatMoney(lock.lockedPrice)} per traveler, held until ${formatDateLong(lock.expiresAt)}.`,
      ``,
      `Your reference is ${lock.reference}. An agent will reach you on ${lock.channel === "whatsapp" ? "WhatsApp" : lock.channel} within about ${site.priceLock.responseMinutes} minutes during business hours.`,
      `Closer to departure we re-check every airline and send you your final, last-minute deal — you only pay when you accept.`,
      ``,
      `Chat with us now: ${chat}`,
      `Call: ${site.supportPhone}`,
      ``,
      `${site.name}`,
    ].join("\n"),
  );
}

export async function listFareLocks(limit = 200): Promise<FareLock[]> {
  const db = await getDb();
  return db.select().from(schema.fareLocks).orderBy(desc(schema.fareLocks.createdAt)).limit(limit);
}

export async function findFareLockById(id: string): Promise<FareLock | null> {
  const db = await getDb();
  const [row] = await db.select().from(schema.fareLocks).where(eq(schema.fareLocks.id, id)).limit(1);
  return row ?? null;
}

export async function updateFareLockStatus(id: string, status: LeadStatus): Promise<FareLock | null> {
  const db = await getDb();
  await db.update(schema.fareLocks).set({ status, updatedAt: new Date().toISOString() }).where(eq(schema.fareLocks.id, id));
  return findFareLockById(id);
}

/** CSV export for spreadsheets / CRM import. */
export function fareLocksToCsv(rows: FareLock[]): string {
  const cols = ["reference", "status", "createdAt", "name", "email", "phone", "channel", "origin", "destination", "departDate", "returnDate", "cabin", "adults", "children", "infants", "airline", "lockedPrice", "expiresAt", "notes"] as const;
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}
