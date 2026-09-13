import {
  availableTeamPhotos,
  teamPhoto,
  TEAM_PHOTOS,
  type TeamPhotoKey,
} from "@/data/photos";
import { cn } from "@/lib/utils";

/**
 * Real photographs of the agency.
 *
 * Every component here renders nothing when the file has not been added yet,
 * so a page never shows a broken image or an empty frame. Drop the files into
 * public/images/team/ and flip `available` in src/data/photos.ts to turn them
 * on — see that file for the exact names.
 *
 * These are the highest-value images on the site. A stranger is about to send
 * their travel plans to a WhatsApp number; a photo of the actual room that
 * message lands in does more for that decision than any amount of copy.
 */

/** One photo, or null when the file is missing. */
export function TeamShot({
  slot,
  className,
  rounded = "rounded-2xl",
  aspect = "aspect-[4/3]",
  priority = false,
}: {
  slot: TeamPhotoKey;
  className?: string;
  rounded?: string;
  aspect?: string;
  priority?: boolean;
}) {
  const src = teamPhoto(slot);
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={TEAM_PHOTOS[slot].alt}
      className={cn("h-full w-full object-cover", aspect, rounded, className)}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
    />
  );
}

/** True when at least one photo exists, for sections that should hide entirely. */
export function hasTeamPhotos(): boolean {
  return availableTeamPhotos().length > 0;
}

/**
 * Gallery for the about page. The first photo runs wide and the rest tile
 * underneath, so the section reads as a spread rather than a grid of stock.
 */
export function TeamGallery({ className }: { className?: string }) {
  const photos = availableTeamPhotos();
  if (!photos.length) return null;
  const [lead, ...rest] = photos;
  return (
    <div className={cn("space-y-4", className)}>
      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={lead.src}
          alt={lead.alt}
          className="aspect-[16/9] w-full rounded-2xl object-cover shadow-card"
          loading="lazy"
          decoding="async"
        />
        {lead.caption && (
          <figcaption className="mt-2 text-sm text-slate-500">
            {lead.caption}
          </figcaption>
        )}
      </figure>
      {rest.length > 0 && (
        <ul
          className={cn(
            "grid gap-4",
            rest.length >= 3
              ? "sm:grid-cols-3"
              : rest.length === 2
                ? "sm:grid-cols-2"
                : "sm:grid-cols-1",
          )}
        >
          {rest.map((p) => (
            <li key={p.key}>
              <figure>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.src}
                  alt={p.alt}
                  className="aspect-[4/3] w-full rounded-xl object-cover shadow-card"
                  loading="lazy"
                  decoding="async"
                />
                {p.caption && (
                  <figcaption className="mt-2 text-xs leading-relaxed text-slate-500">
                    {p.caption}
                  </figcaption>
                )}
              </figure>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
