/**
 * Proof for the home, flights and hotels pages.
 *
 * Two kinds of entry, labelled differently on the card, because the
 * difference matters both to readers and legally:
 *
 *   verified: true  — a real thing that happened to a real customer. Shown as
 *                     "Customer story" with their first name.
 *   verified: false — how we handle a situation. Shown as "How we handle it",
 *                     with no name, no invented quote and no claimed outcome.
 *
 * NEVER flip an example to verified to make it look better, and never write a
 * "customer" who does not exist. Fabricated testimonials are illegal for a US
 * business: the FTC rule on consumer reviews and testimonials (16 CFR Part
 * 465) carries civil penalties per violation. They are also the easiest thing
 * in the world for a competitor or a journalist to check.
 *
 * A new agency with no track record is not stuck. The examples below sell the
 * service on how it works rather than on who has used it, which is honest and
 * persuasive. Replace them with verified stories as real ones accumulate.
 *
 * Before adding a verified story:
 *   1. It must have actually happened.
 *   2. Get the traveler's permission to use their first name.
 *   3. Keep evidence for any price comparison — a screenshot of the public
 *      fare at that moment.
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
  /** Only ever set on verified stories — these are claims about real money. */
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
    id: "stranded",
    kind: "flight",
    verified: false,
    traveler: "Someone stuck at the airport",
    headline: "Your flight is gone and the airline queue is forty deep",
    context: "Missed connection or cancellation",
    story:
      "The desk will rebook you onto that airline's next seat, which may be tomorrow. We are not limited to one airline. While you are still in the queue we check every carrier out of that airport, including the ones whose last-minute seats never surface on public search, and send you what is actually flyable tonight.",
    result: "Message us before you join the queue, not after.",
  },
  {
    id: "fare-climbing",
    kind: "flight",
    verified: false,
    traveler: "Someone watching a fare climb",
    headline: "The price moves every time you check",
    context: "Deciding when to book",
    story:
      "Send us the trip instead of refreshing it. We note the exact itinerary and price you saw, watch the route, and tell you when it is genuinely time to book — including when the better move is a nearby airport, or shifting a date by one day.",
    result: "An agent watches the route so you do not have to.",
  },
  {
    id: "group-seats",
    kind: "flight",
    verified: false,
    traveler: "A family booking together",
    headline: "Four seats together, not four separate bookings",
    context: "Family and group travel",
    story:
      "Booking sites price group seats from whatever is left, which is how families end up scattered across the cabin at four different fares. An agent can see how the cabin is filling and which fare class actually has seats side by side, then hold them while you decide.",
    result: "Everyone sits together, priced as one booking.",
  },
  {
    id: "complex-itinerary",
    kind: "flight",
    verified: false,
    traveler: "Someone with an awkward route",
    headline: "The trip no search box handles well",
    context: "Multi-city and open-jaw",
    story:
      "Fly into one city and home from another, stop somewhere for three days on the way, travel with an infant and a set of golf clubs. Search boxes either refuse these or price them badly. Describe it in a sentence and we price it properly, including whether two separate tickets beat one.",
    result: "Say it in plain English; we turn it into an itinerary.",
  },
  {
    id: "all-inclusive",
    kind: "hotel",
    verified: false,
    traveler: "A couple pricing a resort",
    headline: "Same resort, very different price two days apart",
    context: "All-inclusive resorts",
    story:
      "All-inclusive pricing swings hard by date, and the public rate rarely shows the cheaper night either side of your dates. Tell us your budget per person and roughly when, and we quote the dates that cost noticeably less alongside the ones you asked for.",
    result: "You see what flexibility is actually worth before committing.",
  },
  {
    id: "late-room",
    kind: "hotel",
    verified: false,
    traveler: "A late booker",
    headline: "The room nobody sold",
    context: "Last-minute stays",
    story:
      "Hotels discount unsold rooms in the last few days before a date, but those rates often sit in channels public search never shows. If your trip is close, message us — that window is exactly what our agents watch.",
    result: "Late bookings are often the cheapest, not the dearest.",
  },
  {
    id: "right-neighbourhood",
    kind: "hotel",
    verified: false,
    traveler: "A first-time visitor",
    headline: "The cheap hotel that is cheap for a reason",
    context: "Choosing where to stay",
    story:
      "A rate looks good until you realise it is forty minutes from everything you came to see, or beside a motorway. We book these cities constantly. Tell us what you are in town for and we will say which areas actually work and which bargain to skip.",
    result: "The right neighbourhood, not just the lowest number.",
  },
];

export function caseStudiesFor(kind: CaseStudy["kind"]): CaseStudy[] {
  return CASE_STUDIES.filter((c) => c.kind === kind);
}
