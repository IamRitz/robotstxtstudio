/**
 * Runtime environment validation (Phase 13A).
 *
 * The app needs no secrets to run; the only configurable value today is the public
 * site URL (used for canonicals, sitemap, OG, and JSON-LD). We validate it at module
 * load so a malformed deploy-time value fails fast in production rather than silently
 * emitting broken absolute URLs. Kept dependency-free (no zod) so it's safe to import
 * from anywhere, including the client bundle, with negligible weight.
 */

/**
 * Canonical production origin. Used as the fallback when NEXT_PUBLIC_SITE_URL is not
 * set (local dev / preview). Production (Vercel) sets NEXT_PUBLIC_SITE_URL explicitly,
 * but this default matches the live domain so local builds and previews are correct too.
 */
const DEFAULT_SITE_URL = "https://robotstxtstudio.com";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

function readSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return DEFAULT_SITE_URL;
  try {
    // Normalize to origin (no trailing path/slash) so callers can append paths.
    return new URL(raw).origin;
  } catch {
    const message = `Invalid NEXT_PUBLIC_SITE_URL: "${raw}". Expected an absolute URL like https://example.com.`;
    // Fail fast in production; tolerate in dev/preview so local work isn't blocked.
    if (IS_PRODUCTION) throw new Error(message);
    console.warn(`[env] ${message} Falling back to ${DEFAULT_SITE_URL}.`);
    return DEFAULT_SITE_URL;
  }
}

/** Validated public configuration. */
export const env = {
  /** Canonical site origin, e.g. https://robotstxtstudio.com. */
  SITE_URL: readSiteUrl(),
  IS_PRODUCTION,
} as const;

/** Canonical site origin (convenience re-export). */
export const SITE_URL = env.SITE_URL;

/**
 * Analytics configuration (Phase 13B). All optional and public (NEXT_PUBLIC_*). When a
 * provider's key is absent, that provider does not load and sends nothing — analytics
 * is opt-in by configuration, so the default (and all local dev) is zero tracking.
 */
export const analyticsConfig = {
  posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() || undefined,
  posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com",
  clarityId: process.env.NEXT_PUBLIC_CLARITY_ID?.trim() || undefined,
} as const;

/** True when at least one analytics provider is configured. */
export const analyticsEnabled = Boolean(analyticsConfig.posthogKey || analyticsConfig.clarityId);

/**
 * Parse a boolean feature flag from an env var. Unset/empty → `fallback`; otherwise
 * any of `0/false/off/no` (case-insensitive) is false, everything else is true.
 */
function flag(raw: string | undefined, fallback: boolean): boolean {
  const v = raw?.trim().toLowerCase();
  if (!v) return fallback;
  return !(v === "0" || v === "false" || v === "off" || v === "no");
}

/**
 * Vercel infrastructure providers (Phase 14 launch-readiness) — Web Analytics and
 * Speed Insights. These are NOT part of the vendor-neutral event layer (see
 * docs/ANALYTICS.md "Performance & infrastructure providers"): they auto-collect
 * aggregate traffic / Core Web Vitals and have no typed-event surface.
 *
 * They are keyless and *inert by construction* — the `@vercel/*` components only
 * transmit in a production deployment on Vercel (the `/_vercel/*` endpoints exist
 * only there) and respect the dashboard "Enable" toggle. So unlike the keyed
 * PostHog/Clarity providers (opt-in to guarantee zero tracking anywhere), these
 * default ON and are gated by an explicit opt-out flag for clean local/preview
 * disable without touching the dashboard.
 */
export const vercelInsights = {
  webAnalytics: flag(process.env.NEXT_PUBLIC_VERCEL_ANALYTICS, true),
  speedInsights: flag(process.env.NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS, true),
} as const;
