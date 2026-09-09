/**
 * Simple in-memory sliding-window rate limiter for route handlers.
 *
 * Good enough for a single Node process (and for keeping bots off the auth
 * and lookup endpoints in development). For multi-instance production deploys
 * swap the store for Redis / Upstash so limits are shared across instances.
 */
const buckets = new Map<string, number[]>();

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export function rateLimit(key: string, { limit, windowMs }: RateLimitOptions): { ok: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    const retryAfterSec = Math.ceil((windowMs - (now - hits[0])) / 1000);
    buckets.set(key, hits);
    return { ok: false, remaining: 0, retryAfterSec };
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  }
  return { ok: true, remaining: limit - hits.length, retryAfterSec: 0 };
}

/** Best-effort client IP from proxy headers. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function tooMany(retryAfterSec: number): Response {
  return new Response(JSON.stringify({ error: "Too many attempts. Please wait a few minutes and try again." }), {
    status: 429,
    headers: { "Content-Type": "application/json", "Retry-After": String(retryAfterSec) },
  });
}
