import { beforeAll, describe, expect, it } from "vitest";
import { searchOffers } from "@/lib/flights/mock/engine";
import { defaultExtras, extrasPricingFor, serviceFeePerPassenger, summarizePrice } from "@/lib/booking/pricing";
import { addDays } from "@/lib/utils";

const TODAY = "2026-09-09";
const DEPART = addDays(TODAY, 30);
const RETURN = addDays(TODAY, 37);

beforeAll(() => {
  process.env.MOCK_TODAY = TODAY;
  process.env.MOCK_NO_LATENCY = "1";
  delete process.env.NEXT_PUBLIC_SERVICE_FEE_PER_PASSENGER;
});

describe("booking pricing", () => {
  const offers = () => searchOffers({ origin: "ORD", destination: "MIA", departDate: DEPART, returnDate: RETURN, passengers: { adults: 2, children: 1, infants: 1 }, cabin: "economy" });

  it("with no extras the total equals the fare total", () => {
    const offer = offers()[0];
    const s = summarizePrice(offer, defaultExtras());
    expect(s.fareTotal).toBeCloseTo(offer.price.total, 2);
    expect(s.extrasTotal).toBe(0);
    expect(s.serviceFee).toBe(0);
    expect(s.total).toBeCloseTo(offer.price.total, 2);
    expect(s.payingPassengers).toBe(3); // infants on lap don't pay extras
  });

  it("prices bags per paying passenger per direction and protection per passenger", () => {
    const offer = offers()[0];
    const pricing = extrasPricingFor(offer);
    const s = summarizePrice(offer, { ...defaultExtras(), checkedBags: 1, travelInsurance: true, priorityBoarding: true, seats: { "0:0:0": "12A", "preference:0": "aisle" } });
    const bags = s.extras.find((l) => l.label.includes("checked bag"));
    expect(bags?.label).toBe("6 checked bags"); // 1 bag × 3 paying × 2 directions
    expect(bags?.amount).toBeCloseTo(6 * pricing.checkedBagFee, 2);
    expect(s.extras.find((l) => l.label === "Travel protection")?.amount).toBeCloseTo(pricing.travelInsurance * 3, 2);
    expect(s.extras.find((l) => l.label === "Priority boarding")?.amount).toBeCloseTo(pricing.priorityBoarding * 3 * 2, 2);
    // "preference:*" keys are free preferences, only real seat picks are charged.
    expect(s.extras.find((l) => l.label.includes("seat selection"))?.amount).toBeCloseTo(pricing.seatFeeFrom, 2);
    expect(s.total).toBeCloseTo(s.fareTotal + s.extrasTotal, 2);
  });

  it("applies the optional service fee from the environment", () => {
    process.env.NEXT_PUBLIC_SERVICE_FEE_PER_PASSENGER = "4.99";
    expect(serviceFeePerPassenger()).toBe(4.99);
    const offer = offers()[0];
    const s = summarizePrice(offer, defaultExtras());
    expect(s.serviceFee).toBeCloseTo(4.99 * 3, 2);
    expect(s.total).toBeCloseTo(offer.price.total + 4.99 * 3, 2);
    process.env.NEXT_PUBLIC_SERVICE_FEE_PER_PASSENGER = "nope";
    expect(serviceFeePerPassenger()).toBe(0);
    delete process.env.NEXT_PUBLIC_SERVICE_FEE_PER_PASSENGER;
  });
});
