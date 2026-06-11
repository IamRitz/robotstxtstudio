# AI Crawler Manager

> The crawler-policy engine in `src/features/crawler-manager/`. Models crawler-access
> **intent** ("Allow Claude") and analyzes its impact by **orchestrating the completed
> engines** — Generator, URL Tester, Validator, Explainer. It introduces no new
> robots.txt logic and builds no robots.txt strings. Pure domain; no React/Next.
> Companion: [`PRD.md`](./PRD.md), [`GENERATOR.md`](./GENERATOR.md).

## Why it exists

The product's headline differentiator. Users answer, at a higher abstraction than
robots.txt: _which AI crawlers can access my site? which are blocked? what happens if
I change a setting? what rules get generated, and what's the impact?_

## Crawler categories

Sourced entirely from the catalog (`src/config/crawlers.ts`) — no new data:
Search Engines · AI Training · AI Search · SEO Crawlers · Social Crawlers · Data
Collection.

## Permission model

`PermissionState = "allow" | "block" | "inherit"` — intent, independent of syntax.

A **`PolicySet`** is the canonical state:

```ts
{ template?, permissions: Record<crawlerId, PermissionState>, disallowPaths, sitemapUrl?, crawlDelay? }
```

Immutable helpers: `emptyPolicySet`, `fromWebsitePreset(template)`, `setPermission`,
`setCategoryPermission`, `blockAllAiCrawlers`, `allowAllAiCrawlers`, `setDisallowPaths`,
`setSitemapUrl`. Absent permission ⇒ `inherit`.

| State     | Meaning                   | robots.txt effect                          |
| --------- | ------------------------- | ------------------------------------------ |
| `block`   | Don't let this crawler in | explicit `Disallow: /` group               |
| `allow`   | Deliberately permit       | follows the `*` baseline (intent recorded) |
| `inherit` | No opinion yet            | follows the `*` baseline                   |

`allow` and `inherit` render identically (our baseline never blocks `*`), but stay
distinct at the intent layer so only **undecided** crawlers are nudged.

## Policy generation flow

```
PolicySet → toGeneratorConfig() → GeneratorConfig → Generator → RobotsFile + text
```

`toGeneratorConfig` maps `block`→`block`, `allow`→`allow`, `inherit`→omitted. The
Generator (the canonical writer) renders the text — **the manager never constructs
robots.txt strings**.

## Impact analysis flow

`analyzePolicySet(set): PolicyImpact` composes everything:

```
toGeneratorConfig → generatePreview (Generator + Validator + Explainer)
                  → testUrl(file, "/", userAgent) per crawler (Tester)
                  → category tallies + recommendations
```

`PolicyImpact = { config, file, text, validation, explanation, crawlers, categories, recommendations }`.

- **`crawlers`** — per crawler `{ crawler, state, access, summary }`, e.g.
  _"GPTBot will be blocked from accessing your entire site."_ /
  _"PerplexityBot has no explicit rule and will inherit the default policy (currently allowed)."_
- **`categories`** — per-category `{ allowed, blocked, inherited, total }`.
- **`recommendations`** — intent-driven for undecided AI crawlers ("set Allow or
  Block for X"), plus non-AI advisories passed through from the Validator (e.g.
  missing sitemap). Decided crawlers are not nagged.

### Example — `blockAllAiCrawlers(fromWebsitePreset("blog"))`

```jsonc
{
  "categories": [
    { "category": "search-engine", "allowed": 3, "blocked": 0 },
    { "category": "ai-training", "allowed": 0, "blocked": 5 },
    { "category": "ai-search", "allowed": 0, "blocked": 3 },
    { "category": "data", "allowed": 0, "blocked": 4 },
  ],
  "crawlers": [
    {
      "id": "googlebot",
      "state": "allow",
      "access": "allowed",
      "summary": "Googlebot will be allowed to access your site (it follows the default policy).",
    },
    {
      "id": "gptbot",
      "state": "block",
      "access": "blocked",
      "summary": "GPTBot will be blocked from accessing your entire site.",
    },
    {
      "id": "perplexitybot",
      "state": "block",
      "access": "blocked",
      "summary": "PerplexityBot will be blocked from accessing your entire site.",
    },
  ],
  "recommendations": [{ "severity": "warning", "message": "No Sitemap directive found. …" }],
}
```

## Architecture

```
src/features/crawler-manager/
  domain/
    types.ts         # PermissionState, PolicySet, PolicyImpact, CrawlerImpact, …
    permissions.ts   # construct/update policy sets (presets, category/crawler setters)
    to-config.ts     # PolicyGenerator: PolicySet → GeneratorConfig
    summaries.ts     # per-crawler impact text + per-category tallies
    impact.ts        # analyzePolicySet() — composes Generator/Tester/Validator/Explainer
  index.ts           # barrel
```

It depends only on other feature **barrels** (`@/features/generator`,
`@/features/tester`) and the catalog — no deep imports, no new robots.txt logic.

## Testing

`src/features/crawler-manager/domain/*.test.ts` — policy construction (presets,
category/crawler setters, immutability), config mapping, and impact scenarios
(explicit allow, explicit block, inheritance, mixed, block-all-AI). Coverage ~99% of
`crawler-manager/domain`.

## Phase 17E — bulk workflow (shipped)

The screen is built for deciding 21 crawlers fast: every category header carries
**Allow all / Block all / Reset** (one click per group — `setCategoryPermission`),
the list has **Expand all / Collapse all**, and groups default-collapse unless
they hold active work (an explicit decision AND at least one enabled crawler;
fully-blocked groups read as "done" and collapse). Bulk decisions auto-expand
their group. After one explicit "Apply to working file", the screen live-syncs
further changes to the shared workspace (see WORKSPACE.md "Live-sync"). The
Generator mirrors all of this, plus global Allow/Block-all-crawlers actions and
a collapsible Advanced-rules section.

## Phase 15B.5 — polish shipped + Advanced Options proposal

**Shipped (15B.5):** starter templates now show an active highlight (`aria-pressed`

- brand variant) and a rationale panel (what the template does + who it's for);
  crawler categories are collapsible (`<details>`, keyboard-accessible); the generated
  output has a "Live" pulse affordance and a brief flash on change; and the two-column
  layout uses `min-w-0` grid items so there is **no horizontal scroll on mobile**.

**Proposed (NOT yet built) — Advanced Options.** The AI Manager intentionally stays
focused on per-crawler allow/block; richer rule editing lives in the Generator today.
A future "Advanced options" disclosure on this screen could add, in priority order:

1. **Sitemap helper** — an input that appends a validated `Sitemap:` line to the
   generated block (reuse the Validator's `isValidAbsoluteUrl` + the
   `sitemap-not-https` guidance so a bad/HTTP URL is caught inline).
2. **Common disallow presets** — one-tap chips for the usual non-AI blocks
   (`/admin/`, `/cart/`, `/checkout/`, `/wp-admin/`, `/search`), reusing the
   per-template `disallowPaths` already defined in `presets.ts`, with a security note
   (don't disallow secrets — see `sensitive-path-disclosure`).
3. **Crawl-delay guidance** — an optional `Crawl-delay` field that surfaces the
   existing `crawl-delay-zero` / `crawl-delay-ignored-by-google` rules as inline hints
   (Google ignores it; 0 is a no-op), so users don't add a directive that does nothing.
4. **Best-practice hints** — live, rule-backed tips wired to the Validator
   (`buildAudit`) for the generated block: declare a sitemap, keep a default group,
   add a comment. Each hint is traceable to a validator code (no new advice engine).

All four are additive and reuse existing domain logic — no new robots.txt parsing or
scoring. Sequence behind Phase 15C work; this is a proposal only.
