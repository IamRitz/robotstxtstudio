# Launch Readiness Checklist

> Phase 11 audit. Status legend: ✅ done · 🟡 partial / placeholder · ⬜ todo (owner).
> Companion: [`PRD.md`](./PRD.md), [`SPRINTS.md`](./SPRINTS.md),
> [`UI_INTEGRATION.md`](./UI_INTEGRATION.md).

## Verdict

**No launch blockers in product functionality.** The seven screens work end-to-end,
the fetch-from-URL workflow is wired, error states are friendly + accessible, and the
build/test gates are green. Remaining items are SEO assets (Phase 12), legal/monitoring
placeholders, and deploy config (Phase 13).

---

## Product

- ✅ Core features verified — 6 e2e journeys (Analyze, Generator, AI Manager, Validator,
  URL Tester, Explainer) + smoke + error states; **12/12 e2e pass**, **208/208 unit**.
- ✅ Responsive verified — desktop/tablet/mobile (single column + bottom tab bar);
  screenshots in `docs/screenshots/`.
- ✅ Accessibility verified — labelled controls, `role=switch/tab/alert/status`,
  `aria-current`, visible focus rings, gauges expose numeric score as text.
- 🟡 Editor polish — Validator/Tester/Explainer use a mono textarea (no line-number
  gutter / inline highlight). Functional; cosmetic gap.
- 🟡 "Export report" / "Recent activity" — placeholders (no persistence yet).

## SEO

- ✅ Metadata — title template + description in root layout; per-screen titles/descriptions.
- ✅ Open Graph — `openGraph` (type/site/url/title/description) in root metadata.
- ✅ Twitter cards — `summary_large_image`.
- ✅ Canonical URLs — `alternates.canonical` (root); per-page canonicals to add with SEO pages.
- ⬜ `app/sitemap.ts` — generate sitemap (Phase 12).
- ⬜ `app/robots.ts` — our own robots.txt (Phase 12; on-brand to ship a good one).
- ⬜ Keyword landing pages — `/robots-txt-generator`, `/gptbot-robots-txt`, … (Phase 12).
- ⬜ OG image — static/dynamic `opengraph-image` (Phase 12).

## Branding

- ✅ Name — "Robots.txt Studio" consistent across nav, footer, metadata (no "RobotsKit").
- ✅ Favicon — `app/icon.svg` (bot mark).
- 🟡 App icons — single SVG icon; add `apple-icon`/maskable PNG sizes for PWA polish.
- ⬜ Logo/wordmark — final visual identity deferred (open decision in SPRINTS).

## Legal

- ⬜ Privacy Policy — placeholder page `/privacy` (note: we send the entered domain to
  our server only to fetch its public robots.txt; no accounts/PII stored).
- ⬜ Terms — placeholder page `/terms`.
- ⬜ Contact — placeholder page `/contact`.

## Monitoring

- ⬜ Analytics — Plausible script (privacy-friendly; per stack). Add `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`.
- ⬜ Error tracking — Sentry (or Vercel) placeholder; capture route-handler + client errors.

## Deployment (Vercel)

- ✅ Build passes — `next build`, 14 routes (static where possible; `/analyze`,
  `/api/*` dynamic).
- ⬜ Vercel project — connect repo, set Node 20+, framework auto-detected.
- ⬜ Environment variables — none required to run; add `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
  (analytics) and any error-tracking DSN when enabled.
- ⬜ Production validation — after deploy: analyze a real domain, generate + download,
  validate/explain/test, check `/api/analyze` + `/api/fetch-robots`, Lighthouse pass.
- 🟡 Route-handler runtime — `nodejs` (needs server fetch); confirm not edge.
- ⬜ Rate limiting — consider basic limits on `/api/analyze` + `/api/fetch-robots`
  (they fetch arbitrary user-supplied domains) before heavy promotion.

---

## Performance Report

From `next build` (First Load JS; shared baseline **102 kB**):

| Route | Page | First Load JS |
| --- | --- | --- |
| `/ai-crawlers` | 3.1 kB | **133 kB** (largest) |
| `/generate` | 2.5 kB | 132 kB |
| `/explain` | 5.7 kB | 128 kB |
| `/validate` | 3.7 kB | 126 kB |
| `/url-tester` | 5.8 kB | 124 kB |
| `/analyze` | 7.5 kB | 123 kB |
| `/` | 2.1 kB | 117 kB |
| `/api/analyze`, `/api/fetch-robots` | — | route handlers (no client JS) |

- **Initial page load:** Home 117 kB First Load JS — well within budget; static prerendered.
- **Analyzer latency:** dominated by the upstream site's robots.txt fetch (8 s timeout
  cap, 512 KiB cap); our pipeline is microseconds. Loading state covers it.
- **API response times:** `/api/analyze` ≈ fetch round-trip + ~1 ms analysis;
  `/api/fetch-robots` ≈ fetch round-trip only.
- **Largest bundles:** `/ai-crawlers` and `/generate` — they transitively import the
  Generator (which composes Validator + Explainer + Tester) and run it live on every
  toggle. All pure JS; cheap at runtime.

**Recommendations (not blocking — visibility only):**
- Tree-shaking is already effective (largest route +31 kB over baseline). No premature
  optimization needed.
- If trimming later: lazy-load the AI Manager's right-hand preview, or split the
  Generator's per-category crawler lists. Low priority.
- Home and tool *pages* are server components; only the interactive screen bodies are
  client — already minimal. The `/dev` component library can be excluded from prod.

---

## E2E Coverage Report

Playwright (system Chrome; prod server). **12 tests, all passing.**

| Journey | Spec | Screens |
| --- | --- | --- |
| 1 Analyze (mocked API) + loading | `analyze.spec.ts` | Home → Analyzer |
| 2 Generator | `generator.spec.ts` | Generator |
| 3 AI Manager | `ai-manager.spec.ts` | AI Manager |
| 4 Validator | `validator.spec.ts` | Validator |
| 5 URL Tester | `tester.spec.ts` | URL Tester |
| 6 Explainer | `explainer.spec.ts` | Explainer |
| Smoke + nav | `smoke.spec.ts` | Home + all routes |
| Error states | `errors.spec.ts` | Analyzer, fetch-from-URL, empty doc |

## Error-State Audit

| State | Handling | Status |
| --- | --- | --- |
| Empty input | Pure parser tolerates `""` (allow-all); screens render | ✅ |
| Invalid domain (Analyzer/fetch) | Schema rejects → 400 → friendly `role=alert` / Callout | ✅ |
| Invalid robots.txt | Parser recovers; Validator shows issues | ✅ |
| Network failure | `network-error` status → error message + retry | ✅ |
| Analyzer timeout | 8 s `AbortController` → `timeout` status + message | ✅ |
| Missing robots.txt | `not-found` → allow-all report + "create one" recommendation | ✅ |
| Oversized robots.txt | 512 KiB cap → `too-large` (truncated) + note | ✅ |
| Invalid content-type | HTML/JSON → `invalid-content-type` + note | ✅ |
| API failure (4xx/5xx) | Screen shows error state; never crashes | ✅ |

Gaps: none functional. Every state has a friendly message, a recovery path (retry /
paste fallback / re-enter), and accessible presentation (`role=alert`/`status`).
