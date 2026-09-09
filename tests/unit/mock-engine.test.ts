import { beforeAll, describe, expect, it } from "vitest";
import { decodeOfferId, fareOptionsFor, offerById, priceCalendarFor, searchOffers } from "@/lib/flights/mock/engine";
import { getAirport } from "@/data/airports";
import { getAirline } from "@/data/airlines";
import { minutesBetween } from "@/lib/flights/geo";
import { addDays } from "@/lib/utils";
import type { Offer } from "@/lib/flights/types";

const TODAY = "2026-09-09";
const DEPART = addDays(TODAY, 28);
const RETURN = addDays(TODAY, 35);
const pax = { adults: 1, children: 0, infants: 0 };

beforeAll(() => {
  process.env.MOCK_TODAY = TODAY;
  process.env.MOCK_NO_LATENCY = "1";
});

function assertSane(offer: Offer) {
  expect(offer.price.total).toBeGreaterThan(0);
  expect(offer.price.taxes).toBeLessThan(offer.price.total * 0.72);
  expect(offer.price.base + offer.price.taxes).toBeCloseTo(offer.price.total, 1);
  for (const s of offer.slices) {
    const o = getAirport(s.origin)!;
    const d = getAirport(s.destination)!;
    expect(minutesBetween(s.departure, o.tz, s.arrival, d.tz)).toBe(s.durationMinutes);
    expect(s.durationMinutes).toBeGreaterThan(30);
    expect(s.segments.length).toBe(s.stops + 1);
    expect(s.layovers.length).toBe(s.stops);
    for (const l of s.layovers) expect(l.durationMinutes).toBeGreaterThanOrEqual(45);
    for (const seg of s.segments) {
      const so = getAirport(seg.origin)!;
      const sd = getAirport(seg.destination)!;
      expect(minutesBetween(seg.departure, so.tz, seg.arrival, sd.tz)).toBe(seg.durationMinutes);
      expect(getAirline(seg.marketingCarrier)).toBeDefined();
    }
  }
}

describe("mock engine", () => {
  it("is deterministic and re-priceable from the offer id", () => {
    const a = searchOffers({ origin: "JFK", destination: "LAX", departDate: DEPART, returnDate: RETURN, passengers: pax, cabin: "economy" });
    const b = searchOffers({ origin: "JFK", destination: "LAX", departDate: DEPART, returnDate: RETURN, passengers: pax, cabin: "economy" });
    expect(a.length).toBeGreaterThan(40);
    expect(a.map((o) => o.id)).toEqual(b.map((o) => o.id));
    expect(a.map((o) => o.price.total)).toEqual(b.map((o) => o.price.total));
    for (const offer of a.slice(0, 15)) {
      const again = offerById(offer.id);
      expect(again).not.toBeNull();
      expect(again!.price.total).toBe(offer.price.total);
      expect(again!.slices.map((s) => s.departure)).toEqual(offer.slices.map((s) => s.departure));
      assertSane(offer);
    }
    expect(decodeOfferId(a[0].id)?.params.origin).toBe("JFK");
    expect(offerById("mk_not-a-real-id")).toBeNull();
    expect(offerById("off_duffel_123")).toBeNull();
  });

  it("returns offers sorted by price with best/cheapest/fastest tags", () => {
    const offers = searchOffers({ origin: "BOS", destination: "SFO", departDate: DEPART, passengers: pax, cabin: "economy" });
    for (let i = 1; i < offers.length; i++) expect(offers[i].price.total).toBeGreaterThanOrEqual(offers[i - 1].price.total);
    expect(offers.some((o) => o.tags?.includes("best"))).toBe(true);
    expect(offers[0].tags).toContain("cheapest");
    expect(offers.some((o) => o.tags?.includes("fastest"))).toBe(true);
  });

  it("offers plenty of nonstops on trunk routes and only US carriers domestically", () => {
    const offers = searchOffers({ origin: "JFK", destination: "LAX", departDate: DEPART, returnDate: RETURN, passengers: pax, cabin: "economy" });
    const nonstop = offers.filter((o) => o.slices.every((s) => s.stops === 0));
    expect(nonstop.length).toBeGreaterThan(20);
    for (const o of offers) expect(getAirline(o.owner)?.countryCode).toBe("US");
    const direct = searchOffers({ origin: "JFK", destination: "LAX", departDate: DEPART, passengers: pax, cabin: "economy", directOnly: true });
    expect(direct.every((o) => o.slices[0].stops === 0)).toBe(true);
  });

  it("handles international and thin markets with connections", () => {
    const lhr = searchOffers({ origin: "JFK", destination: "LHR", departDate: DEPART, returnDate: RETURN, passengers: pax, cabin: "economy" });
    expect(lhr.length).toBeGreaterThan(30);
    expect(lhr.some((o) => o.owner === "BA")).toBe(true);
    expect(lhr[0].price.total).toBeGreaterThan(250);
    const thin = searchOffers({ origin: "BOI", destination: "ATH", departDate: DEPART, returnDate: RETURN, passengers: pax, cabin: "economy" });
    expect(thin.length).toBeGreaterThan(5);
    expect(thin.every((o) => o.slices.every((s) => s.stops >= 1))).toBe(true);
    for (const o of thin.slice(0, 5)) assertSane(o);
    // Eastbound transpacific arrives "before" it departs on the calendar — dayOffset can be 0 or negative-looking but duration stays positive.
    const tokyo = searchOffers({ origin: "NRT", destination: "LAX", departDate: DEPART, passengers: pax, cabin: "economy" });
    for (const o of tokyo.slice(0, 5)) assertSane(o);
  });

  it("prices premium cabins, children and infants sensibly", () => {
    const econ = searchOffers({ origin: "LAX", destination: "NRT", departDate: DEPART, returnDate: RETURN, passengers: pax, cabin: "economy" });
    const biz = searchOffers({ origin: "LAX", destination: "NRT", departDate: DEPART, returnDate: RETURN, passengers: pax, cabin: "business" });
    expect(biz[0].price.total).toBeGreaterThan(econ[0].price.total * 2);
    const family = searchOffers({ origin: "ATL", destination: "MCO", departDate: DEPART, returnDate: RETURN, passengers: { adults: 2, children: 1, infants: 1 }, cabin: "economy" });
    const f = family[0];
    expect(f.price.perInfant).toBe(0);
    expect(f.price.total).toBeCloseTo(f.price.perAdult * 2 + (f.price.perChild ?? 0), 1);
  });

  it("exposes fare families in ascending price order", () => {
    const offers = searchOffers({ origin: "ATL", destination: "MCO", departDate: DEPART, returnDate: RETURN, passengers: pax, cabin: "economy" });
    const delta = offers.find((o) => o.owner === "DL")!;
    const options = fareOptionsFor(delta.id);
    expect(options.length).toBeGreaterThanOrEqual(3);
    expect(options[0].fare.brand).toBe("Basic Economy");
    for (let i = 1; i < options.length; i++) expect(options[i].price.total).toBeGreaterThanOrEqual(options[i - 1].price.total);
    expect(options.map((o) => o.fare.brand)).toEqual(getAirline("DL")!.fareBrands.filter((b) => b.cabin === "economy").map((b) => b.brand));
  });

  it("price calendar covers the month and tracks the search minimum", () => {
    const month = DEPART.slice(0, 7);
    const cal = priceCalendarFor("JFK", "LAX", month);
    const daysInMonth = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate();
    expect(cal.length).toBeGreaterThan(0);
    expect(cal.length).toBeLessThanOrEqual(daysInMonth);
    expect(cal.every((e) => e.price >= 39 && e.price < 2000)).toBe(true);
    const entry = cal.find((e) => e.date === DEPART)!;
    const search = searchOffers({ origin: "JFK", destination: "LAX", departDate: DEPART, returnDate: RETURN, passengers: pax, cabin: "economy" });
    const ratio = search[0].price.total / entry.price;
    expect(ratio).toBeGreaterThan(0.6);
    expect(ratio).toBeLessThan(1.6);
  });
});
