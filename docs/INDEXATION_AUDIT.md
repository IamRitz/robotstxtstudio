# Indexation Signal Audit — Phase 19E

> **Superseded (2026-10-19)** by [`SEO_RECOVERY_2026-10.md`](./SEO_RECOVERY_2026-10.md). The "discovered" backlog stayed flat after the Phase 19 linking work, and several URLs below were consolidated with 308 redirects.

**Date:** 2026-06-18 · **Build:** post-Phase-19 production build. Signals read from the rendered HTML of every sitemap URL. Evidence only — no invented issues.

## Context

Search Console reported ~46 URLs in **"Discovered – currently not indexed"** and many with **Last crawl: N/A**. That status almost always means Google found the URL but hasn't prioritised crawling it — typically because the page is weakly linked (low internal authority / deep), not because of a technical block. This audit confirms there is **no technical reason** any page is being skipped, and identifies the pages whose _internal signals_ were weakest (now addressed in 19A/B/D).

> The actual per-URL "not indexed" list lives in Search Console and cannot be read from the codebase. Cross-reference the GSC export against the "weak-signal" set below; they should overlap heavily, and the 19A/B linking changes target exactly those.

## Technical indexability — all clear

Measured across all **57** sitemap URLs:

| Signal                         | Result                                                                              |
| ------------------------------ | ----------------------------------------------------------------------------------- |
| HTTP status                    | **57/57 → 200**                                                                     |
| Self-referencing canonical     | **57/57** (each canonical = its own URL)                                            |
| `robots` meta                  | **0 noindex** — every page indexable                                                |
| In `sitemap.xml`               | **57/57** (sitemap is generated from the same registries)                           |
| JSON-LD parse errors           | **0**                                                                               |
| Structured-data types per page | 2–6 (Organization + WebSite everywhere; plus Breadcrumb/TechArticle/FAQ/HowTo/etc.) |
| `robots.txt`                   | allows all; disallows only `/dev` and `/api/`                                       |

There is no canonical conflict, no accidental `noindex`, no sitemap omission, and no broken structured data anywhere. **Indexation friction is an internal-linking / crawl-priority problem, not a technical one** — which is what Phase 19 targets.

## Word count / thin-content check

No editorial page is thin. The lowest counts are the **tool screens**, which are interactive apps, not articles, and are intentionally short on body copy:

| Page          | Words | Note                                              |
| ------------- | ----- | ------------------------------------------------- |
| `/analyze`    | 148   | Tool screen — content is the dynamic audit report |
| `/compare`    | 223   | Tool screen — content is the dynamic diff         |
| `/url-tester` | 247   | Tool screen                                       |
| `/validate`   | 293   | Tool screen                                       |
| `/contact`    | 240   | Utility page                                      |

Every article/guide page is **419–1376 words** with FAQ + TechArticle schema. No thin-content or duplicate-intent pages were found (the Phase 18 content audit already merged/avoided duplicates; `/robots-txt-checker` vs `/robots-txt-validator` etc. target distinct queries and differ in copy).

## Weak-signal pages (most likely to be the "Discovered – not indexed" set)

These had the fewest inbound internal links and/or the greatest click-depth **before** Phase 19 — the profile Google de-prioritises. The 19A/B/D changes raise each one's internal signal:

| Page                     | Before depth / inbound | After depth / inbound | Action taken                    |
| ------------------------ | ---------------------- | --------------------- | ------------------------------- |
| `/robots-txt-tester`     | 8 / 1                  | **1 / 2**             | Homepage "Popular resources"    |
| `/robots-txt-analyzer`   | 7 / 1                  | **1 / 2**             | Homepage "Popular resources"    |
| `/robots-txt-validator`  | 6 / 1                  | **1 / 2**             | Homepage "Popular resources"    |
| `/robots-txt-generator`  | 5 / 1                  | **1 / 2**             | Homepage "Popular resources"    |
| `/nextjs-robots-txt`     | 6 / 1                  | **3 / 2**             | Templates platform hub          |
| `/magento-robots-txt`    | 5 / 1                  | **3 / 2**             | Templates platform hub          |
| `/robots-txt-vs-sitemap` | 4 / 1                  | **3 / 2**             | Link from `/robots-txt-sitemap` |
| `/compare`               | ∞ / 0                  | **2 / 1**             | Analyzer related rail           |
| `/shopify-robots-txt`    | 4 / 2                  | **3 / 3**             | Templates platform hub          |

Still low-inbound but technically fine and reachable (monitor, not blockers): `/robots-txt-templates` (1), `/robots-txt-file` (2), `/robots-txt-glossary` (2), and the individual `/crawlers/<bot>` profiles (2–3 each, behind the `/crawlers` hub).

## Per-URL signal table

| Page                            | HTTP | Words | Canonical | robots    | Schema | Inbound |
| ------------------------------- | ---- | ----- | --------- | --------- | ------ | ------- |
| `/`                             | 200  | 437   | self ✓    | indexable | 2      | 44      |
| `/about`                        | 200  | 426   | self ✓    | indexable | 4      | 4       |
| `/ai-crawlers`                  | 200  | 571   | self ✓    | indexable | 4      | 27      |
| `/ai-crawlers-directory`        | 200  | 1376  | self ✓    | indexable | 6      | 27      |
| `/analyze`                      | 200  | 148   | self ✓    | indexable | 4      | 42      |
| `/block-ai-crawlers`            | 200  | 977   | self ✓    | indexable | 6      | 11      |
| `/ccbot-robots-txt`             | 200  | 678   | self ✓    | indexable | 5      | 6       |
| `/claude-searchbot-robots-txt`  | 200  | 655   | self ✓    | indexable | 5      | 4       |
| `/claudebot-robots-txt`         | 200  | 690   | self ✓    | indexable | 5      | 8       |
| `/compare`                      | 200  | 223   | self ✓    | indexable | 4      | 1       |
| `/contact`                      | 200  | 240   | self ✓    | indexable | 4      | 4       |
| `/crawlers`                     | 200  | 853   | self ✓    | indexable | 6      | 14      |
| `/crawlers/ahrefsbot`           | 200  | 490   | self ✓    | indexable | 6      | 2       |
| `/crawlers/amazonbot`           | 200  | 484   | self ✓    | indexable | 6      | 3       |
| `/crawlers/applebot-extended`   | 200  | 545   | self ✓    | indexable | 6      | 2       |
| `/crawlers/bingbot`             | 200  | 490   | self ✓    | indexable | 6      | 3       |
| `/crawlers/bytespider`          | 200  | 534   | self ✓    | indexable | 6      | 4       |
| `/crawlers/facebookexternalhit` | 200  | 503   | self ✓    | indexable | 6      | 2       |
| `/crawlers/googlebot`           | 200  | 625   | self ✓    | indexable | 6      | 3       |
| `/crawlers/meta-externalagent`  | 200  | 483   | self ✓    | indexable | 6      | 2       |
| `/crawlers/semrushbot`          | 200  | 441   | self ✓    | indexable | 6      | 2       |
| `/crawlers/slurp`               | 200  | 419   | self ✓    | indexable | 6      | 3       |
| `/explain`                      | 200  | 435   | self ✓    | indexable | 4      | 6       |
| `/generate`                     | 200  | 408   | self ✓    | indexable | 4      | 21      |
| `/google-extended-robots-txt`   | 200  | 634   | self ✓    | indexable | 5      | 7       |
| `/gptbot-robots-txt`            | 200  | 741   | self ✓    | indexable | 5      | 12      |
| `/how-does-robots-txt-work`     | 200  | 670   | self ✓    | indexable | 5      | 7       |
| `/how-to-find-robots-txt`       | 200  | 579   | self ✓    | indexable | 5      | 4       |
| `/how-to-read-robots-txt`       | 200  | 626   | self ✓    | indexable | 5      | 6       |
| `/magento-robots-txt`           | 200  | 659   | self ✓    | indexable | 5      | 2       |
| `/methodology`                  | 200  | 963   | self ✓    | indexable | 4      | 4       |
| `/nextjs-robots-txt`            | 200  | 661   | self ✓    | indexable | 5      | 2       |
| `/oai-searchbot-robots-txt`     | 200  | 677   | self ✓    | indexable | 5      | 4       |
| `/perplexitybot-robots-txt`     | 200  | 692   | self ✓    | indexable | 5      | 4       |
| `/privacy`                      | 200  | 464   | self ✓    | indexable | 4      | 3       |
| `/robots-txt-analyzer`          | 200  | 494   | self ✓    | indexable | 5      | 2       |
| `/robots-txt-checker`           | 200  | 650   | self ✓    | indexable | 5      | 4       |
| `/robots-txt-examples`          | 200  | 584   | self ✓    | indexable | 5      | 11      |
| `/robots-txt-file`              | 200  | 702   | self ✓    | indexable | 5      | 2       |
| `/robots-txt-format`            | 200  | 594   | self ✓    | indexable | 5      | 4       |
| `/robots-txt-generator`         | 200  | 530   | self ✓    | indexable | 5      | 2       |
| `/robots-txt-glossary`          | 200  | 985   | self ✓    | indexable | 6      | 2       |
| `/robots-txt-seo-guide`         | 200  | 702   | self ✓    | indexable | 5      | 9       |
| `/robots-txt-sitemap`           | 200  | 522   | self ✓    | indexable | 5      | 4       |
| `/robots-txt-syntax`            | 200  | 625   | self ✓    | indexable | 5      | 14      |
| `/robots-txt-templates`         | 200  | 770   | self ✓    | indexable | 6      | 1       |
| `/robots-txt-tester`            | 200  | 511   | self ✓    | indexable | 5      | 2       |
| `/robots-txt-validator`         | 200  | 502   | self ✓    | indexable | 5      | 2       |
| `/robots-txt-vs-noindex`        | 200  | 767   | self ✓    | indexable | 5      | 4       |
| `/robots-txt-vs-sitemap`        | 200  | 658   | self ✓    | indexable | 5      | 2       |
| `/shopify-robots-txt`           | 200  | 600   | self ✓    | indexable | 5      | 3       |
| `/terms`                        | 200  | 448   | self ✓    | indexable | 4      | 1       |
| `/url-tester`                   | 200  | 247   | self ✓    | indexable | 4      | 24      |
| `/validate`                     | 200  | 293   | self ✓    | indexable | 4      | 37      |
| `/what-is-robots-txt`           | 200  | 748   | self ✓    | indexable | 5      | 6       |
| `/why-robots-txt-is-important`  | 200  | 681   | self ✓    | indexable | 5      | 7       |
| `/wordpress-robots-txt`         | 200  | 641   | self ✓    | indexable | 5      | 3       |

## Recommendation

1. **Re-submit the sitemap** in Search Console after deploy, and use "Validate fix" on the "Discovered – not indexed" group — the internal-link increases give Google a reason to crawl them.
2. **Re-check in ~28 days.** Expect the weak-signal pages above to move from "Discovered" to "Crawled" / "Indexed" first, since their internal signal changed the most.
3. No `noindex`, canonical, or robots.txt change is needed — all indexability signals are already correct.
