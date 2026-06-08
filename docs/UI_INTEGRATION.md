# UI Integration Readiness Review

> Pre-Phase-10 gate. Confirms the approved screens can be built entirely on the
> existing, stable feature APIs with **no domain-layer refactoring**. Planning only —
> no UI is built here. Companion: [`PRD.md`](./PRD.md),
> [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md), [`SPRINTS.md`](./SPRINTS.md).

**Verdict: READY — no critical blockers.** Proceed to **Phase 10A (Design System &
Shared UI Components)**, then **Phase 10B (Screen Assembly)**. Two *additive* route
handlers are needed (network IO can't run in the browser); neither touches the domain.

---

## 1. UI Readiness Assessment

Every approved screen maps to an existing barrel API returning a `src/types` model.

| Screen (route) | Feature barrel | API | Output type |
| --- | --- | --- | --- |
| Home `/` | live-checker (on submit) | route to `/analyze`; preview strip via `analyze()` | `AnalysisReport` |
| Crawler Visibility Audit `/analyze` | `@/features/live-checker` | `analyze(domain)` *(via route handler)* | `AnalysisReport` |
| Generate `/generate` | `@/features/generator` | `generatePreview(config)`, `applyPreset` | `GeneratorPreview` |
| Validate `/validate` | `@/features/validator` + `@/parser` | `validateRobots(parseRobots(text))` | `ValidationResult` |
| URL Tester `/url-tester` | `@/features/tester` + `@/parser` | `testUrl(parseRobots(src), url, ua)` | `UrlTestResult` |
| AI Crawlers `/ai-crawlers` | `@/features/crawler-manager` | `analyzePolicySet(policySet)` | `PolicyImpact` |
| Explain `/explain` | `@/features/explainer` + `@/parser` | `explainRobots(file, { validation })` | `ExplanationResult` |
| Crawler Directory `/crawlers` (SEO) | `@/config/crawlers` | `ALL_CRAWLERS`, `crawlersByCategory` | `Crawler[]` |

Supporting data already exported: `ALL_CRAWLERS`, `CATEGORY_ORDER`, `CATEGORY_LABELS`,
`TEMPLATE_LABELS`, `PRESETS`, `MAJOR_AI_CRAWLERS`, `getAiCrawlerStatuses`,
`categorySummaries`, and the policy-set builders (`fromWebsitePreset`,
`setPermission`, `setCategoryPermission`, `blockAllAiCrawlers`, …).

### Gaps (all additive, none are domain refactors)

1. **`/analyze` needs a server route.** `analyze()` performs network fetch — browsers
   can't fetch a third-party robots.txt (CORS). Add a thin `app/api/analyze/route.ts`
   (validate body with `analyzeRequestSchema`, call `analyze(domain)`, return the
   report). **10B.**
2. **"Fetch from URL" tabs** (Validate / Tester / Explainer) need the raw file from a
   URL → same CORS constraint. Add a thin `app/api/fetch-robots/route.ts` wrapping
   `fetchRobots`, **or** reuse `/api/analyze` and read `report.fetch.body` /
   `report.file`. **10B, optional/small.**
3. **Generator raw-editor reverse-sync.** There is no `parse → GeneratorConfig`
   inverse, so editing the raw text can't update the toggles. **UX decision, not a
   blocker:** toggles drive the live preview (read path); an "Edit raw" mode runs
   `validateRobots`/`explainRobots` on the edited text without reverse-syncing toggles.

No type mismatches: every screen consumes a `src/types` model directly.

---

## 2. Component Architecture Review

### shadcn/ui primitives to add (`src/components/ui/`)

`button` · `input` · `card` · `badge` · `tabs` · `switch` · `tooltip` · `separator` ·
`skeleton` · `scroll-area` · `dropdown-menu` · `dialog`/`sheet` (mobile nav) ·
`sonner` (toasts) · `table`. (`cn`, `clsx`, `tailwind-merge`, `class-variance-authority`,
`lucide-react` already present.)

### Shared components (`src/components/`)

Layout: **AppShell**, **TopNav** (dark bar), **Breadcrumb**, **BottomTabBar** (mobile),
**Footer**, **PageHeader**, **StickyActionBar**.
Data/feedback: **HealthGauge** (SVG, banded), **ScoreCard**, **MetricCard**,
**StatusBadge**, **SeverityBadge**, **SeverityIcon**, **CrawlerRow**,
**CrawlerLogoTile**, **CategoryBar** (allowed/blocked), **CodePanel** (dark, mono,
copy/download), **InfoPanel**, **IssueCard**, **RecommendationCard**, **EmptyState**,
**LoadingState** (skeletons), **ErrorState**.
Controls: **Toggle** (switch wrapper), **TabSwitcher** (pill), **UnderlineTabs**,
**DomainInput/UrlInput**, **CopyButton**, **DownloadButton**, **SearchInput**.

### Feature-specific components (live in each feature's `ui/`)

- **Generator:** TemplatePicker · CrawlerToggleList (category cards) · AdvancedRules
  (paths/sitemap/crawl-delay) · LivePreview (CodePanel + Preview/Raw tabs) · ImpactPanel.
- **Validator:** RobotsEditor (line-numbered + highlight) · HealthScorePanel ·
  IssueFilterTabs · IssueList · EduRecommendations.
- **Tester:** TestConfig · CrawlerChips · VerdictBanner · MatchedRule · **RuleTrace**
  (numbered steps from `UrlTestResult.trace`) · RecentTests · TestSummary · QuickTips.
- **AI Manager:** PresetButtons · CrawlerSearch · CategoryCards (CrawlerRow + Toggle) ·
  ImpactPreview · ExportBar.
- **Analyzer:** AuditInput · VisibilityScoreCard (HealthGauge + breakdown) ·
  AuditSummary (findings) · CrawlerBreakdown (CategoryBars) · AuditActionBar.
- **Home:** Hero · CrawlerAccessPreview · StepsIndicator · ToolGrid (Analyze/Control/Verify).

`HealthGauge`, `CodePanel`, `StatusBadge/SeverityBadge`, `CrawlerRow`, and `CategoryBar`
are reused by ≥3 screens — build them first (10A).

---

## 3. Route Review (final, canonical)

Locking the PRD §16 slugs (the task's `/generator`, `/validator`, `/tester` are
treated as aliases — optionally add redirects in 12).

| Route | Screen | Phase |
| --- | --- | --- |
| `/` | Home | 10B |
| `/analyze` | Crawler Visibility Audit | 10B |
| `/generate` | Generator | 10B |
| `/validate` | Validator | 10B |
| `/url-tester` | URL Tester | 10B |
| `/ai-crawlers` | AI Crawler Manager | 10B |
| `/explain` | Explainer | 10B |
| `/crawlers` | Crawler Directory | 12 |
| `/api/analyze` | route handler → `analyze()` | 10B |
| `/api/fetch-robots` | route handler → `fetchRobots()` (optional) | 10B |
| SEO keyword routes (`/robots-txt-generator`, `/gptbot-robots-txt`, …) | static, funnel | 12 |

---

## 4. Design Token Migration Plan (migration only, no redesign)

**Current debt:** `globals.css` uses HSL with `--primary` = blue; `DESIGN_SYSTEM.md`
specifies an OKLCH neutral base with **blue-600 as a separate brand accent** and
semantic status colors (80% gray / 15% blue / 5% status).

Steps:

1. **Neutral base (OKLCH).** Replace the HSL block with the shadcn-style OKLCH tokens
   from `DESIGN_SYSTEM.md` §2: `--background`, `--foreground`, `--card`, `--popover`,
   `--muted(-foreground)`, `--border`, `--input`, `--ring`, `--secondary`, `--accent`,
   and `--primary` = **neutral-950** (dark surfaces), `--radius: 0.65rem`.
2. **Brand accent.** Add `--brand` (blue-600) + `--brand-foreground`. **CTAs/active/links
   use `--brand`, not `--primary`** — this is the key migration rule (today's blue
   `--primary` becomes `--brand`).
3. **Semantic status.** Add `--status-{allowed,blocked,warning,info}` with `-bg`/`-fg`
   pairs (green/red/amber/blue) for badges, gauges, and issue severities.
4. **Typography.** Load Inter + Geist Mono via `next/font` in `layout.tsx`, expose
   `--font-sans`/`--font-mono`; keep the Display→Caption scale as utility classes
   (no token change). Mono for all code/paths/user-agents.
5. **Spacing/radius.** Tailwind's 4px base already matches; document the outside-in
   convention (page `p-12`, card `p-6`, inner `gap-2`) and the radius ladder
   (`sm`/`lg`/`xl`/`full`). No values change.
6. **`@theme inline`.** Map every token to a `--color-*` so Tailwind v4 utilities
   (`bg-brand`, `text-muted-foreground`, `border-border`, …) resolve.

This is a **drop-in token swap** plus two new token groups (`--brand`, `--status-*`).
No component visuals are redesigned; the Phase-1 placeholder `page.tsx` is replaced in 10B.

---

## 5. UI Build Order

Endorsing the proposed order with the 10A/10B split:

**Phase 10A — Design System & Shared UI**
1. Design tokens (§4) + `next/font`.
2. Layout shell (AppShell, TopNav, Breadcrumb, BottomTabBar, Footer, StickyActionBar).
3. Shared components — **HealthGauge, CodePanel, StatusBadge/SeverityBadge, CrawlerRow,
   CategoryBar, IssueCard, EmptyState/LoadingState/ErrorState first** (highest reuse),
   then the rest.

**Phase 10B — Screen Assembly** (one screen at a time, vertical):
4. Home → 5. Analyzer → 6. Validator → 7. AI Manager → 8. Tester → 9. Generator →
10. Explainer.

Notes / deviations:
- **Build the `/api/analyze` route handler as the first task of the Analyzer screen**
  (its only new surface).
- The order is otherwise sound: Home and Analyzer exercise the most shared components
  early (validating the 10A set); Validator/Tester/Explainer are client-only and
  simple; Generator is last among tools because its raw-editor mode is the fiddliest.
- Each 10B screen ships its three states (empty/loading/error) and is verified before
  the next.

---

## 6. Risk Assessment

| Area | Risk | Severity | Mitigation |
| --- | --- | --- | --- |
| **API gaps** | `/analyze` + "fetch from URL" need server routes | Low | Thin route handlers wrapping `analyze`/`fetchRobots`; no domain change |
| **Type mismatches** | None — all outputs are `src/types` | None | — |
| **Data-shape** | No `parse → GeneratorConfig` inverse (raw-editor sync) | Low | Toggles drive preview; "Edit raw" runs validate/explain only |
| **Performance** | `analyzePolicySet`/`generatePreview` recompute on every toggle | Low | Pure + microsecond-fast; memoize + debounce raw-text validation |
| **Performance** | `analyze()` is network-bound | Med | Server route + loading skeletons + error states + light caching |
| **Refactoring** | `--primary` semantics change (blue → neutral) | Med | Token-usage rule: CTAs use `--brand`; audit during 10A |
| **Refactoring** | Phase-1 placeholder `page.tsx`/globals replaced | Low | Expected; covered by smoke/e2e in Testing phase |

No risk requires a domain-layer change.

---

## Recommendation

All six features expose stable, typed APIs returning `src/types` models; the design
system and screen specs are fully documented; the only new surfaces are React/shadcn
components and two thin route handlers. **No critical blockers.**

➡️ **Proceed to Phase 10A — Design System & Shared UI Components**, then
**Phase 10B — Screen Assembly.**
