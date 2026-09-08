import { describe, expect, it } from "vitest";
import { cardBrand, luhnValid, processDemoPayment } from "@/lib/payments/demo";

describe("demo payments", () => {
  const future = new Date().getFullYear() + 2;
  it("validates Luhn and brands", () => {
    expect(luhnValid("4242424242424242")).toBe(true);
    expect(luhnValid("4242424242424241")).toBe(false);
    expect(cardBrand("4242424242424242")).toBe("visa");
    expect(cardBrand("5555555555554444")).toBe("mastercard");
    expect(cardBrand("378282246310005")).toBe("amex");
    expect(cardBrand("6011111111111117")).toBe("discover");
  });

  it("approves a valid test card", () => {
    const r = processDemoPayment({ number: "4242 4242 4242 4242", expMonth: 12, expYear: future, cvc: "123", name: "Jane Doe" }, 250);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.reference.startsWith("demo_pi_")).toBe(true);
      expect(r.last4).toBe("4242");
    }
  });

  it("declines known decline cards and expired cards", () => {
    expect(processDemoPayment({ number: "4000000000000002", expMonth: 1, expYear: future, cvc: "123", name: "J" }, 100)).toMatchObject({ ok: false, error: "Your card was declined." });
    expect(processDemoPayment({ number: "4242424242424242", expMonth: 1, expYear: 2020, cvc: "123", name: "J" }, 100)).toMatchObject({ ok: false, error: "This card has expired." });
  });
});
