import { describe, expect, it } from "vitest";
import { asset } from "@/lib/site";
import { teamPhoto, TEAM_PHOTOS, availableTeamPhotos } from "@/data/photos";

/**
 * Raw <img src="/…"> tags do not get Next's basePath applied, so every public
 * asset URL goes through asset(). On a project-pages deploy (basePath
 * /Air1tickets) a missed one is a broken image on every page.
 */
describe("asset()", () => {
  it("leaves paths alone when there is no base path", () => {
    // The test env sets no NEXT_PUBLIC_BASE_PATH, which is the real-domain case.
    expect(asset("/partners/expedia.svg")).toBe("/partners/expedia.svg");
  });

  it("normalises a missing leading slash", () => {
    expect(asset("partners/expedia.svg")).toBe("/partners/expedia.svg");
  });

  it("passes absolute and data URLs through untouched", () => {
    expect(asset("https://cdn.example.com/a.png")).toBe(
      "https://cdn.example.com/a.png",
    );
    expect(asset("//cdn.example.com/a.png")).toBe("//cdn.example.com/a.png");
    expect(asset("data:image/svg+xml,<svg/>")).toBe(
      "data:image/svg+xml,<svg/>",
    );
  });
});

describe("team photos", () => {
  it("returns null for slots whose file has not been added", () => {
    for (const [key, photo] of Object.entries(TEAM_PHOTOS)) {
      if (!photo.available)
        expect(teamPhoto(key as keyof typeof TEAM_PHOTOS)).toBeNull();
    }
  });

  it("only lists slots marked available", () => {
    const listed = availableTeamPhotos().map((p) => p.key);
    const expected = Object.entries(TEAM_PHOTOS)
      .filter(([, p]) => p.available)
      .map(([k]) => k);
    expect(listed.sort()).toEqual(expected.sort());
  });

  it("gives every slot alt text that describes the scene", () => {
    for (const photo of Object.values(TEAM_PHOTOS)) {
      expect(photo.alt.length).toBeGreaterThan(10);
      expect(photo.alt.toLowerCase()).not.toBe("team photo");
    }
  });
});
