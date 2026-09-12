/**
 * Versioned schema migrations, applied automatically on first database access.
 * Written as plain SQL so they run identically against a local SQLite file
 * and Turso/libSQL in production, with no build-time file dependencies.
 *
 * Keep entries append-only. Never edit an already-shipped migration.
 */
export interface Migration {
  id: string;
  statements: string[];
}

export const MIGRATIONS: Migration[] = [
  {
    id: "0001_init",
    statements: [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        role TEXT NOT NULL DEFAULT 'customer',
        newsletter INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users (email)`,
      `CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        reference TEXT NOT NULL,
        user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        provider TEXT NOT NULL,
        provider_order_id TEXT,
        airline_pnr TEXT,
        ticket_numbers TEXT NOT NULL DEFAULT '[]',
        contact_email TEXT NOT NULL,
        contact_phone TEXT NOT NULL,
        lead_last_name TEXT NOT NULL,
        lead_first_name TEXT NOT NULL,
        origin TEXT NOT NULL,
        destination TEXT NOT NULL,
        depart_date TEXT NOT NULL,
        return_date TEXT,
        cabin TEXT NOT NULL,
        owner TEXT NOT NULL,
        passenger_count INTEGER NOT NULL,
        offer TEXT NOT NULL,
        passengers TEXT NOT NULL,
        extras TEXT NOT NULL,
        price_base REAL NOT NULL,
        price_taxes REAL NOT NULL,
        price_extras REAL NOT NULL DEFAULT 0,
        service_fee REAL NOT NULL DEFAULT 0,
        price_total REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'USD',
        payment_provider TEXT NOT NULL,
        payment_reference TEXT NOT NULL,
        failure_reason TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        cancelled_at TEXT
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS bookings_reference_idx ON bookings (reference)`,
      `CREATE INDEX IF NOT EXISTS bookings_user_idx ON bookings (user_id)`,
      `CREATE INDEX IF NOT EXISTS bookings_email_idx ON bookings (contact_email)`,
      `CREATE UNIQUE INDEX IF NOT EXISTS bookings_payment_idx ON bookings (payment_reference)`,
      `CREATE TABLE IF NOT EXISTS price_alerts (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        origin TEXT NOT NULL,
        destination TEXT NOT NULL,
        depart_date TEXT NOT NULL,
        return_date TEXT,
        cabin TEXT NOT NULL DEFAULT 'economy',
        passengers INTEGER NOT NULL DEFAULT 1,
        last_price REAL,
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
      )`,
      `CREATE INDEX IF NOT EXISTS price_alerts_email_idx ON price_alerts (email)`,
      `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        source TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS newsletter_email_idx ON newsletter_subscribers (email)`,
      `CREATE TABLE IF NOT EXISTS contact_messages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        topic TEXT NOT NULL,
        booking_reference TEXT,
        message TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
      )`,
      `CREATE TABLE IF NOT EXISTS search_log (
        id TEXT PRIMARY KEY,
        origin TEXT NOT NULL,
        destination TEXT NOT NULL,
        depart_date TEXT NOT NULL,
        return_date TEXT,
        cabin TEXT NOT NULL,
        passengers INTEGER NOT NULL,
        result_count INTEGER NOT NULL,
        min_price REAL,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
      )`,
      `CREATE INDEX IF NOT EXISTS search_log_route_idx ON search_log (origin, destination)`,
    ],
  },
  {
    id: "0002_fare_locks",
    statements: [
      `CREATE TABLE IF NOT EXISTS fare_locks (
        id TEXT PRIMARY KEY,
        reference TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        channel TEXT NOT NULL,
        notes TEXT,
        source TEXT NOT NULL DEFAULT 'results',
        origin TEXT NOT NULL,
        destination TEXT NOT NULL,
        depart_date TEXT NOT NULL,
        return_date TEXT,
        cabin TEXT NOT NULL,
        adults INTEGER NOT NULL DEFAULT 1,
        children INTEGER NOT NULL DEFAULT 0,
        infants INTEGER NOT NULL DEFAULT 0,
        airline TEXT,
        offer_id TEXT,
        offer_json TEXT,
        locked_price REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'USD',
        expires_at TEXT NOT NULL,
        user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS fare_locks_reference_idx ON fare_locks (reference)`,
      `CREATE INDEX IF NOT EXISTS fare_locks_status_idx ON fare_locks (status)`,
      `CREATE INDEX IF NOT EXISTS fare_locks_created_idx ON fare_locks (created_at)`,
    ],
  },
  {
    id: "0003_quote_requests",
    statements: [
      `CREATE TABLE IF NOT EXISTS quote_requests (
        id TEXT PRIMARY KEY,
        kind TEXT NOT NULL,
        message TEXT NOT NULL,
        details TEXT,
        origin TEXT,
        destination TEXT,
        start_date TEXT,
        end_date TEXT,
        travelers INTEGER,
        referrer TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
      )`,
      `CREATE INDEX IF NOT EXISTS quote_requests_kind_idx ON quote_requests (kind)`,
      `CREATE INDEX IF NOT EXISTS quote_requests_created_idx ON quote_requests (created_at)`,
    ],
  },
];
