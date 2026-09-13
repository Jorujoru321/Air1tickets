/**
 * Real photography.
 *
 * Files live in `public/images/destinations/<slug>.jpg` and are listed here by
 * slug. Anything not listed falls back to the generated scene in
 * `DestinationArt`, so the site never shows a broken image.
 *
 * To populate this automatically, run `node scripts/fetch-photos.mjs` on a
 * machine with internet access: it downloads openly-licensed photos for every
 * destination, writes them into public/images/destinations/, records the
 * photographer and licence in public/images/destinations/CREDITS.json, and
 * rewrites the list below.
 *
 * Only add photos you have the right to use. Keep the credits file in sync —
 * most open licences require attribution.
 */
export const DESTINATION_PHOTOS: ReadonlySet<string> = new Set<string>([
  // "new-york", "los-angeles", "cancun", …
]);

/** Photo URL for a destination, or null to fall back to generated art. */
export function destinationPhoto(slug: string): string | null {
  return DESTINATION_PHOTOS.has(slug) ? `/images/destinations/${slug}.jpg` : null;
}

/**
 * Hero media for the home page and the hotels / activities pages.
 * Set a value once the corresponding file exists in `public/`.
 *   video: a short, muted, looping clip (MP4, H.264, ideally under 4 MB)
 *   image: the poster frame, and the fallback for reduced-motion and mobile
 */
export interface HeroMediaSource {
  video?: string;
  image?: string;
}

/**
 * A photograph of the founder or the team for the about page.
 *
 * Take this one yourself — a phone photo of a real person outperforms any
 * stock image or generated portrait, and a generated "team" that does not
 * exist is a lie a customer can catch. Until a file is set, the page shows
 * initials rather than a stranger's face.
 */
export const TEAM_PHOTO: string | null = null; // e.g. "/images/team/founder.jpg"

export const HERO_MEDIA: Record<"home" | "hotels" | "activities", HeroMediaSource> = {
  home: {
    // video: "/video/hero.mp4",
    // image: "/images/hero/home.jpg",
  },
  hotels: {
    // image: "/images/hero/hotels.jpg",
  },
  activities: {
    // image: "/images/hero/activities.jpg",
  },
};
