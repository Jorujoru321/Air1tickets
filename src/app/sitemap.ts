import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { AIRPORTS } from "@/data/airports";
import { AIRLINES } from "@/data/airlines";
import { DESTINATIONS } from "@/data/destinations";
import { ALL_DIRECTIONAL_ROUTES } from "@/data/routes";
import { ARTICLES } from "@/content/articles";
import { airlinePath, airportPath, articlePath, citySlug, destinationPath, routeSlug } from "@/lib/seo/slugs";

const STATIC: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/flights", priority: 0.9, changeFrequency: "daily" },
  { path: "/hotels", priority: 0.9, changeFrequency: "weekly" },
  { path: "/activities", priority: 0.85, changeFrequency: "weekly" },
  { path: "/deals", priority: 0.9, changeFrequency: "daily" },
  { path: "/price-lock", priority: 0.8, changeFrequency: "monthly" },
  { path: "/cheap-flights", priority: 0.9, changeFrequency: "weekly" },
  { path: "/destinations", priority: 0.8, changeFrequency: "weekly" },
  { path: "/flights-to", priority: 0.7, changeFrequency: "weekly" },
  { path: "/flights-from", priority: 0.7, changeFrequency: "weekly" },
  { path: "/airlines", priority: 0.7, changeFrequency: "monthly" },
  { path: "/airports", priority: 0.7, changeFrequency: "monthly" },
  { path: "/travel-guides", priority: 0.8, changeFrequency: "weekly" },
  { path: "/help", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
  { path: "/booking", priority: 0.4, changeFrequency: "monthly" },
  { path: "/price-alerts", priority: 0.5, changeFrequency: "monthly" },
  { path: "/legal/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/legal/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/legal/cookies", priority: 0.2, changeFrequency: "yearly" },
  { path: "/legal/accessibility", priority: 0.2, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const url = (p: string) => absoluteUrl(p);
  const entries: MetadataRoute.Sitemap = STATIC.map((s) => ({ url: url(s.path), lastModified: now, changeFrequency: s.changeFrequency, priority: s.priority }));

  const seenRoutes = new Set<string>();
  for (const r of ALL_DIRECTIONAL_ROUTES) {
    const slug = routeSlug(r.origin, r.destination);
    if (!slug || seenRoutes.has(slug)) continue;
    seenRoutes.add(slug);
    entries.push({ url: url(`/cheap-flights/${slug}`), lastModified: now, changeFrequency: "daily", priority: r.popular ? 0.8 : 0.7 });
  }

  for (const d of DESTINATIONS) {
    entries.push({ url: url(destinationPath(d.slug)), lastModified: now, changeFrequency: "weekly", priority: d.popular ? 0.8 : 0.7 });
  }

  const cities = new Set<string>();
  for (const a of AIRPORTS) {
    const c = citySlug(a);
    if (cities.has(c)) continue;
    cities.add(c);
    entries.push({ url: url(`/flights-to/${c}`), lastModified: now, changeFrequency: "weekly", priority: a.size >= 4 ? 0.7 : 0.5 });
    if (["US", "PR", "VI", "GU"].includes(a.countryCode) && a.size >= 3) {
      entries.push({ url: url(`/flights-from/${c}`), lastModified: now, changeFrequency: "weekly", priority: a.size >= 4 ? 0.7 : 0.5 });
    }
  }

  for (const a of AIRPORTS) entries.push({ url: url(airportPath(a)), lastModified: now, changeFrequency: "monthly", priority: 0.5 });
  for (const al of AIRLINES) entries.push({ url: url(airlinePath(al.slug)), lastModified: now, changeFrequency: "monthly", priority: 0.6 });
  for (const art of ARTICLES) entries.push({ url: url(articlePath(art.slug)), lastModified: new Date(art.updatedAt), changeFrequency: "monthly", priority: 0.6 });

  return entries;
}
