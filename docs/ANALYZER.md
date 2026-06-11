# Analyzer / Live Checker

> Fetches a real site's robots.txt and produces an
> [`AnalysisReport`](./PRD.md#15-domain-models) — the canonical output for the
> Analyzer screen, dashboard summaries, and future monitoring / compare / saved
> reports. In `src/features/live-checker/`. Companion: [`PRD.md`](./PRD.md).

## The fetch / analysis split

The Analyzer is the first feature with network IO, so the boundary is strict:

| Layer        | Location  | IO?    | Responsibility                                          |
| ------------ | --------- | ------ | ------------------------------------------------------- |
| **Fetch**    | `lib/`    | yes    | normalize URL, fetch, classify outcome → `FetchResult`  |
| **Analysis** | `domain/` | **no** | `FetchResult` → `AnalysisReport` by reusing the engines |

The fetch layer contains **no** parsing/validation; the analysis layer performs **no**
IO and adds **no** new robots.txt logic.

## Pipeline

```
input URL → toRobotsUrl() → fetchRobots()  ── lib (IO)
          → parseRobots → validateRobots → explainRobots
          → computeBreakdown (Tester) → computeVisibility → recommendations
          → AnalysisReport                                   ── domain (pure)
```

`analyze(input, opts)` (in `lib/`) is the route-handler-shaped orchestrator:
`(string) => Promise<AnalysisReport>`. `buildAnalysisReport(fetchResult, domain, fetchedAt)`
is the pure pipeline and can be tested/reused without any network.

## Fetch strategy & failure modes

`fetchRobots(robotsUrl, { fetchFn?, timeoutMs?, maxBytes? })` — `fetchFn` defaults to
`globalThis.fetch` and is injectable for tests. It **never throws**; every outcome
maps to a `FetchStatus`:

| Situation                        | `status`               | `robotsExists` | Analysis input   |
| -------------------------------- | ---------------------- | -------------- | ---------------- |
| 200, `text/plain`                | `ok`                   | true           | the body         |
| 200, empty body                  | `ok`                   | true           | `""` (allow-all) |
| 404                              | `not-found`            | false          | `""` (allow-all) |
| 200, `text/html` / JSON / etc.   | `invalid-content-type` | false          | `""`             |
| body over `maxBytes` (512 KiB)   | `too-large`            | true           | first `maxBytes` |
| no response in `timeoutMs` (8 s) | `timeout`              | false          | `""`             |
| other non-2xx / thrown error     | `network-error`        | false          | `""`             |

**Missing ≠ error:** 404/invalid/failed all analyze an empty (allow-all) file with the
real `fetch.status` recorded and a recommendation attached, so the report is always
well-formed. Redirects are followed (`finalUrl` + `redirected` captured).

## AnalysisReport structure

```
AnalysisReport {
  domain, fetchedAt,              // identity + ISO timestamp
  fetch: FetchResult,             // fetch metadata (status, finalUrl, contentType, …)
  file: RobotsFile,               // parsed AST
  validation: ValidationResult,   // issues + health score
  explanation: ExplanationResult, // plain-English + per-AI-crawler status
  visibility: VisibilityScore,    // value/band + SE% / AI% / errorRate
  breakdown: CategoryBreakdown[], // allowed/blocked per category (via Tester)
  findings: ValidationIssue[],    // errors + warnings (the audit summary)
  recommendations: Recommendation[], // info issues + fetch notes, each with an action
}
```

- **AI crawler status** lives in `explanation.aiCrawlers` (access + configuration
  source + recommendation per major AI crawler).
- **Health score** is `validation.health`; **summary statistics** are `visibility` +
  `breakdown` + `validation.counts`.
- **`recommendations[].action`** deep-links the UI (`open-generator` /
  `open-crawler-manager` / `edit-rules`) — powering the "Fix Issues" flow.

### Visibility score

```
value = round(0.5·searchEngineAccess + 0.2·aiCrawlerAccess + 0.3·health)
errorRate = 100 − health        (reuses the Validator's health; no new judgement)
```

banded via the shared `scoreBand` (80/60). Access percentages come from the breakdown.

### Example (only GPTBot blocked)

```jsonc
{
  "domain": "example.com",
  "fetch": { "status": "ok", "httpStatus": 200 },
  "visibility": { "value": 93, "band": "good", "searchEngineAccess": 100, "aiCrawlerAccess": 88, "errorRate": 15 },
  "breakdown": [ { "category": "ai-training", "allowed": 4, "blocked": 1, "total": 5 }, … ],
  "findings": [ { "severity": "warning", "code": "missing-sitemap" } ],
  "recommendations": [ { "severity": "info", "title": "ClaudeBot inherits the default rules", "action": { "kind": "open-crawler-manager" } }, … ]
}
```

## Analyzer screen (Phase 17A/17B — verdict, matrix & queue; see ANALYZER_DASHBOARD_UX_REVIEW.md)

The Analyzer is the **primary start-to-finish workflow**: enter a domain → audit the
live file → fix it → download the corrected version. It reuses the Validator's engine
but is deliberately _not_ a second validation screen — it leads with _access_ ("who
gets in"), the Validator leads with _the file_:

- **Verdict band** (`app/analyze/verdict-band.tsx`, sticky) — the ONE score surface:
  Visibility `NOW → POTENTIAL` (potential = the same pure pipeline re-run on the
  text with every in-app fix applied — no estimates), band chip, the one-sentence
  verdict ("Search engines see everything · 1 of 8 AI bots blocked · 2 fixable
  issues cost 1 pt"), contributing metrics (`Search 3/3 · AI 7/8 · File health
83 → 89` — health is **not** a second hero, and the old `errorRate` is no longer
  rendered anywhere), fetch provenance (`200 OK · text/plain · 0.2 KB · fetched
14:02 UTC`), and the actions: **Fix N safe issues +Δ pts** / Undo / Download.
  Non-`ok` fetch outcomes keep a loud `Callout`; a successful fetch is just the
  metadata line.
- **Access Matrix** (`app/analyze/access-matrix.tsx`, 17B.1) — "Who can see
  {domain}", directly under the verdict band: one row per crawler category with an
  allowed/blocked split bar, the count, and a red `✗ {name}` chip for every
  **blocked** crawler (exceptions are the information; fully-allowed rows just get
  a ✓). Rows expand into the full per-crawler verdict list. Names, not
  percentages; data is the same Tester `isAllowed(file, "/", ua)` sweep as before.
- **Read-only file view** (17B.2) — a collapsed `<details>` ("The file — as
  served / with your fixes applied · N lines, M flagged") rendering the working
  copy in `RobotsEditor` (`readOnly`, severity annotations). Transparency only:
  no editing, no split pane.
- **Dimension chips** (17B.3) — the Phase 16 chip strip, lifted to
  `components/dimension-chip-strip.tsx` and shared with the Validator. Chips
  (`SEO 95 +5`) filter the Action Queue by dimension; no panels, no dashboard
  cards.
- **Action Queue** (`app/analyze/action-queue.tsx`) — Priorities + Issues +
  Recommendations collapsed into ONE ranked list over `validation.issues`:
  in-app-fixable first by deduction points, then manual point work, then advisories.
  Rows mirror the Validator issue-panel anatomy (severity chip · title · `+pts` ·
  action; expanded: message, `whyItMatters`, preview-before-apply `DiffView`,
  `fixImpact` recovery line). Non-fixable rows deep-link via
  `recommendedActionFor(code)` → AI Manager / Generator. `AuditDashboard`
  (Strengths/Weaknesses/priorities/dimension cards), the visibility `ScoreCard`,
  the Fix & export toolbar, and `RecommendationCard` no longer render here.
- **Cumulative diff vs. the live file** after any fix; **Next Steps** only when the
  queue is empty; the related rail is collapsed into a `<details>`.

Everything that depends on the file (queue, breakdown, visibility, recovery
potentials) is **recomputed client-side from the working copy** using the same
pure functions as the server pipeline, so a fix updates every score live. The server
report still supplies the fetch metadata (domain, status, original source).

## Route readiness

`analyze()` is the integration seam: a future `app/api/analyze/route.ts` validates the
request (with `analyzeRequestSchema` from `@/schemas`) and calls `analyze(domain)`.
No route handler ships yet (UI Integration phase). Keep the handler thin — all logic
stays in `lib/analyze` + `domain/`.

## Architecture

```
src/features/live-checker/
  lib/
    url.ts           # toRobotsUrl() — normalize to /robots.txt
    fetch-robots.ts  # fetchRobots() — the only network IO (injectable fetchFn)
    analyze.ts       # analyze() — fetch + buildReport orchestrator
  domain/            # pure
    breakdown.ts     # computeBreakdown() via the Tester
    visibility.ts    # computeVisibility()
    recommendations.ts # info issues + fetch notes → Recommendation[]
    report.ts        # buildAnalysisReport() — the pure pipeline
  index.ts           # barrel
```

## Testing

`src/features/live-checker/**/*.test.ts` — URL normalization; the fetch boundary with
a mocked `fetchFn` (ok / empty / 404 / invalid content-type / too-large / redirect /
5xx / timeout / network error); the pure report pipeline (success, AI-heavy, missing,
timeout; findings/recommendations split); and end-to-end `analyze` with mocks.
Coverage ~98% of `live-checker`.
