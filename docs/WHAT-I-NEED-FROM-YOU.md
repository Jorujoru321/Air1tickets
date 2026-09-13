# What I need from you to go live

The site runs end-to-end today in **demo mode** (simulated inventory, simulated
payments, local database, emails logged to the console). Each item below turns
one piece real. None of them require code changes — just values in `.env.local`
(or your host's environment settings) and a few decisions.

## 0. Your chat channels and lead inbox (needed first — 5 minutes)

The site's main action is **Lock this price → talk to an agent**. Set these so
the buttons open your real accounts and leads reach your team:

```
NEXT_PUBLIC_WHATSAPP_NUMBER=+1 942-388-2017     # your WhatsApp Business number (set)
NEXT_PUBLIC_MESSENGER_PAGE=yourpagename         # facebook.com/<this> → m.me link
NEXT_PUBLIC_TELEGRAM_USERNAME=                  # optional
LEADS_EMAIL=leads@your-domain.com               # every new lock is emailed here
ADMIN_EMAILS=you@your-domain.com,agent@...      # accounts allowed to open /admin/leads
NEXT_PUBLIC_PRICE_LOCK_HOURS=48                 # how long you honor a locked fare
NEXT_PUBLIC_LOCK_RESPONSE_MINUTES=15            # response time promised on the site
```

Then create an account on the site with one of the `ADMIN_EMAILS` addresses and
open `/admin/leads`: every lock shows the traveler, trip, locked price, expiry,
one-click WhatsApp / call / email buttons and a status (new → contacted →
quoted → won/lost), plus CSV export.

**Check the WhatsApp number actually opens a chat.** It is set to
`+1 942-388-2017`. Area code 942 is not currently assigned in the North
American Numbering Plan, so if the link opens WhatsApp and says the number is
not registered, send me the number in full international form (country code +
number) and I will correct it in one line.

**Please confirm the promises the copy makes**, or tell me what to change:
the locked price is the *maximum* the traveler pays; you re-check fares and send
a final quote 1–2 days before departure; first reply within ~15 minutes during
business hours; locks last 48 hours. Copy lives in `src/data/faqs.ts`
(`price-lock` group), `src/app/price-lock/page.tsx` and the home page.

## 1. Live flight inventory & ticketing

You need a contract with a flight content provider. The code ships with a
**Duffel** adapter because it is the fastest to get started with and issues
real tickets on 300+ airlines:

| Provider | What you get | How to get it |
| --- | --- | --- |
| **Duffel** (recommended to start) | Live search, booking, ticketing, cancellations, seat/bag ancillaries; test mode is free | Sign up at duffel.com → create a test access token → later complete verification for a live token |
| Amadeus Self-Service / Enterprise | Largest content set, needs your own ticketing (ARC/IATA accreditation or a host agency / consolidator) | Amadeus for Developers, then a commercial agreement |
| Sabre / Travelport | Same as above via a GDS | Through a host agency or direct agreement |
| Kiwi.com Tequila | Virtual interlining like Kiwi | Partner program application |

Set in `.env.local`:

```
FLIGHT_PROVIDER=duffel
DUFFEL_ACCESS_TOKEN=duffel_test_xxx   # test token first, live token when verified
```

**Decision needed:** which provider/host-agency route you want. If you already
have an ARC-accredited agency or a consolidator relationship, tell me and I'll
build the adapter for their API instead (the `FlightProvider` interface in
`src/lib/flights/types.ts` is the only thing that needs implementing).

## 2. Payments — Stripe (only if you switch to on-site checkout)

In the default lead model the site never takes payment; you send travelers a
payment link from your own processor when they accept a deal. Set
`NEXT_PUBLIC_BOOKING_MODE=checkout` to turn on the built-in checkout, then:

1. Create a Stripe account (stripe.com), complete business verification.
2. Developers → API keys → copy the **publishable** and **secret** keys.
3. (For production) Developers → Webhooks → add `https://<your-domain>/api/payments/webhook` and copy the signing secret.

```
STRIPE_SECRET_KEY=sk_live_xxx           # sk_test_xxx while testing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

Until these are set, checkout uses the built-in demo card form (no charges).

## 3. Transactional email — Resend

1. Create an account at resend.com, add and verify your sending domain (add the DNS records they give you).
2. Create an API key.

```
RESEND_API_KEY=re_xxx
EMAIL_FROM="Air1 Tickets <bookings@your-domain.com>"
```

Until set, confirmation emails are printed to the server log.

## 4. Database — Turso (or any libSQL/SQLite host)

Local development uses a SQLite file (`data/air1.db`). Serverless hosts
(Vercel, Netlify) don't keep files, so for production:

1. Create a free database at turso.tech (`turso db create air1`).
2. Get the URL and an auth token (`turso db show air1 --url`, `turso db tokens create air1`).

```
DATABASE_URL=libsql://air1-<org>.turso.io
DATABASE_AUTH_TOKEN=xxx
```

Migrations run automatically on first request (`npm run db:migrate` also works).

## 5. Domain, hosting and the canonical URL

* Buy the domain (the code assumes **air1tickets.com** — change `NEXT_PUBLIC_SITE_URL` if different).
* Recommended host: **Vercel** (zero-config for Next.js). Import the GitHub repo, add the environment variables above, deploy.
* Set:

```
NEXT_PUBLIC_SITE_URL=https://www.air1tickets.com
SESSION_SECRET=<run: openssl rand -base64 48>
```

`SESSION_SECRET` signs login sessions and booking-management cookies — it must be set in production.

## 6. Company details (shown on the site and in legal pages)

Please confirm or replace the placeholders in `src/lib/site.ts`:

* Legal entity name (currently "Air1 Tickets LLC"), founding year (2018)
* Street address (currently a placeholder San Francisco address)
* Support phone number (currently `+1 (888) 555-0147` — a placeholder) and support email
* Social profile URLs
* Whether you charge a service fee (`NEXT_PUBLIC_SERVICE_FEE_PER_PASSENGER`, default 0)

## 7. Legal review

`/legal/terms`, `/legal/privacy`, `/legal/cookies` and `/legal/accessibility`
are solid drafts written for a US online travel agency (DOT 24-hour rule, CCPA,
arbitration clause). They carry a visible "draft for legal review" notice. Have
counsel review them (the copy lives in `src/content/legal.ts`), then remove the
notice — it is the `<Alert>` block in `src/components/marketing/LegalPage.tsx`.

Also confirm: your seller-of-travel registrations (California, Florida, Hawaii,
Washington require them) — I can add the registration numbers to the footer.

## 8. Brand assets (optional — the site looks finished without them)

* Logo files if you have an existing brand (SVG preferred). The current logo is a generated mark.
* Photography: destination pages use generated artwork. Drop real photos into `public/images/destinations/<slug>.jpg` and set `image` on the destination to use them.
* Airline logos: put `public/airlines/<IATA>.svg` files in place (licensing is your responsibility) — they're picked up automatically.

## 9. SEO & analytics accounts

* Google Search Console: verify the domain, submit `https://<domain>/sitemap.xml`. Put the verification token in `GOOGLE_SITE_VERIFICATION`.
* Bing Webmaster Tools: `BING_SITE_VERIFICATION`.
* Google Analytics 4: `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXX`.
* Google Business Profile for the agency (address + phone) — improves local trust signals.

## 10. Nice-to-have decisions for phase 2

* Hotels and car rentals (Booking.com-style) — needs a hotel content provider (e.g. Expedia Rapid, Hotelbeds).
* Multi-city search.
* Seat maps in checkout (Duffel supports these).
* Price-alert emails: the alerts are saved; a scheduled job that re-checks fares and sends emails needs a cron host (Vercel Cron works).
* Live chat (Intercom/Crisp) — one script tag.
