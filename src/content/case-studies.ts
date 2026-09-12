/**
 * Proof for the home, flights and hotels pages.
 *
 * There are two kinds of entry and the site labels them differently, because
 * the difference matters both to readers and legally:
 *
 *   verified: true  — a real thing that happened to a real customer. Shown as
 *                     "Customer story" with their name.
 *   verified: false — an illustrative example of how we work. Shown as
 *                     "Example scenario", with no name and no invented quote.
 *
 * NEVER flip an example to verified to make it look better. Fake testimonials
 * are illegal for a US business: the FTC's rule on consumer reviews and
 * testimonials (16 CFR Part 465, in force since 2024) carries civil penalties
 * per violation for fabricated endorsements.
 *
 * Before adding a verified story:
 *   1. It must have actually happened.
 *   2. Get the traveler's permission to use their first name.
 *   3. Keep evidence for any price comparison — a screenshot of the public
 *      fare at that moment. A savings claim has to reflect what the customer
 *      would genuinely have paid otherwise.
 */
export interface CaseStudy {
  id: string;
  kind: "flight" | "hotel" | "activity";
  /** True only for real, permissioned customer stories. */
  verified: boolean;
  /** First name for verified stories; a description for examples. */
  traveler: string;
  headline: string;
  story: string;
  /** Short situation label, e.g. "Missed flight · Chicago O'Hare". */
  context: string;
  paid?: number;
  publicPrice?: number;
  result: string;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "katherine-ord",
    kind: "flight",
    verified: true,
    traveler: "Katherine",
    headline: "Missed her flight at O'Hare, flying again the same day",
    context: "Missed flight · Chicago O'Hare",
    story:
      "Katherine missed her connection at Chicago O'Hare and found herself at the airport with no seat and no plan. Public sites were quoting around $400 for the remaining flights that day. She messaged us on WhatsApp, and our agent worked the airline's last-minute inventory directly rather than the fares shown online.",
    paid: 200,
    publicPrice: 400,
    result: "Rebooked the same day for $200, about half the going online price.",
  },
  {
    id: "example-fare-climbing",
    kind: "flight",
    verified: false,
    traveler: "A traveler watching a fare climb",
    headline: "The fare keeps rising while you decide",
    context: "Example scenario · Fare volatility",
    story:
      "You find a fare you like but you are not ready to commit, and every time you check back it has moved. Send it to us instead. We note the exact itinerary and price, keep watching the route, and tell you when it is genuinely time to book — including when the right move is a nearby airport or shifting a date by one day.",
    result: "You stop refreshing a search and let an agent watch the route for you.",
  },
  {
    id: "example-group-travel",
    kind: "flight",
    verified: false,
    traveler: "A family booking together",
    headline: "Four seats together, not four separate bookings",
    context: "Example scenario · Family travel",
    story:
      "Booking sites price group seats from whatever inventory is left, which is how families end up scattered across the cabin or paying four different fares. An agent can see how the seat map is filling and which fare class actually has four seats side by side, then hold them while you decide.",
    result: "Everyone sits together, priced as one booking rather than four.",
  },
  {
    id: "example-all-inclusive",
    kind: "hotel",
    verified: false,
    traveler: "A couple pricing a resort",
    headline: "Same resort, very different price two days apart",
    context: "Example scenario · All-inclusive",
    story:
      "All-inclusive pricing swings hard by date, and the public rate rarely shows you the cheaper night either side of your dates. Tell us your budget per person and roughly when you want to go, and we quote the dates that cost noticeably less alongside the ones you asked for.",
    result: "You see what flexibility is actually worth before you commit.",
  },
  {
    id: "example-late-room",
    kind: "hotel",
    verified: false,
    traveler: "A late booker",
    headline: "The room nobody sold",
    context: "Example scenario · Last-minute stay",
    story:
      "Hotels discount unsold rooms in the last few days before a date, but those rates often sit in channels the public search never shows. If your trip is close, message us: that window is exactly what our agents watch.",
    result: "Late bookings are often the cheapest, not the most expensive.",
  },
];

export function caseStudiesFor(kind: CaseStudy["kind"]): CaseStudy[] {
  return CASE_STUDIES.filter((c) => c.kind === kind);
}
