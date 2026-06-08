# Analyzer / Live Checker

> Fetches a real site's robots.txt and produces an
> [`AnalysisReport`](./PRD.md#15-domain-models) — the canonical output for the
> Analyzer screen, dashboard summaries, and future monitoring / compare / saved
> reports. In `src/features/live-checker/`. Companion: [`PRD.md`](./PRD.md).

## The fetch / analysis split

The Analyzer is the first feature with network IO, so the boundary is strict:

| Layer | Location | IO? | Responsibility |
| --- | --- | --- | --- |
| **Fetch** | `lib/` | yes | normalize URL, fetch, classify outcome → `FetchResult` |
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

| Situation | `status` | `robotsExists` | Analysis input |
| --- | --- | --- | --- |
| 200, `text/plain` | `ok` | true | the body |
| 200, empty body | `ok` | true | `""` (allow-all) |
| 404 | `not-found` | false | `""` (allow-all) |
| 200, `text/html` / JSON / etc. | `invalid-content-type` | false | `""` |
| body over `maxBytes` (512 KiB) | `too-large` | true | first `maxBytes` |
| no response in `timeoutMs` (8 s) | `timeout` | false | `""` |
| other non-2xx / thrown error | `network-error` | false | `""` |

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
