# Robots.txt Explainer

> The explanation engine in `src/features/explainer/`. Turns a
> [`RobotsFile`](./PARSER.md) (and optionally a [`ValidationResult`](./VALIDATOR.md)
> and AI crawler statuses) into a deterministic, plain-English `ExplanationResult`.
> No LLM, no UI. Companion: [`PRD.md`](./PRD.md).

## Why it exists

Robots.txt Studio differentiates on **understanding**, not editing. The Explainer is
the human-readable layer that powers the Explainer screen, Validator recommendations,
Analyzer findings, AI Manager copy, SEO landing pages, and educational content —
readable by non-experts (bloggers, founders) without robots.txt knowledge.

## Inputs and output

```
explainRobots(file, { validation?, aiStatuses? }) → ExplanationResult
```

- `file: RobotsFile` (required).
- `validation?: ValidationResult` — when supplied, drives advisory notes and the
  score line in the summary.
- `aiStatuses?: AiCrawlerStatus[]` — defaults to the Validator's
  `getAiCrawlerStatuses(file)` (reused, not reimplemented).

`ExplanationResult = { summary, groups, aiCrawlers, sitemaps, notes }`.

## Explanation architecture

Deterministic **template composition** over the AST — four pure generators:

| Generator | File | Produces |
| --- | --- | --- |
| Group explainer | `group-explainer.ts` | `GroupExplanation[]` — per-group summary + per-rule bullets + access posture |
| AI explainer | `ai-explainer.ts` | `AiCrawlerExplanation[]` — purpose, access, source, recommendation |
| Sitemap notes | `notes.ts` | plain-English sitemap presence/absence |
| Summary + notes | `summary.ts`, `notes.ts` | overview paragraph + advisory notes |

Shared helpers:

- `access.ts` — `classifyAccess(rules)` → `allowed` / `blocked` / `partial`
  (lightweight, group-level; precise per-URL logic is the Tester's job).
- `humanize.ts` — `friendlyUserAgent`, `humanizeUserAgents` (subject + plurality),
  `isAre`, `describePath`.
- `constants.ts` — `CRAWLER_LABELS` and `AI_PURPOSES` (copy data).

```
src/features/explainer/
  domain/
    constants.ts        # crawler labels + AI purposes (copy)
    humanize.ts         # UA/path phrasing + agreement
    access.ts           # classifyAccess()
    group-explainer.ts  # explainGroup()
    ai-explainer.ts     # explainAiCrawlers()
    notes.ts            # explainSitemaps() + buildNotes()
    summary.ts          # buildSummary()
    explain.ts          # orchestrator: explainRobots()
  index.ts              # barrel
```

## Templates

Templates are plain functions returning strings, driven by structured facts:

- **Group summary** — from access posture + humanized subject:
  - blocked: `{subject} {is/are} blocked from your entire site.`
  - block + exceptions: `… blocked from your site, except: {allowed paths}.`
  - specific blocks: `… allowed, but blocked from: {paths}.`
  - allowed: `… allowed to access your entire site.`
- **Rule bullets** — e.g. `Blocked from /admin/.`, `Allowed to access /public/.`,
  `Asked to wait 5 seconds between requests.`
- **AI status** — composed from `configurationSource` × `access`:
  - explicit blocked → `OpenAI's GPTBot is blocked from your entire site.`
  - inherited → `… has no rule of its own, so it follows your default settings — it is currently {allowed|blocked|partially blocked}.`
  - none → `… isn't mentioned and there's no default rule, so it can freely access your entire site.`

## Severity mapping

The Explainer **translates, it does not re-judge**. It maps a curated set of
`ValidationCode`s to friendly notes (e.g. `conflicting-rules` → "some rules conflict;
crawlers may behave unpredictably"), aggregates syntax-error codes into one note, and
folds the health score into the summary. Authoritative severity stays in the
Validator.

## AI crawler explanation strategy

For each major AI crawler (`MAJOR_AI_CRAWLERS`: GPTBot, ClaudeBot, PerplexityBot,
CCBot, Google-Extended), the explainer reports:

- **Purpose** — from `AI_PURPOSES` (what the crawler does).
- **Access** — computed from the crawler's *effective* group: its own (explicit),
  the wildcard group (inherited), or default-allow (none).
- **Configuration source** — `explicit` / `inherited-default` / `none`.
- **Recommendation** — attached whenever the policy is not explicit.

## Extensibility model

- **Cover a new crawler:** add it to `MAJOR_AI_CRAWLERS` (Validator) + a purpose to
  `AI_PURPOSES`; a label to `CRAWLER_LABELS` for nicer prose.
- **Improve phrasing:** edit the template functions; helpers keep agreement correct.
- **Add a note:** extend `NOTE_BY_CODE` / `SYNTAX_CODES` in `notes.ts`.
- **Reuse elsewhere:** `explainGroup`, `explainAiCrawlers`, and `classifyAccess` are
  exported from the barrel for the Analyzer/AI Manager.

## Sample output

Input:

```text
# example.com
User-agent: *
Disallow: /admin/

User-agent: GPTBot
Disallow: /

Sitemap: https://example.com/sitemap.xml
```

`ExplanationResult` (abridged):

```jsonc
{
  "summary": "By default, crawlers are allowed, with some sections blocked. 1 crawler has its own specific rules. 1 of 5 major AI crawlers are blocked. A sitemap is declared. It scores 90/100 (good): 0 errors, 0 warnings and 4 recommendations.",
  "groups": [
    { "userAgents": ["*"], "access": "partial", "summary": "all crawlers are allowed, but blocked from: /admin/.", "bullets": ["Blocked from /admin/."] },
    { "userAgents": ["GPTBot"], "access": "blocked", "summary": "OpenAI's GPTBot is blocked from your entire site.", "bullets": ["Blocked from your entire site (/)."] }
  ],
  "aiCrawlers": [
    { "id": "gptbot", "owner": "OpenAI", "purpose": "trains OpenAI's models…", "access": "blocked", "configurationSource": "explicit", "statusText": "OpenAI's GPTBot is blocked from your entire site." },
    { "id": "claudebot", "access": "partial", "configurationSource": "inherited-default", "statusText": "Anthropic's ClaudeBot … follows your default settings — it is currently partially blocked.", "recommendation": "Add an explicit Allow or Disallow for ClaudeBot…" }
  ],
  "sitemaps": ["A sitemap is declared at https://example.com/sitemap.xml, which helps search engines find your pages."],
  "notes": []
}
```

## Testing

`src/features/explainer/domain/*.test.ts` — common files, AI-focused files, empty &
comments-only, misconfigured files (with validation), and large files; plus focused
`classifyAccess` and group-explainer tests. Coverage: ~98% of `explainer/domain`
(gate 80%).
