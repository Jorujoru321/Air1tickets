import { beforeAll, describe, expect, it } from "vitest";
import { searchOffers } from "@/lib/flights/mock/engine";
import { describeOffer, messengerLink, offerChatText, whatsappLink } from "@/lib/leads/chat-links";
import { generateLockReference, isValidLockReference, lockedPriceFor } from "@/lib/leads/reference";
import { activityRequestText, flightRequestText, hotelRequestText } from "@/lib/leads/request-text";
import { addDays } from "@/lib/utils";

const TODAY = "2026-09-10";

beforeAll(() => {
  process.env.MOCK_TODAY = TODAY;
  process.env.MOCK_NO_LATENCY = "1";
});

describe("lead-model helpers", () => {
  const offer = () => searchOffers({ origin: "JFK", destination: "LAX", departDate: addDays(TODAY, 30), returnDate: addDays(TODAY, 37), passengers: { adults: 2, children: 0, infants: 1 }, cabin: "economy" })[0];

  it("builds WhatsApp and Messenger deep links", () => {
    expect(whatsappLink()).toMatch(/^https:\/\/wa\.me\/\d{8,15}$/);
    const link = whatsappLink("Hi there & co");
    expect(link).toContain("?text=Hi%20there%20%26%20co");
    expect(messengerLink()).toMatch(/^https:\/\/m\.me\/[\w.]+$/);
    expect(messengerLink("L-ABC234")).toContain("?ref=L-ABC234");
  });

  it("describes an offer in one readable line and prefills it into chat", () => {
    const o = offer();
    const line = describeOffer(o);
    expect(line).toContain("New York (JFK)");
    expect(line).toContain("Los Angeles (LAX)");
    expect(line).toMatch(/3 travelers/);
    expect(line).toMatch(/\$\d+ per traveler/);
    const text = offerChatText(o, "L-7K2M9Q");
    expect(text.startsWith("Hi Air1, I locked fare L-7K2M9Q:")).toBe(true);
    expect(decodeURIComponent(whatsappLink(text))).toContain(line);
  });

  it("locks the per-paying-traveler price the site displayed", () => {
    const o = offer();
    expect(lockedPriceFor(o)).toBeCloseTo(o.price.total / 2, 2);
  });

  it("generates unambiguous references", () => {
    const seq = [0.1, 0.5, 0.9, 0.3, 0.7, 0.2];
    let i = 0;
    const ref = generateLockReference(() => seq[i++ % seq.length]);
    expect(ref).toMatch(/^L-[A-HJ-NP-Z2-9]{6}$/);
    expect(isValidLockReference(ref)).toBe(true);
    expect(isValidLockReference("L-0OI1AB")).toBe(false); // ambiguous characters are never issued
    expect(isValidLockReference("A1K7M2QX")).toBe(false);
    const many = new Set(Array.from({ length: 500 }, () => generateLockReference()));
    expect(many.size).toBeGreaterThan(495);
  });
});

describe("WhatsApp request messages", () => {
  it("writes a flight request with every field the agent needs", () => {
    const text = flightRequestText({ origin: "JFK", destination: "CUN", departDate: "2026-11-14", returnDate: "2026-11-21", passengers: { adults: 2, children: 1, infants: 0 }, cabin: "economy", directOnly: true });
    expect(text).toContain("From: New York (JFK)");
    expect(text).toContain("To: Cancun (CUN)");
    expect(text).toContain("Depart: Saturday, November 14, 2026");
    expect(text).toContain("Return: Saturday, November 21, 2026");
    expect(text).toContain("Travelers: 2 adults, 1 child");
    expect(text).toContain("Cabin: Economy");
    expect(text).toContain("Nonstop flights only");
    expect(text.endsWith("What's your best price?")).toBe(true);
  });

  it("marks one-way trips and omits empty extras", () => {
    const text = flightRequestText({ origin: "ORD", destination: "MIA", departDate: "2026-12-02", passengers: { adults: 1, children: 0, infants: 0 }, cabin: "business" });
    expect(text).toContain("Trip: One way");
    expect(text).not.toContain("Return:");
    expect(text).not.toContain("Notes:");
    expect(text).toContain("Cabin: Business");
  });

  it("writes hotel and activity requests", () => {
    const hotel = hotelRequestText({ destination: "Cancún, Mexico", checkIn: "2026-11-14", checkOut: "2026-11-18", rooms: 2, adults: 4, children: 2, stars: "4 star" });
    expect(hotel).toContain("Where: Cancún, Mexico");
    expect(hotel).toContain("Rooms: 2");
    expect(hotel).toContain("Guests: 4 adults, 2 children");
    expect(hotel).toContain("Preferred rating: 4 star");

    const act = activityRequestText({ destination: "Rome, Italy", date: "2026-10-03", travelers: 2, category: "Anything" });
    expect(act).toContain("Where: Rome, Italy");
    expect(act).toContain("Travelers: 2");
    expect(act).not.toContain("Looking for:"); // "Anything" is not worth sending
  });

  it("escapes cleanly into a wa.me link", () => {
    const text = flightRequestText({ origin: "JFK", destination: "LAX", departDate: "2026-10-01", passengers: { adults: 1, children: 0, infants: 0 }, cabin: "economy" });
    const link = whatsappLink(text);
    expect(link.startsWith("https://wa.me/")).toBe(true);
    expect(decodeURIComponent(link.split("?text=")[1])).toBe(text);
  });
});
