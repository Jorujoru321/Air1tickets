import { sqliteTable, text, integer, real, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const now = () => sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`;

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    phone: text("phone"),
    role: text("role", { enum: ["customer", "admin"] }).notNull().default("customer"),
    newsletter: integer("newsletter", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull().default(now()),
    updatedAt: text("updated_at").notNull().default(now()),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
);

export const bookings = sqliteTable(
  "bookings",
  {
    id: text("id").primaryKey(),
    /** Air1 reference shown to customers, e.g. "A1K7M2QX". */
    reference: text("reference").notNull(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    status: text("status", { enum: ["pending", "confirmed", "failed", "cancelled"] }).notNull().default("pending"),
    provider: text("provider").notNull(),
    providerOrderId: text("provider_order_id"),
    airlinePnr: text("airline_pnr"),
    ticketNumbers: text("ticket_numbers", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    contactEmail: text("contact_email").notNull(),
    contactPhone: text("contact_phone").notNull(),
    /** Lower-cased last name of the lead passenger, for manage-booking lookups. */
    leadLastName: text("lead_last_name").notNull(),
    leadFirstName: text("lead_first_name").notNull(),
    origin: text("origin").notNull(),
    destination: text("destination").notNull(),
    departDate: text("depart_date").notNull(),
    returnDate: text("return_date"),
    cabin: text("cabin").notNull(),
    owner: text("owner").notNull(),
    passengerCount: integer("passenger_count").notNull(),
    /** Snapshot of the offer at time of purchase. */
    offer: text("offer", { mode: "json" }).notNull(),
    passengers: text("passengers", { mode: "json" }).notNull(),
    extras: text("extras", { mode: "json" }).notNull(),
    priceBase: real("price_base").notNull(),
    priceTaxes: real("price_taxes").notNull(),
    priceExtras: real("price_extras").notNull().default(0),
    serviceFee: real("service_fee").notNull().default(0),
    priceTotal: real("price_total").notNull(),
    currency: text("currency").notNull().default("USD"),
    paymentProvider: text("payment_provider", { enum: ["stripe", "demo"] }).notNull(),
    paymentReference: text("payment_reference").notNull(),
    failureReason: text("failure_reason"),
    createdAt: text("created_at").notNull().default(now()),
    updatedAt: text("updated_at").notNull().default(now()),
    cancelledAt: text("cancelled_at"),
  },
  (t) => [
    uniqueIndex("bookings_reference_idx").on(t.reference),
    index("bookings_user_idx").on(t.userId),
    index("bookings_email_idx").on(t.contactEmail),
    uniqueIndex("bookings_payment_idx").on(t.paymentReference),
  ],
);

export const priceAlerts = sqliteTable(
  "price_alerts",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    origin: text("origin").notNull(),
    destination: text("destination").notNull(),
    departDate: text("depart_date").notNull(),
    returnDate: text("return_date"),
    cabin: text("cabin").notNull().default("economy"),
    passengers: integer("passengers").notNull().default(1),
    lastPrice: real("last_price"),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull().default(now()),
  },
  (t) => [index("price_alerts_email_idx").on(t.email)],
);

export const newsletterSubscribers = sqliteTable(
  "newsletter_subscribers",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    source: text("source"),
    createdAt: text("created_at").notNull().default(now()),
  },
  (t) => [uniqueIndex("newsletter_email_idx").on(t.email)],
);

export const contactMessages = sqliteTable("contact_messages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  topic: text("topic").notNull(),
  bookingReference: text("booking_reference"),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull().default(now()),
});

export const searchLog = sqliteTable(
  "search_log",
  {
    id: text("id").primaryKey(),
    origin: text("origin").notNull(),
    destination: text("destination").notNull(),
    departDate: text("depart_date").notNull(),
    returnDate: text("return_date"),
    cabin: text("cabin").notNull(),
    passengers: integer("passengers").notNull(),
    resultCount: integer("result_count").notNull(),
    minPrice: real("min_price"),
    createdAt: text("created_at").notNull().default(now()),
  },
  (t) => [index("search_log_route_idx").on(t.origin, t.destination)],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type PriceAlert = typeof priceAlerts.$inferSelect;

/** Fare lock requests (leads): a traveler saw a fare and asked us to hold it and follow up. */
export const fareLocks = sqliteTable(
  "fare_locks",
  {
    id: text("id").primaryKey(),
    /** Human reference like L-7K2M9Q shown to the traveler and used in chat. */
    reference: text("reference").notNull(),
    status: text("status", { enum: ["new", "contacted", "quoted", "won", "lost"] }).notNull().default("new"),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    channel: text("channel", { enum: ["whatsapp", "messenger", "call", "sms", "email"] }).notNull(),
    notes: text("notes"),
    source: text("source").notNull().default("results"),
    origin: text("origin").notNull(),
    destination: text("destination").notNull(),
    departDate: text("depart_date").notNull(),
    returnDate: text("return_date"),
    cabin: text("cabin").notNull(),
    adults: integer("adults").notNull().default(1),
    children: integer("children").notNull().default(0),
    infants: integer("infants").notNull().default(0),
    airline: text("airline"),
    offerId: text("offer_id"),
    /** Serialized itinerary summary (segments, times) for the agent. */
    offerJson: text("offer_json"),
    lockedPrice: real("locked_price").notNull(),
    currency: text("currency").notNull().default("USD"),
    expiresAt: text("expires_at").notNull(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: text("created_at").notNull().default(now()),
    updatedAt: text("updated_at").notNull().default(now()),
  },
  (t) => [uniqueIndex("fare_locks_reference_idx").on(t.reference), index("fare_locks_status_idx").on(t.status), index("fare_locks_created_idx").on(t.createdAt)],
);
export type FareLock = typeof fareLocks.$inferSelect;
