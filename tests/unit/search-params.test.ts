import { describe, expect, it } from "vitest";
import { buildSearchUrl, parseSearchQuery, safeParseSearchQuery } from "@/lib/flights/search-params";

describe("search params", () => {
  it("parses and normalises a valid query", () => {
    const p = parseSearchQuery({ from: "jfk", to: "LAX", depart: "2026-10-12", return: "2026-10-19", adults: "2", children: "1", cabin: "business" });
    expect(p.origin).toBe("JFK");
    expect(p.destination).toBe("LAX");
    expect(p.returnDate).toBe("2026-10-19");
    expect(p.passengers).toEqual({ adults: 2, children: 1, infants: 0 });
    expect(p.cabin).toBe("business");
    expect(p.directOnly).toBeUndefined();
  });

  it("round-trips through buildSearchUrl", () => {
    const p = parseSearchQuery({ from: "SEA", to: "HNL", depart: "2026-11-02", adults: "1", direct: "1", cabin: "premium_economy" });
    const url = buildSearchUrl(p);
    expect(url).toBe("/flights/search?from=SEA&to=HNL&depart=2026-11-02&adults=1&cabin=premium_economy&direct=1");
    const q = Object.fromEntries(new URL(`http://x${url}`).searchParams);
    expect(parseSearchQuery(q)).toEqual(p);
  });

  it("rejects bad input with helpful messages", () => {
    expect(safeParseSearchQuery({ from: "JFK", to: "JFK", depart: "2026-10-12" })).toMatchObject({ ok: false });
    expect(safeParseSearchQuery({ from: "JFK", to: "LAX", depart: "2026-10-12", return: "2026-10-01" })).toMatchObject({ ok: false, error: expect.stringContaining("Return date") });
    expect(safeParseSearchQuery({ from: "JFK", to: "LAX", depart: "2026-10-12", adults: "1", infants: "2" })).toMatchObject({ ok: false, error: expect.stringContaining("infant") });
    expect(safeParseSearchQuery({ from: "JF", to: "LAX", depart: "2026-10-12" })).toMatchObject({ ok: false });
  });

  it("falls back to economy for unknown cabins and clamps passenger counts", () => {
    const p = parseSearchQuery({ from: "JFK", to: "LAX", depart: "2026-10-12", cabin: "ultra", adults: "40" });
    expect(p.cabin).toBe("economy");
    expect(p.passengers.adults).toBe(9);
  });
});
