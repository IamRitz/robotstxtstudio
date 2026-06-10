/**
 * Runtime environment validation (Phase 13A).
 *
 * The app needs no secrets to run; the only configurable value today is the public
 * site URL (used for canonicals, sitemap, OG, and JSON-LD). We validate it at module
 * load so a malformed deploy-time value fails fast in production rather than silently
 * emitting broken absolute URLs. Kept dependency-free (no zod) so it's safe to import
 * from anywhere, including the client bundle, with negligible weight.
 */

/** Fallback when no NEXT_PUBLIC_SITE_URL is configured (e.g. local dev / preview). */
const DEFAULT_SITE_URL = "https://robots-txt-studio.vercel.app";

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
  /** Canonical site origin, e.g. https://robots-txt-studio.vercel.app. */
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
