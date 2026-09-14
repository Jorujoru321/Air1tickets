import { describe, expect, it } from "vitest";
import { parseShorthand, buildMessage, describePlace } from "@/lib/agent/quote";

/**
 * The parser is deliberately forgiving — an agent typing one-handed on a phone
 * should never get an error, just a message they can fix. These lock in the
 * shorthand shapes agents actually use.
 */
describe("parseShorthand", () => {
  it("reads 'atl lhr 450'", () => {
    const q = parseShorthand("atl lhr 450");
    expect(q.origin).toBe("ATL");
    expect(q.destination).toBe("LHR");
    expect(q.price).toBe(450);
    expect(q.notes).toEqual([]);
  });

  it("reads a hyphenated pair and a $ fare", () => {
    const q = parseShorthand("ATL-LHR $1,299");
    expect(q.origin).toBe("ATL");
    expect(q.destination).toBe("LHR");
    expect(q.price).toBe(1299);
  });

  it("keeps anything it cannot place as a note", () => {
    const q = parseShorthand("atl lhr 450 delta oct3 nonstop");
    expect(q.price).toBe(450);
    expect(q.notes).toEqual(["delta", "oct3", "nonstop"]);
  });

  it("does not treat a small bare number as a fare", () => {
    // "3" is a date, not a $3 flight.
    const q = parseShorthand("atl lhr 3");
    expect(q.price).toBeUndefined();
    expect(q.notes).toEqual(["3"]);
  });

  it("ignores three-letter words that are not airports", () => {
    const q = parseShorthand("atl the 450");
    expect(q.origin).toBe("ATL");
    expect(q.destination).toBeUndefined();
    expect(q.notes).toContain("the");
  });

  it("survives an empty string", () => {
    expect(parseShorthand("   ")).toEqual({ notes: [] });
  });

  it("handles a price typed on its own", () => {
    const q = parseShorthand("450");
    expect(q.price).toBe(450);
  });
});

describe("describePlace", () => {
  it("expands a known code to city + code", () => {
    expect(describePlace("ATL")).toMatch(/\(ATL\)$/);
  });
  it("passes an unknown code through", () => {
    expect(describePlace("ZZZ")).toBe("ZZZ");
  });
  it("returns empty for nothing", () => {
    expect(describePlace(undefined)).toBe("");
  });
});

describe("buildMessage", () => {
  const q = parseShorthand("atl lhr 450");

  it("puts the fare and the lock offer in the quote", () => {
    const m = buildMessage("quote", { ...q, name: "Dana" });
    expect(m).toContain("Hi Dana!");
    expect(m).toContain("$450");
    expect(m).toContain("taxes and fees included");
    expect(m).toMatch(/lock it for \d+ hours/);
  });

  it("works with no name and no fare", () => {
    const m = buildMessage("quote", { notes: [] });
    expect(m.startsWith("Hi!")).toBe(true);
    expect(m).not.toContain("undefined");
    expect(m).not.toContain("NaN");
  });

  it("states the lock is a ceiling, not a promise to charge it", () => {
    const m = buildMessage("lock", q);
    expect(m).toContain("most you'll pay");
  });

  it("has an honest no-fare message that sends them elsewhere", () => {
    const m = buildMessage("noFare", q);
    expect(m).toContain("can't beat");
  });

  it("never leaves a placeholder in any template", () => {
    for (const id of ["quote", "lock", "followUp", "noFare"] as const) {
      const m = buildMessage(id, q);
      expect(m).not.toMatch(/\{\{|\}\}|PLACEHOLDER|TODO/);
    }
  });
});
