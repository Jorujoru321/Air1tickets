# Air1 Tickets — Architecture & Conventions

Air1 Tickets is a US-based online travel agency (OTA) for searching and booking
flights, in the spirit of Kiwi.com / Booking.com. This document is the single
source of truth for how the codebase is organised. Read it before adding code.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19, Server Components by default) |
| Language | TypeScript, `strict` |
| Styling | Tailwind CSS v4 — tokens in `src/app/globals.css` (`@theme`) |
| Icons | `lucide-react` |
| Database | Drizzle ORM + libSQL (`@libsql/client`). Local SQLite file by default, Turso in production |
| Auth | Signed JWT session cookie (`jose`) + bcrypt passwords. Guest checkout is first-class |
| Payments | Stripe Payment Intents when keys exist; otherwise built-in demo checkout |
| Inventory | `FlightProvider` interface — `mock` engine (default) or `duffel` adapter |
| Email | Resend when key exists; otherwise logs to console |
| Validation | `zod` |
| Tests | Vitest (unit, `tests/unit`), Playwright (e2e, `tests/e2e`) |

## Folder map

```
src/
  app/                      Routes (App Router). Server Components unless "use client".
    layout.tsx              Root layout: fonts, header, footer, global JSON-LD
    page.tsx                Home
    flights/search/         Search results (SSR shell + client filters)
    book/[offerId]/         Booking funnel: passengers → extras → payment → confirmation
    booking/[reference]/    Manage booking (lookup by reference + last name)
    account/                Login, register, dashboard (trips)
    cheap-flights/[route]   SEO route pages, e.g. /cheap-flights/new-york-to-los-angeles
    flights-to/[city]       SEO destination pages
    flights-from/[city]     SEO origin pages
    airlines/[slug]         Airline pages
    airports/[code]         Airport pages
    destinations/[slug]     City travel guides
    deals/, about/, contact/, help/, legal/…
    api/                    Route handlers (search, offers, bookings, payments, webhooks)
    sitemap.ts, robots.ts, manifest.ts
  components/
    ui/                     Design-system primitives (Button, Input, Card, Badge, Dialog …)
    layout/                 Header, Footer, Breadcrumbs, Container
    search/                 Search form, airport autocomplete, date picker, passenger picker
    results/                Result cards, filters, sort bar, itinerary details
    booking/                Passenger forms, extras, payment, summary sidebar
    seo/                    JSON-LD components, FAQ blocks, internal-link modules
    marketing/              Home page sections, destination cards, trust badges
    account/                Auth forms, trips list
  lib/
    site.ts                 Brand/site config + absoluteUrl()
    utils.ts                cn(), money/date/duration formatters, slugify
    flights/
      types.ts              Domain model + FlightProvider interface (THE CONTRACT)
      provider.ts           getFlightProvider() — picks mock or duffel from env
      mock/                 Deterministic realistic inventory engine
      duffel.ts             Duffel API adapter
      geo.ts                Haversine distance, timezone maths
      search-params.ts      Parse/serialise search URLs (zod)
    db/
      schema.ts             Drizzle tables
      client.ts             db instance (lazy migrations)
    auth/                   session.ts (JWT cookie), password.ts, current-user.ts
    booking/                createBooking(), reference generator, lookups
    payments/               stripe.ts (optional), demo.ts
    email/                  send.ts + templates
    seo/                    metadata builders, JSON-LD builders, slug helpers
  data/
    airports.ts             Airport dataset (IATA, city, coords, tz, size)
    airlines.ts             Airline dataset (hubs, alliance, colour, fares)
    destinations.ts         Curated destination guides (content for SEO pages)
    routes.ts               Popular routes for hub/SEO pages
    faqs.ts                 FAQ content reused across pages (and as FAQPage JSON-LD)
  content/                  Long-form guides / blog posts (TS objects, not MDX)
tests/unit, tests/e2e
scripts/                    migrate.ts, seed.ts
drizzle/                    Generated SQL migrations (committed)
```

## Conventions

* **Server first.** Pages are Server Components. Add `"use client"` only to leaf
  components that need state/effects. Data fetching happens in server code or
  route handlers, never with `useEffect` + fetch when a server component can do it.
* **Money** is USD dollars as numbers (`218.4`), formatted with `formatMoney()`.
* **Dates/times** are strings: `YYYY-MM-DD` and local ISO `YYYY-MM-DDTHH:mm`
  (no offset). Use helpers in `lib/utils.ts`; never `new Date("YYYY-MM-DD")`
  (it parses as UTC and shifts the day).
* **URLs / slugs**: lowercase, hyphenated, generated with `lib/seo/slugs.ts`.
  Every SEO page has a canonical URL, title ≤ 60 chars, description ≤ 155 chars,
  a single `<h1>`, breadcrumbs, and JSON-LD.
* **Imports** use the `@/` alias (`@/lib/utils`).
* **Components** are named exports in PascalCase files (`Button.tsx`).
* **Design**: navy = structure & text, ocean = links/interactive, sunrise = primary CTA
  only. Cards `rounded-2xl shadow-card`, fields `rounded-[var(--radius-field)]`.
  Body font Inter, headings Plus Jakarta Sans (`font-display`).
* **Accessibility**: every interactive element is keyboard operable and labelled;
  colour contrast ≥ 4.5:1 for text; focus rings are never removed.
* **No secrets in code.** Everything configurable is read from env (see `.env.example`).
* **Providers**: never import `mock/` or `duffel.ts` directly from UI or routes —
  always go through `getFlightProvider()`.
* **Quality gate** before committing: `npm run typecheck && npm run lint && npm test`.

## Key flows

1. **Search**: `/` form → `/flights/search?from=JFK&to=LAX&depart=2026-10-12&return=2026-10-19&adults=1&children=0&infants=0&cabin=economy`
   → server calls `provider.search()` → client component renders offers with
   filters (stops, airlines, times, price, duration) and sorts (best/cheapest/fastest).
2. **Book**: result "Select" → `/book/[offerId]` (re-prices via `provider.getOffer`)
   → passengers → extras → payment (Stripe or demo) → `POST /api/bookings`
   creates booking row, calls `provider.createOrder`, sends confirmation email
   → `/book/[offerId]/confirmation?ref=A1XXXXXX`.
3. **Manage**: `/booking` lookup by reference + last name → `/booking/[reference]`.
4. **SEO pages** are statically generated from `data/*` with ISR and use the
   provider's `priceCalendar()` for "cheapest month" widgets.

## Lead model (price lock)

`NEXT_PUBLIC_BOOKING_MODE` selects how results convert. In `lead` mode (default)
`OfferCard` links to `/lock/[offerId]`, where `LockFareForm` posts to
`POST /api/price-locks`. `src/lib/leads/service.ts` re-fetches the offer,
stores a `fare_locks` row (reference `L-XXXXXX`, itinerary snapshot, locked
per-traveler price, expiry) and emails both the agency (`LEADS_EMAIL`) and the
traveler. `src/lib/leads/chat-links.ts` builds `wa.me` / `m.me` deep links with
the fare or reference prefilled; `FloatingChat` and the header use them.
`/admin/leads` (users with role `admin` or listed in `ADMIN_EMAILS`) lists leads
with inline status updates (`PATCH /api/admin/leads/:id`) and CSV export.
`/book/*` redirects to `/lock/*` in lead mode so old links keep working.
