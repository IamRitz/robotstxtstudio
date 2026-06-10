# Project Status

| | |
| --- | --- |
| **Current Phase** | Phase 12 — SEO Pages & Growth Assets (12A–12D done; 12E next) |
| **Last Completed Commit** | `b855e00` — test(e2e) integration & launch readiness |
| **Current Branch** | `master` |
| **Overall Progress** | ~85% (11 of 13 roadmap phases) |
| **Launch readiness** | No product blockers — see [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md) |
| **Last Updated** | 2026-06-08 |

> Execution dashboard only. Product/design/engineering detail lives in
> [`PRD.md`](./PRD.md), [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md),
> [`PARSER.md`](./PARSER.md), [`VALIDATOR.md`](./VALIDATOR.md),
> [`EXPLAINER.md`](./EXPLAINER.md).

---

# Roadmap Status

| Phase | Status | Commit |
| --- | --- | --- |
| Architecture & Setup | ✅ Complete | `d976fbb` |
| Domain Models | ✅ Complete | `1030478` |
| Parser | ✅ Complete | `af00e06` |
| Validator | ✅ Complete | `8ee2d5a` |
| Explainer | ✅ Complete | `9ff36fb` |
| URL Tester | ✅ Complete | `92f321c` |
| Generator | ✅ Complete | `2562dd3` |
| AI Manager | ✅ Complete | `484c026` |
| Analyzer | ✅ Complete | `ac31675` |
| UI Integration · 10A Design System & Shared UI | ✅ Complete | `45602c7` |
| UI Integration · 10B Screen Assembly | ✅ Complete | `acd813c` |
| Testing / Hardening | ✅ Complete | `b855e00` |
| SEO Pages | ⏳ Next | |
| Deployment | ⏳ Pending | |

Also shipped: product documentation blueprint (`c76acbc`).

---

# Completed Milestones

## Architecture & Setup
Commit: `d976fbb`
Delivered: Next.js 15 + TS strict + Tailwind v4 scaffold, feature-based structure, Vitest/Playwright harness, ESLint feature-boundary rule.
See: [`README.md`](../README.md)

## Product Documentation
Commit: `c76acbc`
Delivered: canonical PRD, design-system extraction, captured approved screens.
See: [`PRD.md`](./PRD.md), [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)

## Domain Models
Commit: `1030478`
Delivered: pure `src/types` vocabulary (RobotsFile, Crawler, Validation, Score, …) + Zod boundary schemas.
See: [`PRD.md` §15](./PRD.md)

## Parser
Commit: `af00e06`
Delivered: shared robots.txt parser → canonical AST; lossless `directives` backbone; tolerant recovery; 56 tests (~98%).
See: [`PARSER.md`](./PARSER.md)

## Validator
Commit: `8ee2d5a`
Delivered: 19-rule validation engine (critical/warning/recommendation), AI crawler checks, reusable health scoring; 100% domain coverage.
See: [`VALIDATOR.md`](./VALIDATOR.md)

## Explainer
Commit: `9ff36fb`
Delivered: deterministic plain-English explanations (groups, AI crawlers, sitemaps, notes); reuses Validator AI statuses; ~98% coverage.
See: [`EXPLAINER.md`](./EXPLAINER.md)

## URL Tester
Commit: `92f321c`
Delivered: canonical access-evaluation engine (group selection, longest-match + Allow-tie precedence, `*`/`$` wildcards); `testUrl` with trace + reason; trace-free `evaluateAccess`/`isAllowed` for reuse; ~99% coverage.
See: [`TESTER.md`](./TESTER.md)

## Generator
Commit: `2562dd3`
Delivered: canonical writer (config → RobotsFile → text); 20-crawler catalog (`src/config/crawlers.ts`); locked presets; `generatePreview` composing Validator/Explainer/Tester; full-AST round-trip with the parser; ~99% coverage.
See: [`GENERATOR.md`](./GENERATOR.md)

## AI Crawler Manager
Commit: `484c026`
Delivered: intent model (Allow/Block/Inherit `PolicySet`); `toGeneratorConfig` (PolicyGenerator); `analyzePolicySet` impact engine composing Generator/Tester/Validator/Explainer; per-crawler summaries, category tallies, intent-driven recommendations. No robots.txt strings built here. ~99% coverage.
See: [`AI_MANAGER.md`](./AI_MANAGER.md)

## Analyzer / Live Checker
Commit: `ac31675`
Delivered: strict fetch/analysis split — injectable `fetchRobots` (only IO; never throws; handles 404/redirect/invalid-type/too-large/timeout/network) + pure `buildAnalysisReport` composing Parser/Validator/Explainer/Tester into an `AnalysisReport` (visibility score, category breakdown, findings, deep-linked recommendations). ~98% coverage. No route handler yet (UI phase).
See: [`ANALYZER.md`](./ANALYZER.md)

## UI Integration — 10A Design System & Shared UI
Commit: `45602c7`
Delivered: OKLCH token migration (+ `--brand` + status tokens), Inter/Geist Mono fonts, shadcn-compatible primitives, app shell (header + mobile bottom nav + footer), and shared components (HealthGauge, ScoreCard, StatusBadge, CrawlerBadge, IssueCard, RecommendationCard, CodePanel, InfoPanel, Callout, Empty/Loading/Error states, PageHeader/SectionHeader/Breadcrumb). `/dev` component library + screenshots.
See: [`UI_INTEGRATION.md`](./UI_INTEGRATION.md), `docs/screenshots/`

## UI Integration — 10B Screen Assembly
Commit: `acd813c`
Delivered: all seven approved screens wired to feature APIs; thin `app/api/analyze` route handler; empty/loading/error states; responsive + accessible; `typedRoutes` re-enabled. 12 routes build clean.
See: `docs/screenshots/phase-10b-*`

## Testing & Integration Hardening
Commit: `b855e00`
Delivered: fetch-from-URL (`app/api/fetch-robots` reusing the Analyzer fetch + shared `RobotsSourceField` in Validator/Tester/Explainer); Playwright e2e for all 6 journeys + smoke/nav + error states (12/12 pass, prod server via system Chrome); error-state audit; OG/Twitter metadata + favicon; `docs/LAUNCH_CHECKLIST.md`.
See: [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md)

## SEO — 12A Technical SEO Foundation
Commit: `bf36de7`
Delivered: `app/robots.ts` + `app/sitemap.ts`; site-wide Organization + WebSite (SearchAction) JSON-LD; per-tool canonical + BreadcrumbList; OG/Twitter/keywords base; `app/icon.svg`; `docs/SEO_AUDIT.md`.

## SEO — 12B Content Architecture
Commit: `07f92c9`
Delivered: data-driven content system — `src/config/content.ts` registry (AUTHOR/EEAT, TOOLS, EDU_PAGES), `src/components/content/*` (SeoContentLayout, TOC, AuthorBox, ToolCTA, RelatedResources, FaqSection, SchemaWrapper emitting Breadcrumb + TechArticle + FAQ JSON-LD).

## SEO — 12B Educational Cluster
Commit: `e7ccb7e`
Delivered: 12 educational pages on the shared architecture (what-is, file, how-it-works, syntax, format, how-to-find, how-to-read, examples, sitemap, why-important, seo-guide, checker). Unique metadata + canonical, distributed FAQ schema (no dup questions), breadcrumb + article JSON-LD, EEAT byline, ≥3 contextual internal links each + tool CTA + related + next-reading. Entry points: sitemap (registry-driven), footer Guides column, homepage Learn section. Build/tsc/eslint green, 208 unit + 12 e2e pass.

## SEO — 12C Transactional & Programmatic Cluster
Commit: `a74152b`
Delivered: 16 high-intent pages. Architecture extended (backward-compatible): `ContentPage.heroCta` + `nextReading`, a mid-article `cta` block, `ToolCTA` compact variant. New `src/config/ai-crawler-directory.ts` (9 crawlers) + `SEO_PAGES` registry. Pages: AI Crawler Directory hub (`/ai-crawlers-directory`); 5 crawler pages (gptbot/claudebot/perplexitybot/google-extended/ccbot); 4 CMS pages (wordpress/shopify/magento/nextjs); 2 comparisons (vs-noindex/vs-sitemap); 4 tool landing pages (generator/validator/analyzer/tester). Each: unique title/description/H1, distributed FAQ + breadcrumb + TechArticle schema, above-fold/mid/bottom CTAs, links to tool + edu + crawler + AI hub. Note: tool stays at `/ai-crawlers`; directory at `/ai-crawlers-directory` (per user decision). Entry points: sitemap (registry-driven), footer Solutions column, homepage AI link. Build/tsc/eslint green, 208 unit + 12 e2e pass.

## SEO — 12D Growth Assets & Internal Linking
Delivered: the Crawler Directory + growth assets + an internal-linking engine.
- **Crawler Directory** — `/crawlers` hub (all 21 catalog crawlers, category-grouped, `CollectionPage`/`ItemList` schema) + 10 enriched standalone `/crawlers/[id]` pages (googlebot, bingbot, slurp, ahrefsbot, semrushbot, bytespider, amazonbot, applebot-extended, meta-externalagent, facebookexternalhit) with `HowTo` schema. Anti-thin guardrail: only crawlers with an editorial profile in new `src/config/crawler-directory.ts` get a page; the 5 AI crawlers keep their 12C pages (hub links out — no duplicate URLs).
- **Internal-linking engine** — `src/lib/internal-links.ts` (computed sibling-tool + guide links); new `ToolRelatedRail` added to all 6 tool pages (which previously dead-ended); footer Solutions column surfaces every new cluster head.
- **Growth assets** — `/robots-txt-templates` (8-template gallery, `ItemList`, Generator deep-links via `src/config/templates.ts`) and `/robots-txt-glossary` (21 terms, `DefinedTermSet`, via `src/config/glossary.ts`).
- **Schema** — added `softwareAppSchema`/`howToSchema`/`itemListSchema`/`definedTermSetSchema` builders; `SoftwareApplication` JSON-LD on all 6 tool pages; `ContentPage.extraSchema` hook renders HowTo/ItemList/DefinedTermSet on content pages.
- **Dynamic OG images** — shared `src/lib/og.tsx` renderer + `opengraph-image.tsx` for home, `/crawlers`, `/crawlers/[id]`, templates, glossary.
- Registry-driven sitemap auto-includes all new routes. Build green (71 static pages), tsc/eslint clean, 208 unit + 12 e2e pass.

---

# Current Sprint

**Goal:** Phase 12 — SEO pages & growth assets (12C–12H remaining).

**Scope:** `app/sitemap.ts`, `app/robots.ts` (ship an exemplary robots.txt), dynamic
`opengraph-image`, and keyword landing pages (`/robots-txt-generator`,
`/robots-txt-tester`, `/robots-txt-validator`, `/gptbot-robots-txt`,
`/claudebot-robots-txt`, `/perplexitybot-robots-txt`, `/wordpress-robots-txt`) that
funnel into the tools, plus a Crawler Directory (`/crawlers`). Per-page canonical +
metadata. Static/ISR; reuse existing components.

**Acceptance Criteria:** keyword routes render + funnel to tools; sitemap/robots/OG
present; Lighthouse SEO pass; no domain changes.

**Dependencies:** all features + UI ✅, catalog ✅, metadata base ✅.

---

# Next Recommended Phase

**Phase 12 — SEO Pages & Growth Assets** (then Phase 13 Deployment).

- **Why:** product is feature-complete, tested, and launch-audited; SEO surfaces are the
  remaining acquisition work before deploy.
- **Dependencies already satisfied:** primary keywords (PRD), route map (PRD §16),
  crawler catalog, and the shared component library.

---

# Open Decisions

- **Branding / logo direction** — name locked to "Robots.txt Studio"; visual identity/logo deferred.
- **Future monitoring** — `MonitoredSite`/snapshots modeled but not scheduled/built.
- **Future team/workspace support** — accounts, multi-site, shareable reports (PRD §18).
- **LLM-assisted explanations** — optional layer on top of the deterministic baseline (PRD §18).

---

# Technical Debt

- **Design token migration** — Phase 1 `globals.css` uses an HSL blue `--primary`; migrate to the OKLCH neutral base + `--brand`/status tokens in UI Integration (DESIGN_SYSTEM §2).
- **Crawler dataset** — Validator/Explainer hardcode 5 major AI crawlers + a small label map; move to the config-layer crawler DB in the AI Manager phase.
- **Playwright e2e** — smoke spec written but not executed (browsers not installed); wire up in Testing phase.
- **Parser convenience fields** — `crawlDelay`/`host` are first-wins; duplicates live in `directives` (validator must scan). Documented in PARSER.md.
