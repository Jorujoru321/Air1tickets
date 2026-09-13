# Brand assets and social setup

## 1. The files

All in `public/brand/`. They're served from the site too, so you can link to
them directly once it's on a real domain.

| File | Use it for |
| --- | --- |
| `air1-avatar-1024.jpg` | **WhatsApp Business profile photo.** JPEG, full-bleed, plane centred so the circular crop doesn't cut it. |
| `air1-avatar-1024.png` | Same, PNG, where a platform prefers it. |
| `air1-avatar-320.jpg` | Small version for anything with an upload size limit. |
| `air1-icon-1024.png` | The rounded-square app icon. Use where the platform shows a square — Google Business Profile, email signature. |
| `air1-icon-512.png` / `-192.png` | Smaller square icons. |
| `air1-wordmark-light.png` | Logo + name on white. Invoices, documents, light backgrounds. |
| `air1-wordmark-dark.png` | Logo + name on navy. Slides, dark headers. |

**Use the avatar, not the icon, for any round profile picture.** WhatsApp,
Instagram and Facebook all crop to a circle. The icon's rounded-square corners
get sliced off; the avatar is drawn to survive the crop.

The site's own favicon, `icon-192.png`, `icon-512.png` and `apple-touch-icon.png`
have all been regenerated from the new mark.

## 2. Brand basics

**Colours**

| Token | Hex | Where |
| --- | --- | --- |
| Navy | `#0b1d3a` | Backgrounds, headings |
| Deep navy | `#12244a` | The logo gradient's dark end |
| Ocean | `#2f93ef` | Links, primary accents, logo gradient |
| Sunrise | `#ff6b35` | The plane's underside, primary buttons |
| Success green | `#16a34a` | The value tags, savings |

**Type:** Plus Jakarta Sans for headings, Inter for body. Both free on Google
Fonts. For social graphics, Plus Jakarta Sans Extrabold at tight letter-spacing
matches the site.

**Voice:** plain, specific, no exclamation marks. "The cheapest fare is rarely
the one on the screen" rather than "AMAZING DEALS!!!". The site sells on being
a person who knows things, so the writing should sound like one.

---

## 3. WhatsApp Business

This is the most important account you have — the entire site funnels into it.

1. Install **WhatsApp Business** (not regular WhatsApp) on the number.
2. Profile photo: `air1-avatar-1024.jpg`.
3. Business name: **Air1 Tickets**. Category: Travel agency.
4. Set the **business hours** to the hours you actually answer. The site
   promises a reply in about 15 minutes; if that's only true 9am–9pm, set it,
   and use the away message outside those hours.
5. Write a **greeting message** that asks for the one thing you need:
   > Thanks for messaging Air1 Tickets. Send me your route and dates (or just
   > roughly when) and I'll come back with a price. No card needed to get a quote.
6. Set up **quick replies** for the three you'll type most: asking for dates,
   sending the payment link, confirming a booking.
7. Add your **catalogue** later if you want, but it's low value for flights.

> **Before anything else: confirm the number works.** Area code 942 is not
> currently assigned in the North American Numbering Plan. Message the number
> from another phone. If WhatsApp says it isn't registered, nothing else on
> this page matters.

---

## 4. Instagram

I can't create the account — it needs your phone, your email and a verification
code. Here's everything to do it in about ten minutes, and what to put in it.

**Setup**

1. Sign up, then **Settings → Account type → switch to Business**. This is what
   unlocks insights, the contact button, and linking to Meta Ads.
2. Handle: `@air1tickets` if it's free. If not, `@air1.tickets` or
   `@fly.air1` — keep it short and avoid numbers-as-words.
3. Profile photo: `air1-avatar-1024.jpg`.
4. **Link the Facebook Page** (see below). You need this for ads anyway.
5. Add the **WhatsApp contact button** — Edit profile → Contact options. This
   turns your profile into the same funnel the site is.

**Bio** — 150 characters, so every word works:

> Last-minute flights & hotels, priced by a real agent.
> US 🇺🇸 + Canada 🇨🇦 · Free quote in ~15 min
> 👇 Tell us your trip

Link: your `/offer` page with a tracking tag, so you can see what Instagram
sends you:
`https://your-domain.com/offer?utm_source=instagram&utm_medium=bio`

**What to post.** Four rotating pillars, one post every other day is plenty:

1. **Price proof** — a real fare you beat, screenshotted, with the public price
   next to it. This is your single best-performing content. Blur the customer's
   name. Only post ones that actually happened.
2. **Route of the week** — one city, one good photo, the honest cheapest month
   to go and roughly what it costs.
3. **Agent tips** — the things in `/travel-guides`, cut to one idea per post.
   Baggage fees, basic economy traps, what to do when a flight is cancelled.
4. **The people** — your office, your desk, the team. This is why anyone trusts
   a WhatsApp number. It outperforms polished graphics every time.

**Stories** daily, low effort: a fare you're working, a countdown on a deal
that's genuinely expiring, a poll ("Cancún or Punta Cana in March?").

**First nine posts** so the grid looks intentional when someone lands on it:
one intro post (who you are, the real photo), three price-proof posts, three
route posts, two tip posts.

---

## 5. Facebook Page

You need this even if you never post: it's required for Meta ads, and the site
already links to Messenger at `m.me/air1tickets`.

1. Create a Page named **Air1 Tickets**, category Travel Agency.
2. Set the username to `air1tickets` so the `m.me/air1tickets` link the site
   uses actually resolves. **If you pick a different username, tell me and I'll
   change `NEXT_PUBLIC_MESSENGER_PAGE`** — otherwise the Messenger button on
   every page goes nowhere.
3. Profile photo: `air1-avatar-1024.jpg`. Cover: `air1-wordmark-dark.png`.
4. Add the phone, the site link and your hours.
5. In **Meta Business Suite**, connect the Page, the Instagram account and your
   ad account. That's what makes the `/offer` landing page and the `META50`
   code work end to end.

---

## 6. Also worth doing

- **Google Business Profile.** This is what makes you show up for "travel agent
  near me", and it's where reviews accumulate. Twenty real Google reviews will
  do more for bookings than any amount of Instagram.
- **TikTok** if you have someone who'll actually make video. The price-proof
  format works very well there. The site already recognises TikTok ad traffic
  and has a `TIKTOK50` code ready.
- Keep the **same avatar everywhere.** Recognition across WhatsApp, Instagram,
  Facebook and Google is worth more than variety.
