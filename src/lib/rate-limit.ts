/**
 * Lightweight in-memory, per-IP rate limiter (Phase 15D).
 *
 * Deliberately dependency-free and suitable for Vercel's serverless model. Two
 * important caveats are by design:
 *
 *  1. **Per-instance, best-effort.** State lives in this module's memory, so each
 *     warm serverless instance keeps its own counters. Under horizontal scale the
 *     effective limit is `LIMIT × instances`. This is abuse-dampening, not a hard
 *     quota — good enough to stop a single client hammering the fetch endpoints
 *     without standing up Redis/Upstash. Swap in a shared store later if needed.
 *  2. **Fixed window.** Simple and transparent (vs. sliding/token-bucket): each IP
 *     gets `LIMIT` requests per `WINDOW_MS`; the window resets on first hit after it
 *     expires. A burst at a window boundary can briefly allow up to ~2×LIMIT, which
 *     is acceptable for this threat model.
 *
 * Stale entries are swept lazily on access, so memory stays bounded without timers
 * (timers are unreliable across serverless freezes anyway).
 */

/** Requests allowed per IP per window. */
export const RATE_LIMIT = 20;
/** Window length in milliseconds. */
export const RATE_WINDOW_MS = 60_000;

interface Bucket {
  count: number;
  /** Epoch ms when the current window resets. */
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  readonly allowed: boolean;
  /** Requests remaining in the current window (0 when blocked). */
  readonly remaining: number;
  /** Seconds until the window resets — surfaced as `Retry-After`. */
  readonly retryAfterSeconds: number;
  /** Epoch ms when the window resets. */
  readonly resetAt: number;
}

/**
 * Record a hit for `key` (typically a client IP) and report whether it is allowed.
 * Pure aside from the in-memory map; `now`/`limit`/`windowMs` are injectable so the
 * behavior is fully testable without wall-clock dependence.
 */
export function rateLimit(
  key: string,
  options: { now?: number; limit?: number; windowMs?: number } = {},
): RateLimitResult {
  const now = options.now ?? Date.now();
  const limit = options.limit ?? RATE_LIMIT;
  const windowMs = options.windowMs ?? RATE_WINDOW_MS;

  // Opportunistic sweep so the map can't grow without bound.
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) {
      if (v.resetAt <= now) buckets.delete(k);
    }
  }

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    const bucket: Bucket = { count: 1, resetAt: now + windowMs };
    buckets.set(key, bucket);
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0, resetAt: bucket.resetAt };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  const allowed = existing.count <= limit;
  return {
    allowed,
    remaining,
    retryAfterSeconds: allowed ? 0 : Math.ceil((existing.resetAt - now) / 1000),
    resetAt: existing.resetAt,
  };
}

/** Test helper: clear all rate-limit state. */
export function resetRateLimits(): void {
  buckets.clear();
}

/**
 * Best-effort client IP from a request. Vercel/most proxies set `x-forwarded-for`
 * (client is the first entry); fall back to `x-real-ip`, then a constant so a
 * missing header funnels all such traffic into one shared bucket (fail-closed-ish)
 * rather than bypassing the limiter.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
