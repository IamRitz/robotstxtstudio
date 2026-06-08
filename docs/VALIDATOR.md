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

## Scoring methodology

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

`src/features/validator/domain/*.test.ts` — 39 tests: every rule, AI status
detection, scoring math, ordering/counts, edge cases (empty, comments-only), and a
real-world publisher file. Coverage: 100% of `validator/domain` (≈99% incl. rules);
gate 80%.
