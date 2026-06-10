# Compare (Phase 15C.3)

Diff two robots.txt files — two domains, or two versions of one file (before/after).
Deliberately **lightweight**: it composes the existing engines and adds no new
robots.txt logic, parser work, AST diffing, persistence, or monitoring.

## What it shows

- **Score changes (A → B)** — Overall health + Crawler Visibility + the five audit
  dimensions, each as `before → after (Δ)` (green = improved, red = regressed).
- **AI crawler visibility (A → B)** — a first-class report: every AI crawler's
  site-root access on each side, changed rows highlighted.
- **Other visibility changes** — non-AI crawlers whose access flipped.
- **Findings resolved / introduced** — validator findings present on only one side
  (compared by code).
- **File diff** — the shared `<DiffView>` (collapsed, theme-aware).

A common, instructive result: blocking AI crawlers *lowers* Visibility (less access)
while *raising* the AI dimension (a deliberate decision) — the comparison makes that
trade-off explicit.

## Inputs

Both sides use the shared `RobotsSourceField` (Paste **or** Fetch from URL), so the
one screen covers **domain ↔ domain** (fetch each) and **robots.txt ↔ robots.txt**
(paste each). The Analyzer's "Compare with another site" step hands its (fixed) file
to side A via the `lib/handoff` channel.

## Architecture

```
src/features/compare/
  domain/compare.ts   # buildComparison(leftText, rightText): RobotsComparison — PURE
  index.ts            # barrel
src/app/compare/      # page.tsx + compare-screen.tsx (UI)
src/types/compare.ts  # ScoreDelta, FindingDelta, CrawlerAccessDelta, RobotsComparison
```

`buildComparison` reuses `parseRobots`, `validateRobots`, `buildAudit`,
`computeBreakdown`, `computeVisibility`, and the Tester's `isAllowed` — every number
traces back to those engines. Recomputed live from the two inputs (client-side), so
edits update the whole report instantly.

## Testing

`src/features/compare/domain/compare.test.ts` — identical files (zero deltas), score/
dimension/visibility deltas, findings resolved/added by code, per-crawler access
changes, and the always-present AI crawler list. E2E: `tests-e2e/compare.spec.ts`.
