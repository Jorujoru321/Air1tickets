import { DestinationArt } from "@/components/marketing/DestinationArt";
import { HERO_MEDIA } from "@/data/photos";
import type { HeroTheme } from "@/data/types";
import { asset } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * The layer behind a hero search form. Prefers a looping video, then a
 * photograph, then generated scenery, so the page looks finished whether or
 * not real assets have been added yet.
 *
 * The video is muted, looping and inert (`playsInline`, no controls), which is
 * what browsers require to autoplay. Its poster is the still image, so the
 * first paint is never blank, and `prefers-reduced-motion` users get the still
 * instead of the clip.
 */
export function HeroMedia({
  slot,
  theme = "city",
  gradient = ["#071229", "#1a75d8"],
  seed,
  /** Darkening over the media so white text stays readable. */
  overlay = "bg-gradient-to-b from-navy-950/80 via-navy-950/55 to-navy-950/80",
  className,
}: {
  slot: keyof typeof HERO_MEDIA;
  theme?: HeroTheme;
  gradient?: [string, string];
  seed: string;
  overlay?: string;
  className?: string;
}) {
  const raw = HERO_MEDIA[slot];
  const video = raw.video ? asset(raw.video) : undefined;
  const image = raw.image ? asset(raw.image) : undefined;
  return (
    <div
      className={cn("absolute inset-0 -z-10 overflow-hidden", className)}
      aria-hidden
    >
      {video ? (
        <video
          className="h-full w-full object-cover motion-reduce:hidden"
          autoPlay
          muted
          loop
          playsInline
          poster={image}
          preload="metadata"
        >
          <source src={video} type="video/mp4" />
        </video>
      ) : null}
      {/* Shown when there is no video, and to anyone who asked for less motion. */}
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className={cn(
            "h-full w-full object-cover",
            video && "hidden motion-reduce:block",
          )}
          loading="eager"
          decoding="sync"
          fetchPriority="high"
        />
      ) : !video ? (
        <DestinationArt
          theme={theme}
          gradient={gradient}
          seed={seed}
          priority
          className="h-full w-full"
        />
      ) : null}
      <div className={cn("absolute inset-0", overlay)} />
    </div>
  );
}
