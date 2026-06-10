# Production Readiness — Phase 13A

> Hardening audit + implemented changes for deployment. Companion:
> [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md) (Phase 11 product audit),
> [`SEO_AUDIT.md`](./SEO_AUDIT.md), [`PRD.md`](./PRD.md). Analytics/observability are
> Phase 13B (`docs/ANALYTICS.md`, pending).

## Verdict

**Live in production at [robotstxtstudio.com](https://robotstxtstudio.com)** (Vercel,
DNS via Cloudflare). Verified live: HTTP/2 200, strict production CSP + HSTS +
X-Frame-Options + nosniff + Referrer-Policy headers, `robots.txt` and the 53-URL
`sitemap.xml` emitting the production origin, canonical tags + dynamic OG images, and
the dynamic `/crawlers/[id]` routes returning 200. `NEXT_PUBLIC_SITE_URL` is set in
Vercel. Remaining items are optional/operational (rate limiting, full manual smoke +
Lighthouse, consent posture).

---

## What shipped in 13A

| # | Item | Where |
| --- | --- | --- |
| 1 | Environment validation (fail-fast on bad `NEXT_PUBLIC_SITE_URL`) | `src/lib/env.ts`; consumed by `src/lib/seo.ts` |
| 2 | Security headers on every response | `next.config.ts` `headers()` |
| 3 | Production CSP (strict) + dev CSP (HMR-friendly), phase-gated | `next.config.ts` `contentSecurityPolicy()` |
| 4 | `poweredByHeader: false` (no `X-Powered-By`) | `next.config.ts` |
| 5 | Custom 404 page | `src/app/not-found.tsx` |
| 6 | Segment error boundary (retry + home) | `src/app/error.tsx` |
| 7 | Root/global error fallback (self-contained `<html>`) | `src/app/global-error.tsx` |
| 8 | Route-level loading skeleton for the dynamic Analyzer | `src/app/analyze/loading.tsx` |
| 9 | API route last-resort `try/catch` → JSON 500 | `src/app/api/analyze`, `src/app/api/fetch-robots` |

---

## Security checklist

| Control | Status | Notes |
| --- | --- | --- |
| `Content-Security-Policy` | ✅ | Strict in prod (no `unsafe-eval`, `connect-src 'self'`, `upgrade-insecure-requests`). Inline `script`/`style` allowed — see CSP note below. |
| `X-Frame-Options: DENY` + `frame-ancestors 'none'` | ✅ | Clickjacking protection (no embedding need). |
| `X-Content-Type-Options: nosniff` | ✅ | MIME-sniffing protection. |
| `Referrer-Policy: strict-origin-when-cross-origin` | ✅ | Leaks only origin cross-site. |
| `Permissions-Policy` | ✅ | Denies camera/mic/geo/USB/payment/topics/cohort. |
| `Strict-Transport-Security` | ✅ | `max-age=63072000; includeSubDomains; preload`. HTTPS-only effect. |
| `X-Powered-By` removed | ✅ | `poweredByHeader: false`. |
| No secrets in the bundle | ✅ | App needs no secrets; only public `NEXT_PUBLIC_SITE_URL`. |
| Input validation on API | ✅ | Zod `analyzeRequestSchema` on both route handlers (400 on bad input). |
| Server-side fetch hardening | ✅ | 8 s timeout, 512 KiB cap, content-type checks (Analyzer fetch boundary). |
| Error responses are JSON | ✅ | `try/catch` → 500 JSON; never an unhandled HTML 500 from the API. |
| Rate limiting on `/api/*` | ⬜ | **Recommended before heavy promotion** — see Risks. |
| SSRF consideration | 🟡 | Endpoints fetch user-supplied domains to read public `/robots.txt` only; capped + timed. Acceptable for the use case; revisit if internal network exposure ever applies. |

### CSP note (the one deliberate trade-off)

The policy allows `script-src 'unsafe-inline'` and `style-src 'unsafe-inline'`. This is
intentional: the site renders inline JSON-LD on ~70 static pages and emits inline
framework/hydration scripts, and Tailwind injects inline styles. A **nonce-based
strict CSP** is the stronger alternative, but in the App Router a nonce must be read
per-request, which would turn every currently-static page **dynamic** — a poor trade
for an SEO-first static site.

**Upgrade path (when justified):** add `middleware.ts` that generates a per-request
nonce, sets `Content-Security-Policy` with `'nonce-…'`, and passes an `x-nonce`
request header; thread the nonce into the `JsonLd` component (`next/headers`).
Accept that affected routes become dynamic, or scope the nonce middleware to only the
few routes that need it. Tracked here; not a launch blocker.

---

## Deployment checklist (Vercel)

| Step | Status | Notes |
| --- | --- | --- |
| `next build` passes | ✅ | 76 routes; static where possible, `/analyze` + `/api/*` dynamic. |
| Vercel project + Node | ✅ | Deployed on Vercel (served by `server: Vercel`, `x-vercel-cache` HIT). |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Set in Vercel; verified live — `robots.txt` Host + canonicals emit `https://robotstxtstudio.com`. |
| Route-handler runtime | ✅ | `runtime = "nodejs"` on both API routes (need server fetch; not edge). |
| Custom domain + HTTPS + HSTS | ✅ | Live at `robotstxtstudio.com` (Cloudflare DNS); HTTPS + HSTS header verified in production. HSTS is `preload`-ready — submit to the preload list when ready. |
| `robots.ts` / `sitemap.ts` host | ✅ | Verified live: `robots.txt` Host + the 53-URL `sitemap.xml` emit the production origin. |
| Security headers live | ✅ | Verified in production: CSP (strict)/XFO/nosniff/Referrer/HSTS present; no `X-Powered-By`. |
| Error pages | ✅ | 404 returns the custom page; error boundaries verified to compile + render. |
| Rate limiting | ⬜ | Optional; recommended before heavy promotion (Vercel WAF / KV token bucket). |
| Production smoke test | 🟡 | Verified live via HTTP: routes/headers/sitemap/canonical/OG/dynamic routes. Remaining manual: analyze a real domain, generate + download, run Lighthouse. |
| Analytics | ✅ | Implemented (13B). Set `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_CLARITY_ID` in Vercel to enable; CSP auto-allows vendor origins. |

---

## Loading-state audit

| Surface | Handling | Status |
| --- | --- | --- |
| `/analyze` (dynamic, reads `domain`) | Route-level `loading.tsx` skeleton on navigation | ✅ added |
| Analyzer live fetch (post-submit) | In-screen skeleton gauge + shimmer rows | ✅ existing |
| Validator / Tester / Explainer fetch-from-URL | In-screen spinner/disabled state; instant for pasted text | ✅ existing |
| Generator / AI Manager | Synchronous/local — no async loading needed | ✅ n/a |
| Static content pages (guides, crawlers, trust) | Prerendered; no loading state required | ✅ n/a |

Shared primitives: `LoadingState`, `LoadingCard` (`src/components/loading-state.tsx`),
`Skeleton` (`src/components/ui/skeleton.tsx`). No unhandled async surface ships
without a loading affordance.

---

## Risk assessment

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Abuse of `/api/analyze` + `/api/fetch-robots` (they fetch arbitrary domains) | Medium | Medium | Already timed (8 s) + size-capped (512 KiB) + input-validated. **Add rate limiting** before promotion. |
| Misconfigured `NEXT_PUBLIC_SITE_URL` → broken canonicals/sitemap | Low | High (SEO) | `env.ts` **fails the production build** on an invalid URL; falls back to the known default if unset. |
| CSP `unsafe-inline` weakens XSS defense | Low | Medium | No third-party scripts, no user-generated HTML rendered; other XSS vectors closed. Nonce upgrade path documented above. |
| Inline-script CSP breakage on a future feature | Low | Medium | Any new inline script must be covered by the policy (or the nonce upgrade); e2e runs against the prod CSP and would catch a break. |
| HSTS `preload` locks the domain into HTTPS | Low | Medium | Don't submit to the preload list until the production domain + HTTPS are final. |
| Error digests leak nothing useful for debugging | Low | Low | `error.tsx`/`global-error.tsx` surface the Next `digest`; full errors go to the console/sink (wired in 13B). |

---

## Remaining blockers & follow-ups

**Hard blockers for a public launch:** none in code.

**Operational (do at/around deploy):**
1. Create the Vercel project, set Node 20+ and `NEXT_PUBLIC_SITE_URL`.
2. Finalize the domain; enable HTTPS; only then consider HSTS preload submission.
3. Run the production smoke test (above).

**Recommended soon after launch:**
4. Rate limiting on the two fetch endpoints.
5. Analytics (Phase 13B ✅ implemented): set `NEXT_PUBLIC_POSTHOG_KEY` /
   `NEXT_PUBLIC_CLARITY_ID` in prod to enable; the CSP auto-allows the vendor origins.
   Decide whether a **cookie/consent banner** is required for your jurisdiction —
   PostHog uses `localStorage` (no server cookies) and Clarity masks text, but consent
   law may still apply. See [`ANALYTICS.md`](./ANALYTICS.md) / [`METRICS.md`](./METRICS.md).

**Optional polish (non-blocking, from `LAUNCH_CHECKLIST.md`):**
6. Editor line-number gutter; `apple-icon`/maskable PWA icons; final logo/wordmark.
