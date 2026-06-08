# AI Crawler Manager

> The crawler-policy engine in `src/features/crawler-manager/`. Models crawler-access
> **intent** ("Allow Claude") and analyzes its impact by **orchestrating the completed
> engines** — Generator, URL Tester, Validator, Explainer. It introduces no new
> robots.txt logic and builds no robots.txt strings. Pure domain; no React/Next.
> Companion: [`PRD.md`](./PRD.md), [`GENERATOR.md`](./GENERATOR.md).

## Why it exists

The product's headline differentiator. Users answer, at a higher abstraction than
robots.txt: *which AI crawlers can access my site? which are blocked? what happens if
I change a setting? what rules get generated, and what's the impact?*

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

| State | Meaning | robots.txt effect |
| --- | --- | --- |
| `block` | Don't let this crawler in | explicit `Disallow: /` group |
| `allow` | Deliberately permit | follows the `*` baseline (intent recorded) |
| `inherit` | No opinion yet | follows the `*` baseline |

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
  *"GPTBot will be blocked from accessing your entire site."* /
  *"PerplexityBot has no explicit rule and will inherit the default policy (currently allowed)."*
- **`categories`** — per-category `{ allowed, blocked, inherited, total }`.
- **`recommendations`** — intent-driven for undecided AI crawlers ("set Allow or
  Block for X"), plus non-AI advisories passed through from the Validator (e.g.
  missing sitemap). Decided crawlers are not nagged.

### Example — `blockAllAiCrawlers(fromWebsitePreset("blog"))`

```jsonc
{
  "categories": [
    { "category": "search-engine", "allowed": 3, "blocked": 0 },
    { "category": "ai-training",   "allowed": 0, "blocked": 5 },
    { "category": "ai-search",     "allowed": 0, "blocked": 3 },
    { "category": "data",          "allowed": 0, "blocked": 4 }
  ],
  "crawlers": [
    { "id": "googlebot",     "state": "allow", "access": "allowed", "summary": "Googlebot will be allowed to access your site (it follows the default policy)." },
    { "id": "gptbot",        "state": "block", "access": "blocked", "summary": "GPTBot will be blocked from accessing your entire site." },
    { "id": "perplexitybot", "state": "block", "access": "blocked", "summary": "PerplexityBot will be blocked from accessing your entire site." }
  ],
  "recommendations": [
    { "severity": "warning", "message": "No Sitemap directive found. …" }
  ]
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
