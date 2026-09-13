import { asset } from "@/lib/site";

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
  return DESTINATION_PHOTOS.has(slug)
    ? asset(`/images/destinations/${slug}.jpg`)
    : null;
}

/**
 * Photography for the travel guides.
 *
 * Same arrangement as destinations: files live in
 * `public/images/articles/<slug>.jpg` and are listed here by slug. Anything
 * not listed falls back to the generated scene, so a guide never shows a
 * broken image.
 *
 * Populate with `node scripts/fetch-article-photos.mjs` on a machine with
 * internet access — the deploy workflow runs it on every build.
 */
export const ARTICLE_PHOTOS: ReadonlySet<string> = new Set<string>([
  // none yet — run scripts/fetch-article-photos.mjs
]);

/** Photo URL for a travel guide, or null to fall back to generated art. */
export function articlePhoto(slug: string): string | null {
  return ARTICLE_PHOTOS.has(slug)
    ? asset(`/images/articles/${slug}.jpg`)
    : null;
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
 * Photographs of the agency and the people in it.
 *
 * Drop the files in `public/images/team/` using exactly these names and set the
 * matching flag to true. Anything left false simply does not render, so the
 * pages stay correct while photos are still missing.
 *
 * Use only photographs you own, of people who agreed to appear on a public
 * website. Real, slightly imperfect photos of your actual office beat stock
 * imagery — that authenticity is the whole point of putting them up.
 */
export interface TeamPhoto {
  /** File under public/images/team/. */
  file: string;
  /** Alt text. Describe what is happening, not "team photo". */
  alt: string;
  /** Caption shown under the image on the about page. */
  caption?: string;
  available: boolean;
}

export const TEAM_PHOTOS = {
  /** Wide shot of the office floor with agents working. */
  office: {
    file: "office.jpg",
    alt: "Air1 Tickets agents working at their desks in the office",
    caption:
      "Our office. Every quote you get is worked by someone in this room.",
    available: false,
  },
  /** An agent going through an itinerary with a customer, passports on the desk. */
  consultation: {
    file: "consultation.jpg",
    alt: "An Air1 Tickets agent going through an itinerary with a customer",
    caption:
      "Going through an itinerary in person. Most of it now happens on WhatsApp.",
    available: false,
  },
  /** Agents on headsets handling calls and messages. */
  support: {
    file: "support.jpg",
    alt: "Air1 Tickets agents handling calls and messages on headsets",
    caption: "When you message us, this is who picks it up.",
    available: false,
  },
  /** The whole team together. */
  group: {
    file: "group.jpg",
    alt: "The Air1 Tickets team together in the office",
    caption: "The team.",
    available: false,
  },
  /** A single agent portrait. */
  portrait: {
    file: "portrait.jpg",
    alt: "An Air1 Tickets travel agent",
    caption: undefined,
    available: false,
  },
} satisfies Record<string, TeamPhoto>;

export type TeamPhotoKey = keyof typeof TEAM_PHOTOS;

/** URL for a team photo, or null when the file has not been added yet. */
export function teamPhoto(key: TeamPhotoKey): string | null {
  const p = TEAM_PHOTOS[key];
  return p.available ? asset(`/images/team/${p.file}`) : null;
}

/** Every photo that actually exists, for galleries. */
export function availableTeamPhotos(): (TeamPhoto & {
  key: TeamPhotoKey;
  src: string;
})[] {
  return (Object.keys(TEAM_PHOTOS) as TeamPhotoKey[])
    .filter((k) => TEAM_PHOTOS[k].available)
    .map((k) => ({
      ...TEAM_PHOTOS[k],
      key: k,
      src: asset(`/images/team/${TEAM_PHOTOS[k].file}`),
    }));
}

export const HERO_MEDIA: Record<
  "home" | "hotels" | "activities",
  HeroMediaSource
> = {
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
