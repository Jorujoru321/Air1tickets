import type { Metadata } from "next";
import { site, absoluteUrl } from "@/lib/site";

export interface PageMeta {
  title: string;
  description: string;
  /** Path starting with "/" — becomes the canonical URL. */
  path: string;
  /** Absolute or site-relative image URL. Defaults to the dynamic OG image. */
  image?: string;
  noIndex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
  /** Skip appending " | Air1 Tickets". */
  rawTitle?: boolean;
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 40))}…`;
}

/** Build consistent Next.js metadata: canonical, Open Graph, Twitter, robots. */
export function buildMetadata(meta: PageMeta): Metadata {
  const title = meta.rawTitle ? meta.title : `${meta.title} | ${site.name}`;
  const description = truncate(meta.description, 158);
  const url = absoluteUrl(meta.path);
  const image = meta.image ? absoluteUrl(meta.image) : absoluteUrl(`/opengraph-image?title=${encodeURIComponent(meta.title)}`);
  return {
    title,
    description,
    keywords: meta.keywords,
    alternates: { canonical: url },
    robots: meta.noIndex ? { index: false, follow: false } : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    openGraph: {
      type: meta.type ?? "website",
      url,
      title,
      description,
      siteName: site.name,
      locale: site.locale,
      images: [{ url: image, width: 1200, height: 630, alt: meta.title }],
      ...(meta.type === "article" ? { publishedTime: meta.publishedTime, modifiedTime: meta.modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      site: site.twitterHandle,
      title,
      description,
      images: [image],
    },
  };
}
