import { describe, expect, it } from "vitest";
import { generateBookingReference, isValidReference, normalizeReference } from "@/lib/booking/reference";

describe("booking reference", () => {
  it("generates A1 + 6 unambiguous chars", () => {
    for (let i = 0; i < 200; i++) {
      const ref = generateBookingReference();
      expect(ref).toMatch(/^A1[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/);
      expect(isValidReference(ref)).toBe(true);
    }
  });
  it("normalises user input", () => {
    expect(normalizeReference(" a1-k7m2 qx ")).toBe("A1K7M2QX");
    expect(isValidReference("nope")).toBe(false);
  });
});
