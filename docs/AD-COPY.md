# Ad copy and the offer mechanic

Everything here is written for Air1 and is yours to use. Paste it straight into
Ads Manager.

---

## 1. How the offer works on the site

A visitor who arrives from a paid ad is recognised, shown the offer, and has
the code carried into WhatsApp with their trip, so the agent quoting them knows
to honour it. Organic visitors see none of it.

**What triggers it**

| Arrives with | Detected as | Code |
| --- | --- | --- |
| `fbclid` (Meta adds this automatically) | Meta | `META50` |
| `utm_source=facebook` / `instagram` / `ig` / `fb` / `meta` | Meta | `META50` |
| `gclid`, `gbraid`, `wbraid`, `utm_source=google` | Google | `SEARCH50` |
| `ttclid`, `utm_source=tiktok` | TikTok | `TIKTOK50` |
| `utm_medium=email` | Email | `INBOX50` |
| `?offer=ANYCODE` | Direct | `AIR1` |
| Nothing — organic search, typed the URL | *no offer shown* | — |

**Where to point your ads:** `https://your-domain.com/offer`

That page assumes the visit was paid for, so it works even when an in-app
browser or a link shortener strips the click ID. It is deliberately
`noindex` — an offer that says "you came from our ad" must not be served by
Google to someone who didn't. Add `?utm_campaign=` to tell campaigns apart in
WhatsApp; the campaign name rides along into the message.

**What the traveler sees:** an orange bar across the top with the offer, the
code and a live countdown; the same offer restated beside the search form; and
the code pre-written into their WhatsApp message when they hit search.

**The countdown is real.** It is a timestamp written once, on first arrival. It
does not reset when they refresh or come back tomorrow, and when it runs out
the bar says so and offers to help anyway. Fake urgency that resets is a dark
pattern, it is what regulators go after first, and travelers recognise it.

**Configure it** with env vars — no code change needed:

```
NEXT_PUBLIC_PROMO_ENABLED=1        # 0 turns the whole thing off
NEXT_PUBLIC_PROMO_DISCOUNT=50      # the number in the copy
NEXT_PUBLIC_PROMO_HOURS=24         # how long the code holds
NEXT_PUBLIC_PROMO_CODE_META=META50
```

**In GA4**, mark `promo_applied` as a key event alongside `request_sent`. It
fires only when a request reaches WhatsApp carrying a code, which is the number
that tells you whether the ad spend worked.

---

## 2. Before you run a single ad — the discount claim

> **Set `NEXT_PUBLIC_PROMO_DISCOUNT` to a number your agents actually beat.**

"Up to 50% off public fares" is an advertising claim about real money. Two
things make it legal, and both are on you:

1. **"Up to" has to mean something.** A meaningful number of travelers must
   actually get near it. If your typical saving is 15% and 50% happened once,
   advertise 15%. The FTC Guides Against Deceptive Pricing (16 CFR Part 233)
   exist for precisely this, and a percentage off a price nobody ever charged
   is the textbook violation.
2. **Keep the evidence.** When an agent beats a public fare, screenshot the
   public fare at that moment and file it with the booking. One folder,
   named by date. If a claim is ever questioned — by a regulator, a competitor
   or Meta's own review — that folder is the entire defence.

Meta also rejects ads for unsubstantiated discount claims, and repeated
rejections get ad accounts restricted. The conservative number is not the
cautious choice here, it is the one that keeps the account running.

---

## 3. Meta ad copy

Headline ≤40 characters, description ≤30, primary text front-loaded because
Meta truncates around 125.

### Set A — the price you're looking at

> **Primary text:** Before you book that fare, send it to us. A US-based agent
> prices your exact trip against what you're seeing online — using last-minute
> and consolidator seats the public sites can't show. Free to ask. Reply in
> about 15 minutes on WhatsApp.
>
> **Headline:** Don't book that fare yet
> **Description:** Free quote in 15 minutes
> **CTA button:** Send WhatsApp Message

### Set B — the last-minute angle

> **Primary text:** Flying in the next two weeks? That's our window. Airlines
> discount unsold seats late and most of those fares never reach public search.
> Tell us the route and dates and we'll tell you what it really costs.
>
> **Headline:** Last-minute seats, agent prices
> **Description:** No card. No account.
> **CTA button:** Send WhatsApp Message

### Set C — stuck travelers (retarget to airport geofences)

> **Primary text:** Missed your flight? Don't join the queue — message us from
> where you're standing. We're not tied to one airline, so we can see every
> carrier leaving that airport tonight, including the seats that never show up
> online.
>
> **Headline:** Stuck at the airport? Message us
> **Description:** Rebooked the same day
> **CTA button:** Send WhatsApp Message

### Set D — the objection

> **Primary text:** "Why would an agent be cheaper?" Because we're paid a
> commission by the airline, and we can see fare classes and unsold inventory
> that consumer search sites aren't permitted to display. Same ticket, same
> airline, your name. Ask us and see.
>
> **Headline:** Same ticket. Different price.
> **Description:** Ask before you book
> **CTA button:** Send WhatsApp Message

### Set E — families and groups

> **Primary text:** Booking four seats and getting four separate prices in four
> separate rows? That's what happens when a search box prices whatever's left.
> An agent can see which fare class actually has seats together — and hold them
> while you decide.
>
> **Headline:** Four seats together, one price
> **Description:** Family travel, done right
> **CTA button:** Send WhatsApp Message

### Short headline bank

Rotate these; Meta rewards variety.

- Don't book that fare yet
- The fare you found isn't the lowest
- Ask an agent before you pay
- Last-minute seats, agent prices
- Same ticket. Different price.
- Stuck at the airport? Message us
- Free quote. 15 minutes. No card.
- Four seats together, one price
- We'll tell you if online is cheaper
- Your dates, priced by a person

---

## 4. What not to write

These get ads rejected, or worse:

- **A flat "50% off"** with no "up to". It is a promise about every trip.
- **"Cheapest fares guaranteed"** — a guarantee you can't honour on every
  route is a false claim, and it invites a chargeback argument you'll lose.
- **A fake strikethrough price.** `$~~800~~ $400` requires that $800 was a real
  price actually offered. Don't invent the left-hand number.
- **Invented reviews or star ratings.** Fabricated testimonials carry FTC civil
  penalties per violation under 16 CFR Part 465. Get real Google reviews
  instead — twenty real ones beat anything you could write.
- **"Book now, only 2 seats left"** unless you're reading live inventory.
- **Countdown timers in the creative** that don't match the real offer window.

---

## 5. After the click — what decides whether it converts

The ad buys the click; these decide the rest. In order of impact:

1. **Answer speed.** The site promises ~15 minutes. If a message sits for two
   hours, the ad spend is wasted and the promise is false. Staff the window you
   advertise, or lower the number in `NEXT_PUBLIC_LOCK_RESPONSE_MINUTES`.
2. **The first reply.** Send two or three real options with total prices, not
   "Hi, where would you like to go?" — they already told the site that, and it
   is in the message.
3. **Honour the code.** If someone quotes `META50` and gets the same price a
   walk-up would, they'll say so publicly. The code has to mean something.
4. **Ask for the review.** Every satisfied customer, same day, with a direct
   link to your Google Business Profile.
