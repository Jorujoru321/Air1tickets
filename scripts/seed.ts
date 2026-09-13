/**
 * Seed a demo account and a sample confirmed booking for local development.
 *   npx tsx scripts/seed.ts
 * Account: demo@aironeagency.com / Demo1234
 */
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import bcrypt from "bcryptjs";
import path from "node:path";
import fs from "node:fs";
import * as schema from "../src/lib/db/schema";
import { MIGRATIONS } from "../src/lib/db/migrations";
import { searchOffers } from "../src/lib/flights/mock/engine";
import { generateAirlinePnr } from "../src/lib/flights/mock";
import { summarizePrice } from "../src/lib/booking/pricing";
import { generateBookingReference } from "../src/lib/booking/reference";
import { addDays, toDateOnly } from "../src/lib/utils";

async function main() {
  process.env.MOCK_NO_LATENCY = "1";
  let url = process.env.DATABASE_URL?.trim() || "file:./data/air1.db";
  if (url.startsWith("file:")) {
    const rel = url.slice(5);
    const abs = path.isAbsolute(rel) ? rel : path.join(process.cwd(), rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    url = `file:${abs}`;
  }
  const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN || undefined });
  await client.execute(`CREATE TABLE IF NOT EXISTS _migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')))`);
  const applied = new Set((await client.execute(`SELECT id FROM _migrations`)).rows.map((r) => String(r.id)));
  for (const m of MIGRATIONS) {
    if (applied.has(m.id)) continue;
    for (const s of m.statements) await client.execute(s);
    await client.execute({ sql: `INSERT INTO _migrations (id) VALUES (?)`, args: [m.id] });
  }
  const db = drizzle(client, { schema });

  const email = "demo@aironeagency.com";
  let user = (await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1))[0];
  if (!user) {
    const id = `usr_${nanoid(16)}`;
    await db.insert(schema.users).values({ id, email, passwordHash: await bcrypt.hash("Demo1234", 11), firstName: "Dana", lastName: "Demo", phone: "+1 (415) 555-0123" });
    user = (await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1))[0];
    console.log(`created user ${email} / Demo1234`);
  } else {
    console.log(`user ${email} already exists`);
  }

  const existing = await db.select().from(schema.bookings).where(eq(schema.bookings.userId, user.id)).limit(1);
  if (existing.length) {
    console.log(`sample booking already exists: ${existing[0].reference}`);
    return;
  }

  const depart = addDays(toDateOnly(new Date()), 30);
  const ret = addDays(depart, 7);
  const offers = searchOffers({ origin: "JFK", destination: "LAX", departDate: depart, returnDate: ret, passengers: { adults: 1, children: 0, infants: 0 }, cabin: "economy" });
  const offer = offers.find((o) => o.tags?.includes("best")) ?? offers[0];
  const extras = { checkedBags: 1, seats: {}, travelInsurance: false, flexibleTicket: false, priorityBoarding: false };
  const summary = summarizePrice(offer, extras);
  const reference = generateBookingReference();
  const passengers = [{ type: "adult", title: "ms", firstName: "Dana", lastName: "Demo", dateOfBirth: "1990-05-14", gender: "f" }];
  await db.insert(schema.bookings).values({
    id: `bkg_${nanoid(16)}`,
    reference,
    userId: user.id,
    status: "confirmed",
    provider: "mock",
    providerOrderId: `mock_ord_${reference.toLowerCase()}`,
    airlinePnr: generateAirlinePnr(`pnr:${reference}`),
    ticketNumbers: ["0061234567890"],
    contactEmail: email,
    contactPhone: "+1 (415) 555-0123",
    leadLastName: "demo",
    leadFirstName: "Dana",
    origin: "JFK",
    destination: "LAX",
    departDate: depart,
    returnDate: ret,
    cabin: "economy",
    owner: offer.owner,
    passengerCount: 1,
    offer,
    passengers,
    extras,
    priceBase: summary.fareBase,
    priceTaxes: summary.taxes,
    priceExtras: summary.extrasTotal,
    serviceFee: summary.serviceFee,
    priceTotal: summary.total,
    paymentProvider: "demo",
    paymentReference: `demo_pi_seed_${nanoid(10)}`,
  });
  console.log(`created sample booking ${reference} (JFK→LAX ${depart} – ${ret}, ${offer.owner}, $${summary.total})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
