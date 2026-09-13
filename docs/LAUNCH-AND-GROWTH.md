# Launch and growth plan

Ordered by what actually moves bookings, not by what is easiest to build.
Items marked **[you]** need information or accounts only the business has.

---

## 1. Before launch — the blockers

These are the things that will cost you money or credibility if you skip them.

### Legal and compliance

1. **[you] Seller of Travel registration.** California, Florida, Hawaii and
   Washington require sellers of travel to register, and California requires
   the registration number on all advertising. Selling into those states
   without it exposes you to penalties. Get the numbers, send them to me, and
   they go in the footer and the terms.
2. **[you] Lawyer review of `/legal/*`.** They are solid drafts covering the
   DOT 24-hour rule, CCPA and cancellation terms, and each carries a visible
   "draft for legal review" notice. Counsel confirms, then I remove the notice.
3. **[you] How you take payment.** The site never charges a card. Agents send
   a payment link. Make sure that link goes through a PCI-compliant processor
   and that the privacy policy describes what you actually do.
4. **Price claims.** Anything of the form "$200 instead of $400" has to be
   substantiable. Keep a screenshot of the public fare at that moment.

### Identity

5. **[you] Confirm the company details** in `src/lib/site.ts`: legal name,
   address, founding year, support email. They are placeholders right now.
6. **[you] Verify the WhatsApp number opens a chat.** Area code 942 is not
   currently assigned in the North American numbering plan. If WhatsApp says
   the number is not registered, send the number in full international form.

---

## 2. Trust — what actually works for a travel agency

People hand over money to a stranger on WhatsApp only if the site makes that
feel safe. In rough order of impact:

1. **[you] Real reviews.** This is the single biggest gap and I cannot build
   it. Set up a Google Business Profile and ask every happy customer for a
   review on it. Twenty real Google reviews beat any amount of copy. Trustpilot
   is worth it once you have volume. Once reviews exist I can pull the rating
   onto the site and add `AggregateRating` schema, which puts stars in search
   results.
2. **[you] More real customer stories.** Katherine's is on the site and it is
   the most persuasive thing there. Send me three or four more with: what
   happened, what they paid, what the public price was, and permission to use
   a first name. I will not invent these — fabricated testimonials carry FTC
   civil penalties and are the kind of thing that surfaces later.
3. **[you] A photo of you, or the team.** An "about" page with a real face and
   a real name outperforms any stock image. Same for the office, if there is
   one.
4. **[you] Accreditation.** ARC or IATA number, host agency, consortium
   membership, ASTA. Any of these, displayed, materially changes perception.
5. **Response-time honesty.** The site promises a reply in about 15 minutes.
   If that is not true outside business hours, tell me the real hours and I
   will show an out-of-hours message instead of an unmet promise.

---

## 3. Conversion — turning visitors into WhatsApp messages

Built already: search hands straight to WhatsApp with the trip written out, a
floating chat button on every page, the case study section, the price-lock
path, and per-search logging so you see demand even when someone never sends.

Worth doing next, roughly in order of value:

1. **Measure first, then optimise.** Now shipped (section 4). Do not change the
   funnel before you can see it — you will be guessing.
2. **Sticky mobile call-to-action.** Most traffic will be mobile. A persistent
   bottom bar converts better than a floating circle. Quick to build.
3. **Business-hours awareness.** If someone messages at 3am, set the
   expectation in the prefilled text rather than letting silence do it.
4. **Exit intent on route pages.** Someone reading about JFK to LAX for ninety
   seconds and leaving is your warmest lost visitor.
5. **[you] Reduce the ask.** The flight form needs origin, destination and
   dates. If your agents can work from less, I can cut fields. Every removed
   field lifts completion.

---

## 4. Traffic and analytics — shipped in this change

| Tool | Status | What it gives you |
| --- | --- | --- |
| Google Analytics 4 | wired, needs ID | Which pages and channels produce WhatsApp hand-offs |
| Meta Pixel | wired, needs ID | Facebook and Instagram ad optimisation and retargeting |
| Microsoft Clarity | wired, needs ID | Free session recordings and heatmaps |
| Cookie consent | shipped | Honours the promise the cookie policy already made |

Events now fired: `request_sent` (the conversion), `chat_click`, `phone_click`,
`lock_completed`, `newsletter_signup`, `search_error`. Each carries the trip
kind, origin, destination and traveller count.

**[you] to finish the setup:**

1. Create a GA4 property, put the ID in `NEXT_PUBLIC_GA_MEASUREMENT_ID`, then
   in GA4 mark **`request_sent` as a key event**. Without that step it is not
   a conversion and cannot be imported into Google Ads.
2. Create a Meta Pixel, set `NEXT_PUBLIC_META_PIXEL_ID`.
3. Create a Clarity project (free), set `NEXT_PUBLIC_CLARITY_PROJECT_ID`.
4. Verify the domain in **Google Search Console** and submit
   `/sitemap.xml` (2,349 URLs). Set `GOOGLE_SITE_VERIFICATION`. Do the same in
   Bing Webmaster Tools.
5. Create a **Google Business Profile** with the real address and phone. This
   is what makes you appear for "travel agent near me" and is where reviews
   accumulate.

### SEO already in place

2,349 indexable pages: route pages for 867 city pairs, 249 airport pages, 54
airline pages, 40 destination guides and 10 long-form articles. Every page has
a canonical URL matching what the host serves, Open Graph and Twitter tags, and
JSON-LD (Organization, WebSite, Breadcrumb, FAQ, Flight with AggregateOffer,
Airport, Airline, Article, TouristDestination, Service). Sitemap and robots are
generated. Accessibility is clean at WCAG 2.2 AA on the audited pages, which
correlates with rankings and is a legal exposure of its own for a US travel
seller.

### What is missing for SEO, honestly

- **Backlinks.** Nothing on the site fixes this. It is outreach: travel
  roundups, local press, supplier directories, your accreditation listings.
- **Real photography.** The build now fetches openly-licensed photos, but
  original photos you own are better, and they are the thing that stops the
  site reading as templated.
- **Freshness.** Route pages recompute fares, but Google rewards genuine
  editorial updates. One real post a month beats ten thin ones.

---

## 5. Sequence I would follow

1. Confirm company details, get the WhatsApp number verified working.
2. Deploy to Vercel with a real domain (the GitHub Pages build is a preview
   and cannot run the lead capture, contact form or admin dashboard).
3. Set up GA4, Search Console, Meta Pixel, Clarity, Google Business Profile.
4. Get the legal review done and the seller-of-travel numbers on the site.
5. Collect ten real reviews and three more customer stories.
6. Only then spend on ads — with conversion tracking live, so you can tell
   which keywords produce messages rather than clicks.
