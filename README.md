# Air1 Tickets

A US-based online travel agency for flights — search, compare and book airline
tickets, in the spirit of Kiwi.com and Booking.com. Built with Next.js 16,
TypeScript and Tailwind CSS v4, with SEO as a first-class concern.

**Everything works out of the box in demo mode**: a realistic, deterministic
flight-inventory engine, a demo card checkout, a local SQLite database and
console-logged emails. Plug in Duffel, Stripe, Resend and Turso to go live —
see [`docs/WHAT-I-NEED-FROM-YOU.md`](docs/WHAT-I-NEED-FROM-YOU.md).

## Quick start

```bash
npm install
cp .env.example .env.local      # optional — defaults work for demo mode
npm run dev                     # http://localhost:3000
```

Useful scripts:

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build && npm start` | Production build + server |
| `npm run typecheck` / `npm run lint` | TypeScript and ESLint |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright; builds and starts the app on port 3100) |
| `npm run db:migrate` | Apply schema migrations to `DATABASE_URL` |
| `npm run db:seed` | Create a demo account (`demo@air1tickets.com` / `Demo1234`) and a sample booking |
| `npx tsx scripts/validate-data.ts` | Validate the airport/airline/route/content datasets |

## What's included

* **Search** — airport autocomplete (250 airports), round-trip/one-way, date picker with fare-per-day hints, traveler & cabin picker, nonstop filter.
* **Results** — Best / Cheapest / Fastest sorting, filters (stops, airlines, times, duration, price, bags, overnight layovers), itinerary details, price alerts.
* **Checkout** — fare-family upsell (Basic → Main → Flexible), passenger details with TSA/passport rules, bags/protection/flexible-ticket extras, Stripe Payment Element (or demo card), fare-hold countdown and re-pricing, e-ticket confirmation with calendar export.
* **Manage booking** — lookup by reference + last name, resend confirmation, cancel (DOT 24-hour rule), accounts with trip history and price alerts.
* **SEO engine** — 1,700+ programmatic pages: route pages (`/cheap-flights/new-york-to-los-angeles`), destination hubs (`/flights-to/...`, `/flights-from/...`), airline and airport pages, 44 destination guides, travel-guide articles; canonical URLs, Open Graph images, JSON-LD (Organization, WebSite, Flight/AggregateOffer, FAQPage, BreadcrumbList, Article), sitemap and robots.
* **Trust & content** — help center (55 FAQs), about, contact, US-ready legal pages (terms, privacy/CCPA, cookies, accessibility).

## Architecture

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the folder map and
conventions. The short version:

```
src/app          routes (App Router, Server Components by default)
src/components   ui kit · layout · search · results · booking · account · seo · marketing
src/lib          flights (types, provider interface, mock engine, Duffel adapter, geo), db, auth, booking, payments, email, seo
src/data         airports · airlines · routes · destinations · faqs
src/content      travel-guide articles
tests            unit (vitest) · e2e (playwright)
```

### Inventory providers

`getFlightProvider()` returns whichever provider is configured:

* `mock` (default) — `src/lib/flights/mock`. Generates airline schedules from real hub networks, prices fares with a demand model (advance purchase, day of week, season, time of day, carrier type, cabin), splits US taxes and fees correctly, and is fully deterministic so offer IDs can be re-priced.
* `duffel` — `src/lib/flights/duffel.ts`. Set `FLIGHT_PROVIDER=duffel` and `DUFFEL_ACCESS_TOKEN`.

Any other supplier (Amadeus, Sabre, a consolidator API) can be added by
implementing the `FlightProvider` interface in `src/lib/flights/types.ts`.

### Payments

With Stripe keys set, checkout uses Payment Intents + the Payment Element;
the server verifies the intent amount before issuing tickets. Without keys, a
demo card form accepts Stripe test numbers (`4242…` succeeds, `4000 0000 0000 0002` declines).

### Database

Drizzle ORM over libSQL. Local file by default (`data/air1.db`), Turso in
production. Migrations are plain SQL in `src/lib/db/migrations.ts` and run
automatically on first access.

## Deploying

1. Push to GitHub and import the repo in Vercel (or any Node 20+ host).
2. Add the environment variables from `.env.example` — at minimum `NEXT_PUBLIC_SITE_URL`, `SESSION_SECRET`, `DATABASE_URL` + `DATABASE_AUTH_TOKEN`.
3. Deploy. Submit `/sitemap.xml` in Google Search Console.

## Testing

```bash
npm test                    # unit: engine determinism, pricing, geo/timezones, params, payments
npm run test:e2e            # e2e: home → search → results → checkout → confirmation → manage booking, SEO checks, axe accessibility
```

## License

Proprietary — © Air1 Tickets LLC. All rights reserved.
