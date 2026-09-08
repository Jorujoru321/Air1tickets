import { describe, expect, it } from "vitest";
import { Rng, hashString, shortHash } from "@/lib/flights/mock/rng";

describe("rng", () => {
  it("is deterministic for the same seed", () => {
    const a = new Rng("seed-1");
    const b = new Rng("seed-1");
    const xs = Array.from({ length: 20 }, () => a.float());
    const ys = Array.from({ length: 20 }, () => b.float());
    expect(xs).toEqual(ys);
  });

  it("differs across seeds and stays in range", () => {
    const a = new Rng("a");
    const b = new Rng("b");
    expect(a.float()).not.toBe(b.float());
    for (let i = 0; i < 1000; i++) {
      const n = a.int(3, 7);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(7);
    }
  });

  it("hashes stably", () => {
    expect(hashString("JFK-LAX")).toBe(hashString("JFK-LAX"));
    expect(shortHash("x")).toHaveLength(8);
    expect(/^[a-z0-9]+$/.test(shortHash("hello"))).toBe(true);
  });

  it("jitter is centred near 1", () => {
    const r = new Rng("jitter");
    let sum = 0;
    for (let i = 0; i < 5000; i++) sum += r.jitter(0.1);
    expect(sum / 5000).toBeGreaterThan(0.97);
    expect(sum / 5000).toBeLessThan(1.04);
  });
});
