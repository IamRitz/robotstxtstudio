import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

/**
 * Content-Security-Policy.
 *
 * This is a heavily-static, third-party-script-free SEO site that renders inline
 * JSON-LD (`<script type="application/ld+json">`) on nearly every page and emits
 * inline framework + hydration scripts. A nonce-based strict CSP would force every
 * page to read per-request headers, turning the entire static site dynamic — a bad
 * trade for SEO. So we ship a pragmatic policy that locks down framing, base-uri,
 * objects, and origins while allowing inline script/style. The strict-nonce upgrade
 * path is documented in docs/PRODUCTION_READINESS.md.
 *
 * Dev needs 'unsafe-eval' + websocket connections for React Refresh / HMR, so the
 * policy is relaxed only for the dev server (gated on the Next phase, which is the
 * reliable signal — NODE_ENV is not yet "production" when this file is evaluated
 * during `next build`).
 */
/**
 * Analytics vendor origins, added to the CSP only when the corresponding provider is
 * configured (Phase 13B). Keeps the default policy tight: no analytics env → no extra
 * origins allowed.
 */
function analyticsHosts() {
  const posthog = process.env.NEXT_PUBLIC_POSTHOG_KEY
    ? ["https://*.posthog.com", "https://*.i.posthog.com"]
    : [];
  const clarity = process.env.NEXT_PUBLIC_CLARITY_ID
    ? ["https://www.clarity.ms", "https://*.clarity.ms", "https://c.bing.com"]
    : [];
  return {
    script: [...posthog, ...clarity],
    connect: [...posthog, ...clarity],
    img: [...clarity],
  };
}

function contentSecurityPolicy(isDev: boolean): string {
  const vendors = analyticsHosts();
  const scriptSrc = ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : []), ...vendors.script];
  const connectSrc = ["'self'", ...(isDev ? ["ws:", "wss:"] : []), ...vendors.connect];
  const imgSrc = ["'self'", "data:", "blob:", ...vendors.img];

  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src ${imgSrc.join(" ")}`,
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(" ")}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "manifest-src 'self'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

/** Security headers applied to every response. */
function securityHeaders(isDev: boolean) {
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy(isDev) },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=(), payment=(), usb=()",
    },
    { key: "X-DNS-Prefetch-Control", value: "on" },
    // HSTS only takes effect over HTTPS (ignored on local http); 2 years + preload-ready.
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  ];
}

/**
 * Config is a function of the build/runtime phase so the CSP can distinguish the dev
 * server from production builds reliably (see contentSecurityPolicy).
 */
const nextConfig = (phase: string): NextConfig => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  return {
    reactStrictMode: true,
    // Live Checker performs server-side fetches via route handlers,
    // so no client-side rewrites/CORS config is needed here.
    typedRoutes: true,
    // Don't leak the framework version in the response headers.
    poweredByHeader: false,
    async headers() {
      return [{ source: "/:path*", headers: securityHeaders(isDev) }];
    },
  };
};

export default nextConfig;
