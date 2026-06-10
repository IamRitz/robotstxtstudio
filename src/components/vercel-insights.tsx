import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { vercelInsights } from "@/lib/env";

/**
 * Vercel infrastructure providers — Web Analytics (aggregate traffic) and Speed
 * Insights (Core Web Vitals / RUM).
 *
 * Deliberately kept OUTSIDE the vendor-neutral event layer in `@/lib/analytics`
 * (PostHog/Clarity). That layer is an *event* abstraction — providers implement
 * `init`/`capture`/`pageview` and fan out the typed `track*` calls. These Vercel
 * components emit no such events: they auto-collect page views and Web Vitals from
 * browser Performance APIs and beacon them to Vercel's first-party `/_vercel/*`
 * endpoints. Forcing them through the `AnalyticsProvider` contract would be a
 * category error, so they live here as a separate infrastructure provider, gated by
 * env (see `vercelInsights` in `@/lib/env` and docs/ANALYTICS.md).
 *
 * No CSP change is required: both load first-party from `/_vercel/*`, already covered
 * by `script-src 'self'` / `connect-src 'self'` (Phase 13A). Both are inert outside a
 * production Vercel deployment, so this renders nothing harmful locally.
 */
export function VercelInsights() {
  return (
    <>
      {vercelInsights.webAnalytics ? <Analytics /> : null}
      {vercelInsights.speedInsights ? <SpeedInsights /> : null}
    </>
  );
}
