import { NextResponse, type NextRequest } from "next/server";

/**
 * Canonical URL hygiene for the programmatic SEO sections: every slug under
 * these prefixes is lowercase, so /airports/JFK or /Destinations/Cancun get a
 * single 308 to the canonical form instead of a duplicate page or a 404.
 */
const LOWERCASE_PREFIXES = ["/cheap-flights", "/flights-to", "/flights-from", "/airlines", "/airports", "/destinations", "/travel-guides", "/legal"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const lower = pathname.toLowerCase();
  if (lower !== pathname && LOWERCASE_PREFIXES.some((p) => lower === p || lower.startsWith(`${p}/`))) {
    const url = req.nextUrl.clone();
    url.pathname = lower;
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest).*)"],
};
