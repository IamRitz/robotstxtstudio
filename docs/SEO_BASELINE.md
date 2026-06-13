# SEO Baseline — Phase 18K

**Date:** 2026-06-13 · **Build:** post-Phase-18 production build, all metrics measured by crawling every route locally (no estimates). This document is the reference point for future measurement — compare against it after the next Search Console cycle.

## Search Console metrics (owner to fill)

These cannot be read from the codebase. Paste current values from Search Console → Performance (last 28 days) and Pages (indexing):

| Metric            | Value (28d)  | Date recorded |
| ----------------- | ------------ | ------------- |
| Total impressions | `____`       | `____`        |
| Total clicks      | `____`       | `____`        |
| Average CTR       | `____`       | `____`        |
| Average position  | `____`       | `____`        |
| Indexed pages     | `____` of 57 | `____`        |
| Top 5 queries     | `____`       | `____`        |

Known query themes already surfacing (per Phase 18 brief): GPTBot, ClaudeBot, PerplexityBot, AI crawler policies, robots.txt validation, crawler lists.

## Measured site state (after Phase 18)

| Metric                                                           | Value                                                                                               |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Indexable URLs (= sitemap entries, verified 1:1 with crawl)      | **57**                                                                                              |
| HTTP 200 on all routes                                           | 57/57                                                                                               |
| Unique titles / descriptions / canonicals                        | 57/57 each, 0 duplicates                                                                            |
| OG + Twitter card tags                                           | all pages                                                                                           |
| JSON-LD parse errors                                             | **0**                                                                                               |
| Contextual internal links (in `<main>`, unique per page, summed) | **411**                                                                                             |
| Authoritative outbound citations                                 | **22** (operator docs: OpenAI, Anthropic, Google, Perplexity, Common Crawl, Amazon, Semrush, Meta…) |
| Contextual orphan pages                                          | **0**                                                                                               |
| Dead-end pages (0 in-content links)                              | **0**                                                                                               |
| robots.txt                                                       | allows all, disallows `/dev` + `/api/` only                                                         |
| noindex directives                                               | none                                                                                                |

### Structured-data coverage (pages carrying each type)

| Type           | Pages |     | Type                  | Pages |
| -------------- | ----- | --- | --------------------- | ----- |
| Organization   | 57    |     | FAQPage               | 44    |
| WebSite        | 57    |     | HowTo                 | 11    |
| BreadcrumbList | 56    |     | SoftwareApplication   | 7     |
| TechArticle    | 45    |     | CollectionPage        | 3     |
| DefinedTermSet | 1     |     | About/Contact/WebPage | 4     |

All JSON-LD validated by parsing every `application/ld+json` block on every rendered page: 0 errors.

## What Phase 18 changed

### Pages created (3)

| URL                            | Target query                                    | Words | Schema                                         |
| ------------------------------ | ----------------------------------------------- | ----- | ---------------------------------------------- |
| `/block-ai-crawlers`           | block ai crawlers / block ai bots robots.txt    | 985   | TechArticle + FAQPage + **HowTo** + Breadcrumb |
| `/oai-searchbot-robots-txt`    | oai-searchbot / chatgpt search robots.txt       | 691   | TechArticle + FAQPage + Breadcrumb             |
| `/claude-searchbot-robots-txt` | claude-searchbot / claude web search robots.txt | 671   | TechArticle + FAQPage + Breadcrumb             |

### Pages improved (13)

| URL                                              | Before → After                                                                                                                                              |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/ai-crawlers-directory`                         | links 5 → **15**, outbound 0 → **6**, +CollectionPage/ItemList schema, +How-to-test section, every crawler section now links its full guide + operator docs |
| `/compare`                                       | links 0 → **4** (dead-end fixed), +SoftwareApplication schema, CTR title                                                                                    |
| `/gptbot-robots-txt`                             | links 5 → 8, +verify section, +OpenAI docs citation, +OAI-SearchBot/block-guide links                                                                       |
| `/claudebot-robots-txt`                          | links 7 → 9, +verify section, +Anthropic docs citation, +Claude-SearchBot link                                                                              |
| `/perplexitybot-robots-txt`                      | links 4 → 6, +verify section, +Perplexity docs citation                                                                                                     |
| `/google-extended-robots-txt`                    | links 6 → 8, +verify section, +Google docs citation                                                                                                         |
| `/ccbot-robots-txt`                              | links 6 → 8, +verify section, +Common Crawl docs citation                                                                                                   |
| `/robots-txt-validator`, `/robots-txt-generator` | +AI Crawler Directory link (landing pages now all link the hub)                                                                                             |
| `/validate`                                      | title → "Robots.txt Validator — Find SEO & AI Crawler Issues"                                                                                               |
| `/ai-crawlers`                                   | title → "AI Crawler Manager — Block GPTBot, ClaudeBot & PerplexityBot"                                                                                      |
| `/robots-txt-examples`                           | +block-ai-crawlers guide link in the AI section                                                                                                             |

Plus: `/crawlers/semrushbot` and `/crawlers/facebookexternalhit` (weakest profiles) each gained a related guide link; the AI-Manager tool rail and footer now carry the new head guide.

### Internal-link delta

Comparable 44-route set: 286 → 363 contextual links (**+27%**); 411 total across all 57 routes. The AI topic cluster now forms a complete loop: directory hub ⇄ 7 per-crawler pages ⇄ head guide ⇄ Manager/Validator/Analyzer/Tester tools, with zero orphans and zero dead-ends (verified by crawling: every indexable page is reachable from in-content links and links onward contextually).

**Full directory-hub coverage (18B follow-up).** Every tool page now links the AI Crawler Directory: the `/analyze` and `/ai-crawlers` rails already did; `/generate`, `/validate`, `/url-tester`, and `/explain` gained the link via `src/lib/internal-links.ts` (it sits inside the collapsed "More tools & related guides" `<details>` on the app screens — present in the DOM for crawlers without cluttering the tool UI). Among the educational guides, the two where AI-crawler control is topically relevant — `/robots-txt-seo-guide` and `/why-robots-txt-is-important` — now link the hub as well. Pure-syntax/format guides intentionally do **not** (the link would be off-topic for those queries). Verified by crawling: all 6 tool surfaces + both target guides return the hub link.

## Internal linking map (AI cluster core)

```
                      ┌────────────────────────────┐
                      │   /ai-crawlers-directory   │  hub (CollectionPage)
                      └─┬──────────┬──────────┬────┘
        full guides ↙             │           ↘ tools
  /gptbot-robots-txt ⇄ /oai-searchbot-robots-txt   /ai-crawlers (Manager)
  /claudebot-robots-txt ⇄ /claude-searchbot-robots-txt   /analyze · /validate · /url-tester
  /perplexitybot-robots-txt · /ccbot-robots-txt · /google-extended-robots-txt
        ↘ all link ↙
      /block-ai-crawlers  ← head guide (HowTo), links every crawler page + tools
        ↑ linked from: footer (Solutions), AI-Manager rail, /robots-txt-examples,
          every crawler page's related rail, directory hub
```

## Re-measurement instructions

1. Re-run the crawl (the method is documented in `docs/SEO_CONTENT_AUDIT.md`) after content changes; compare link totals and schema coverage to this file.
2. After 28+ days, fill the Search Console table above in a dated copy; watch especially: impressions for "block ai crawlers", "oai-searchbot", "claude-searchbot"; CTR on `/validate` and `/ai-crawlers` (titles changed 2026-06-13).
