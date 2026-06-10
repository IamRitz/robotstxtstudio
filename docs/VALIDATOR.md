# Robots.txt Validator

> The validation engine in `src/features/validator/`. Consumes a
> [`RobotsFile`](./PARSER.md) AST and produces a `ValidationResult`
> (issues + health score). Pure domain logic — no React/Next — reused by the
> Validator screen, the Analyzer, and future Monitoring.
> Companion: [`PRD.md`](./PRD.md), [`PARSER.md`](./PARSER.md).

## Responsibility split

The parser **parses, preserves, represents**. The validator **judges, scores,
recommends**. The validator never mutates the AST and emits only a
`ValidationResult`.

```
parseRobots(text) → RobotsFile → validateRobots(file) → ValidationResult
```

## Severity model

Three severities map to the three product categories:

| Severity | Category | Meaning |
| --- | --- | --- |
| `error` | **Critical** | Likely to cause crawler problems. Sets `isValid = false`. |
| `warning` | **Warning** | Valid but potentially problematic. |
| `info` | **Recommendation** | Best-practice guidance (includes AI-policy advice). |

`ValidationResult` = `{ isValid, issues, health, counts }`, where `counts` is
`{ error, warning, info }` (info count = recommendation count). Issues are sorted by
severity, then line.

## Rule inventory

### Critical (error)

| Code | Reasoning | User impact |
| --- | --- | --- |
| `missing-colon` | A line without `:` is not a directive. | The line is ignored; intended rule has no effect. |
| `directive-before-user-agent` | `Allow`/`Disallow`/`Crawl-delay` before any `User-agent` belongs to no group. | The rule is silently ignored by crawlers. |
| `empty-user-agent` | `User-agent:` with no value targets nothing. | The whole group is meaningless. |
| `invalid-crawl-delay` | Non-numeric/negative `Crawl-delay`. | Crawlers ignore it; intended throttling lost. |
| `conflicting-rules` | Same path both `Allow` and `Disallow` in one group. | Crawlers resolve unpredictably; access is ambiguous. |
| `invalid-sitemap-url` | `Sitemap:` is not a full absolute http(s) URL. | Sitemap is not discovered; indexing suffers. |

### Warning

| Code | Reasoning | User impact |
| --- | --- | --- |
| `duplicate-rule` | Identical rule repeated in a group. | Noise; harder to maintain, no functional effect. |
| `missing-sitemap` | No `Sitemap:` declared. | Crawlers may miss indexable pages. |
| `overly-broad-disallow` | `Disallow: /` for the wildcard or a search engine. | Can de-index the whole site. (Not flagged for named AI crawlers — that's intentional blocking.) |
| `excessive-rules` | A group exceeds `EXCESSIVE_RULES_PER_GROUP` (50). | Hard to maintain; may hit crawler limits. |
| `unsupported-directive` | Vendor/unknown directive (kept by the parser as `unknown`). | Most crawlers ignore it; intent may not apply. |
| `crawl-delay-zero` | `Crawl-delay: 0` has no effect. | Throttling intent is a no-op. |

### Recommendation (info)

| Code | Reasoning | User impact |
| --- | --- | --- |
| `missing-ai-crawler-policy` | A major AI crawler has no rule **and** no default group. | The crawler is implicitly allowed; no deliberate decision. |
| `ai-crawler-inherits-default` | A major AI crawler only inherits `User-agent: *`. | Its policy is incidental, not chosen. |
| `no-default-group` | No `User-agent: *` group. | Unlisted crawlers have no baseline policy. |
| `no-crawler-specific-groups` | Only a wildcard group exists. | No precise control of important crawlers. |
| `no-comments` | No comments in the file. | Harder for maintainers to understand intent. |
| `sitemap-not-https` | Sitemap declared over `http://`. | Prefer `https://`. |
| `crawl-delay-ignored-by-google` | `Crawl-delay` set for Googlebot/`*`. | Google ignores it; use Search Console crawl settings. |

## Smart Fix engine (Phase 15A)

Rules attach an optional `fix: SuggestedFix` (`src/types/validation.ts`) — a set of
line-based `TextEdit`s applied to the raw source by `applyTextEdits`
(`domain/apply-fix.ts`). Editing text by the parser's 1-based line numbers (rather
than mutating the AST) keeps fixes trivially correct and reversible; the Validator
screen snapshots the previous text for **Undo** and renders a **Before/After diff**
(`components/diff-view.tsx`, `lib/diff.ts`).

Each fix is tagged `safe` or not:

- **`safe: true`** — deterministic AND intent-preserving, so it is eligible for
  **"Fix All Safe Issues"** (applied in one undoable batch): `invalid-crawl-delay`
  (remove the no-op), `duplicate-rule` (remove the dupe), `unsupported-directive`
  (remove the ignored line), `crawl-delay-zero` (remove the no-op), `sitemap-not-https`
  (rewrite `http://`→`https://`).
- **`safe: false`** — offered as a manual **"Fix this · review"** only, because the
  edit changes access or guesses intent: `missing-colon` /
  `directive-before-user-agent` (remove the malformed/ignored line),
  `invalid-sitemap-url` (remove), `conflicting-rules` (remove the `Disallow`, keep
  `Allow`), `overly-broad-disallow` (remove `Disallow: /`),
  `crawl-delay-ignored-by-google` (remove the `Crawl-delay`).

Advisory issues with no deterministic single-line edit (`missing-sitemap`,
`no-default-group`, `no-crawler-specific-groups`, `no-comments`, and the AI-policy
recommendations) carry no `fix.edits` and show no button. Fixes are surfaced only on
the Validator (which owns the text); read-only surfaces like the Analyzer pass no
`onFix`, so the same `IssueCard` shows the finding without a button (Analyzer inline
fixes are a later sub-phase).

## AI-specific validation (differentiator)

For each major AI crawler — **GPTBot, ClaudeBot, PerplexityBot, CCBot,
Google-Extended** (`MAJOR_AI_CRAWLERS`, extensible) — the validator computes a policy
status via `getAiCrawlerStatuses()`:

- **`explicit`** — a group targets the crawler by name → no issue.
- **`inherited`** — no explicit group, but a `User-agent: *` group applies →
  `ai-crawler-inherits-default` recommendation.
- **`missing`** — no explicit group and no default group →
  `missing-ai-crawler-policy` recommendation.

This status map is reused by the Analyzer (crawler breakdown) and Monitoring.

## Audit scoring (Validator 2.0 — Phase 15B)

The Validator screen scores a file across **five dimensions plus an overall**, using a
deliberately simple, fully transparent **deduction model** — every lost point is
traceable to a rule, so "why is this 72 and not 84?" always has a concrete answer. No
learned/opaque numbers. Engine: `domain/audit.ts` (`buildAudit`), pure and tested.

**Model.** Each dimension starts at 100. Every issue subtracts a fixed number of
points (per occurrence) from one or more dimensions, per the `DEDUCTIONS` table. A
dimension score is `clamp(100 − Σ points)`. The overall is a fixed weighted average:

```
Overall = 0.30·Syntax + 0.25·SEO + 0.20·AI + 0.15·Maintainability + 0.10·Security
```

**Deduction table** (per occurrence; the table IS the model — see `audit.ts`):

| Dimension | Codes → points |
| --- | --- |
| **Syntax** | missing-colon 15 · empty-user-agent 15 · conflicting-rules 12 · directive-before-user-agent 10 · invalid-crawl-delay 8 · invalid-sitemap-url 8 |
| **SEO** | overly-broad-disallow 25 · missing-sitemap 10 · invalid-sitemap-url 6 · sitemap-not-https 4 |
| **AI** | missing-ai-crawler-policy 10 · ai-crawler-inherits-default 5 (each crawler) |
| **Maintainability** | excessive-rules 10 · no-default-group 6 · duplicate-rule 5 · unsupported-directive 4 · crawl-delay-zero 4 · crawl-delay-ignored-by-google 3 · no-crawler-specific-groups 3 · no-comments 3 · missing-sitemap 2 |
| **Security** | sensitive-path-disclosure 12 (each path) |

A few codes deduct from two dimensions (e.g. `invalid-sitemap-url` is both a syntax
error and an SEO problem; `missing-sitemap` also costs a little maintainability).

**Health bands** (standardized, used for every score in the dashboard):
`95–100 Excellent · 85–94 Good · 70–84 Needs Attention · 0–69 Poor` (`healthBand()`).

**Potential vs. estimated.** Each dimension reports a `potential` = score after every
*in-app* fix is applied; the summary's `estimatedAfterSafeFixes` = overall after only
the one-click *safe* fixes. **Fix impact preview** (`fixImpact()`) reports the exact
per-dimension and weighted-overall recovery for a single fix, read straight from the
same table. The **Security** dimension is driven by `sensitive-path-disclosure`
(robots.txt is public, so `Disallow`-ing admin/secret paths advertises them).

## Legacy health score (Analyzer)

> The Analyzer still uses the original 3-subscore `HealthScore` below; the Validator
> 2.0 dashboard uses the audit model above. They are independent on purpose.

`HealthScore = { value, band, subscores: { syntax, aiCrawlerConfig, bestPractices } }`,
banded via the shared `scoreBand()` (80–100 good, 60–79 moderate, 0–59 poor).

**Sub-scores** (each clamped to 0–100):

```
syntax         = 100 − 20 × errors
bestPractices  = 100 − 12 × warnings − 5 × (non-AI infos)
aiCrawlerConfig= average over crawlers of: explicit 1.0, inherited 0.5, missing 0.0  (×100)
```

**Overall** (weighted, then rounded):

```
value = 0.45 × syntax + 0.25 × aiCrawlerConfig + 0.30 × bestPractices
```

Weights and penalties live in `scoring.ts` (`SCORE_WEIGHTS`, `PENALTIES`) — change
them in one place. AI recommendation infos are excluded from the best-practices
penalty so AI advice is reflected only through `aiCrawlerConfig` (no double-counting).

### Example

Input:

```text
User-agent: *
Disallow: /
Crawl-delay: 0
Sitemap: http://example.com/s.xml
```

`ValidationResult` (abridged):

```jsonc
{
  "isValid": true,                       // no errors
  "counts": { "error": 0, "warning": 2, "info": 8 },
  "health": {
    "value": 76, "band": "moderate",
    "subscores": { "syntax": 100, "aiCrawlerConfig": 50, "bestPractices": 61 }
  },
  "issues": [
    { "severity": "warning", "code": "crawl-delay-zero", "line": 1 },
    { "severity": "warning", "code": "overly-broad-disallow", "line": 2 },
    { "severity": "info", "code": "sitemap-not-https", "line": 4 },
    { "severity": "info", "code": "ai-crawler-inherits-default" }, // ×5 crawlers
    { "severity": "info", "code": "no-crawler-specific-groups" },
    { "severity": "info", "code": "no-comments" }
  ]
}
```

## Architecture

```
src/features/validator/
  domain/
    constants.ts      # AI crawler list, thresholds, learn-more links
    helpers.ts        # issue factory + AST predicates (URL checks, group targeting)
    ai-crawlers.ts    # getAiCrawlerStatuses() — reused by Analyzer/Monitoring
    context.ts        # ValidationContext + Rule type
    rules/            # syntax.ts (errors), best-practices.ts, ai.ts, index.ts (registry)
    scoring.ts        # computeHealth(), weights, penalties
    validate.ts       # orchestrator: validateRobots()
  index.ts            # barrel (validateRobots, getAiCrawlerStatuses, …)
```

A **rule** is a pure `(ValidationContext) => ValidationIssue[]`. Add a rule by
writing the function and registering it in `rules/index.ts`; add its code to the
`ValidationCode` union in `src/types/validation.ts`.

## Testing

`src/features/validator/domain/*.test.ts` — every rule, AI status detection, scoring
math, ordering/counts, edge cases (empty, comments-only), and a real-world publisher
file, plus `apply-fix.test.ts` (edit application, safe/review selection, and an
end-to-end "fix resolves its own finding" check). The diff helper is covered by
`src/lib/diff.test.ts`. Coverage gate 80%.
