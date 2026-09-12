/**
 * Real customer stories used on the home, flights and hotels pages.
 *
 * GROUND RULES — these are presented to the public as things that actually
 * happened, so every entry must be one you can stand behind:
 *  1. Only add stories that really happened to a real customer.
 *  2. Get the traveler's permission before using their first name. If they
 *     would rather not be named, use a role instead ("a family of four").
 *  3. Comparative price claims ("$400 publicly") need to be substantiable —
 *     keep a screenshot or booking record of the public fare at that moment.
 *     Under FTC rules a savings claim has to reflect what customers would
 *     genuinely have paid otherwise.
 *  4. Never invent review scores, star ratings or booking counts.
 */
export interface CaseStudy {
  id: string;
  /** Where it belongs. "flight" also shows on the home page. */
  kind: "flight" | "hotel" | "activity";
  /** First name, or a description when the traveler prefers not to be named. */
  traveler: string;
  /** One line that sets the scene, shown as the card headline. */
  headline: string;
  /** Two or three sentences: the problem, what we did, how it ended. */
  story: string;
  /** Short label for the situation, e.g. "Missed flight · O'Hare". */
  context: string;
  /** What the customer paid, and what the public price was at the time. */
  paid?: number;
  publicPrice?: number;
  /** The single sentence worth pulling out in large type. */
  result: string;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "katherine-ord",
    kind: "flight",
    traveler: "Katherine",
    headline: "Missed her flight at O'Hare, flying again the same day",
    context: "Missed flight · Chicago O'Hare",
    story:
      "Katherine missed her connection at Chicago O'Hare and found herself at the airport with no seat and no plan. Public sites were quoting around $400 for the remaining flights that day. She messaged us on WhatsApp, and our agent worked the airline's last-minute inventory directly rather than the fares shown online.",
    paid: 200,
    publicPrice: 400,
    result: "Rebooked the same day for $200, about half the going online price.",
  },
];

export function caseStudiesFor(kind: CaseStudy["kind"]): CaseStudy[] {
  return CASE_STUDIES.filter((c) => c.kind === kind);
}
