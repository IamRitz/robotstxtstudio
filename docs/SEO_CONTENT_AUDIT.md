# SEO Content Audit — Phase 18A

**Date:** 2026-06-13 · **Method:** every route crawled on the production build (`next build` + `next start`); title, meta description, canonical, OG/Twitter tags, JSON-LD types, main-content word count, and in-content link counts extracted from the rendered HTML. Link counts cover `<main>` only — the footer additionally links every page site-wide, so footer links are excluded to measure _contextual_ linking.

## Verdict in one paragraph

The site's SEO infrastructure is already strong: **every page has a unique title, unique description, canonical URL, OG + Twitter tags, and JSON-LD** (verified — zero missing, zero parse errors). Word counts run 400–1,200 in the content cluster; nothing qualifies as thin except `/compare`. The real gaps are **(1) the AI Crawler Directory hub doesn't link to the per-crawler deep-dive pages it summarizes** (5 in-content links vs. 19 on the `/crawlers` hub), **(2) two AI crawlers in the directory have no page anywhere** (OAI-SearchBot, Claude-SearchBot), **(3) there is no page for the cluster's head query "block AI crawlers"**, and **(4) `/compare` is a thin dead-end** (178 words, zero in-content links). Phase 18 therefore improves far more than it creates: **3 new pages, ~12 improved**.

## Inventory (44 top-level routes)

<!-- table generated from crawl data; see seo-crawl method note above -->

| URL                          | Type         | Primary keyword                        | Intent        | Words | Links (main) | Schema                                               | Title len | Class       | Notes                                                                                                           |
| ---------------------------- | ------------ | -------------------------------------- | ------------- | ----- | ------------ | ---------------------------------------------------- | --------- | ----------- | --------------------------------------------------------------------------------------------------------------- |
| /                            | Tool app     | robots.txt toolkit                     | transactional | 325   | 13           | —                                                    | 65        | **KEEP**    |                                                                                                                 |
| /analyze                     | Tool app     | robots.txt audit / crawler visibility  | transactional | 251   | 33           | BreadcrumbList, SoftwareApplication                  | 44        | **KEEP**    | Title could carry keyword (18H)                                                                                 |
| /generate                    | Tool app     | robots.txt generator                   | transactional | 401   | 6            | BreadcrumbList, SoftwareApplication                  | 40        | **KEEP**    | 18H title sharpen                                                                                               |
| /validate                    | Tool app     | robots.txt validator                   | transactional | 285   | 6            | BreadcrumbList, SoftwareApplication                  | 40        | **IMPROVE** | 18H: CTR title per brief example                                                                                |
| /url-tester                  | Tool app     | robots.txt url tester                  | transactional | 238   | 6            | BreadcrumbList, SoftwareApplication                  | 41        | **KEEP**    | 18H title sharpen                                                                                               |
| /ai-crawlers                 | Tool app     | ai crawler manager / block ai crawlers | transactional | 586   | 6            | BreadcrumbList, SoftwareApplication                  | 38        | **IMPROVE** | 18H: name GPTBot/ClaudeBot in title                                                                             |
| /explain                     | Tool app     | robots.txt explainer                   | transactional | 436   | 6            | BreadcrumbList, SoftwareApplication                  | 40        | **KEEP**    |                                                                                                                 |
| /compare                     | Tool app     | compare robots.txt                     | transactional | 178   | 0            | BreadcrumbList                                       | 38        | **IMPROVE** | Thin (178 words), 0 in-content links, no SoftwareApplication schema                                             |
| /crawlers                    | Hub          | web crawler list / crawler directory   | informational | 871   | 19           | BreadcrumbList, TechArticle, FAQPage, CollectionPage | 76        | **KEEP**    | Model hub: 19 contextual links, CollectionPage schema                                                           |
| /ai-crawlers-directory       | Hub          | ai crawler list / ai crawlers          | informational | 1225  | 5            | BreadcrumbList, TechArticle, FAQPage                 | 81        | **IMPROVE** | HUB GAP: only 5 in-content links; sections do not link to per-crawler pages; no ItemList schema; no how-to-test |
| /robots-txt-templates        | Hub          | robots.txt templates                   | transactional | 761   | 4            | BreadcrumbList, TechArticle, FAQPage, CollectionPage | 71        | **KEEP**    |                                                                                                                 |
| /robots-txt-glossary         | Hub          | robots.txt terms                       | informational | 989   | 5            | BreadcrumbList, TechArticle, FAQPage, DefinedTermSet | 73        | **KEEP**    | DefinedTermSet schema present                                                                                   |
| /what-is-robots-txt          | Guide        | what is robots.txt                     | informational | 752   | 6            | BreadcrumbList, TechArticle, FAQPage                 | 61        | **KEEP**    |                                                                                                                 |
| /robots-txt-file             | Guide        | robots.txt file                        | informational | 706   | 7            | BreadcrumbList, TechArticle, FAQPage                 | 76        | **KEEP**    |                                                                                                                 |
| /how-does-robots-txt-work    | Guide        | how does robots.txt work               | informational | 677   | 4            | BreadcrumbList, TechArticle, FAQPage                 | 45        | **KEEP**    |                                                                                                                 |
| /robots-txt-syntax           | Guide        | robots.txt syntax                      | informational | 626   | 5            | BreadcrumbList, TechArticle, FAQPage                 | 64        | **KEEP**    |                                                                                                                 |
| /robots-txt-format           | Guide        | robots.txt format                      | informational | 600   | 6            | BreadcrumbList, TechArticle, FAQPage                 | 69        | **KEEP**    |                                                                                                                 |
| /how-to-find-robots-txt      | Guide        | how to find robots.txt                 | informational | 599   | 5            | BreadcrumbList, TechArticle, FAQPage                 | 57        | **KEEP**    |                                                                                                                 |
| /how-to-read-robots-txt      | Guide        | how to read robots.txt                 | informational | 635   | 4            | BreadcrumbList, TechArticle, FAQPage                 | 49        | **KEEP**    |                                                                                                                 |
| /robots-txt-examples         | Guide        | robots.txt examples                    | informational | 577   | 4            | BreadcrumbList, TechArticle, FAQPage                 | 72        | **KEEP**    | Add link to new block-ai-crawlers page (18G)                                                                    |
| /robots-txt-sitemap          | Guide        | robots.txt sitemap                     | informational | 517   | 5            | BreadcrumbList, TechArticle, FAQPage                 | 54        | **KEEP**    |                                                                                                                 |
| /why-robots-txt-is-important | Guide        | why robots.txt is important            | informational | 677   | 5            | BreadcrumbList, TechArticle, FAQPage                 | 68        | **KEEP**    |                                                                                                                 |
| /robots-txt-seo-guide        | Guide        | robots.txt seo guide                   | informational | 696   | 5            | BreadcrumbList, TechArticle, FAQPage                 | 54        | **KEEP**    |                                                                                                                 |
| /robots-txt-checker          | Guide        | robots.txt checker                     | informational | 657   | 4            | BreadcrumbList, TechArticle, FAQPage                 | 66        | **KEEP**    |                                                                                                                 |
| /gptbot-robots-txt           | Crawler page | block gptbot                           | transactional | 669   | 5            | BreadcrumbList, TechArticle, FAQPage                 | 70        | **IMPROVE** | Add How-to-verify section + sibling links (18B/18G)                                                             |
| /claudebot-robots-txt        | Crawler page | block claudebot                        | transactional | 618   | 7            | BreadcrumbList, TechArticle, FAQPage                 | 76        | **IMPROVE** | Add How-to-verify section + sibling links (18B/18G)                                                             |
| /perplexitybot-robots-txt    | Crawler page | perplexitybot robots.txt               | transactional | 626   | 4            | BreadcrumbList, TechArticle, FAQPage                 | 63        | **IMPROVE** | Add How-to-verify section + sibling links (18B/18G)                                                             |
| /google-extended-robots-txt  | Crawler page | google-extended robots.txt             | transactional | 567   | 6            | BreadcrumbList, TechArticle, FAQPage                 | 77        | **IMPROVE** | Add How-to-verify section + sibling links (18B/18G)                                                             |
| /ccbot-robots-txt            | Crawler page | block ccbot                            | transactional | 613   | 6            | BreadcrumbList, TechArticle, FAQPage                 | 67        | **IMPROVE** | Add How-to-verify section + sibling links (18B/18G)                                                             |
| /wordpress-robots-txt        | CMS page     | wordpress robots.txt                   | informational | 647   | 5            | BreadcrumbList, TechArticle, FAQPage                 | 66        | **KEEP**    |                                                                                                                 |
| /shopify-robots-txt          | CMS page     | shopify robots.txt                     | informational | 613   | 6            | BreadcrumbList, TechArticle, FAQPage                 | 74        | **KEEP**    |                                                                                                                 |
| /magento-robots-txt          | CMS page     | magento robots.txt                     | informational | 667   | 6            | BreadcrumbList, TechArticle, FAQPage                 | 81        | **KEEP**    |                                                                                                                 |
| /nextjs-robots-txt           | CMS page     | nextjs robots.txt                      | informational | 686   | 6            | BreadcrumbList, TechArticle, FAQPage                 | 68        | **KEEP**    |                                                                                                                 |
| /robots-txt-vs-noindex       | Comparison   | robots.txt vs noindex                  | informational | 773   | 4            | BreadcrumbList, TechArticle, FAQPage                 | 66        | **KEEP**    |                                                                                                                 |
| /robots-txt-vs-sitemap       | Comparison   | robots.txt vs sitemap                  | informational | 671   | 6            | BreadcrumbList, TechArticle, FAQPage                 | 65        | **KEEP**    |                                                                                                                 |
| /robots-txt-generator        | Tool landing | robots.txt generator                   | transactional | 524   | 6            | BreadcrumbList, TechArticle, FAQPage                 | 64        | **IMPROVE** | Link to AI Crawler Directory (18B); already has FAQ schema                                                      |
| /robots-txt-validator        | Tool landing | robots.txt validator                   | transactional | 496   | 6            | BreadcrumbList, TechArticle, FAQPage                 | 69        | **IMPROVE** | Link to AI Crawler Directory (18B); already has FAQ schema                                                      |
| /robots-txt-analyzer         | Tool landing | robots.txt analyzer                    | transactional | 502   | 6            | BreadcrumbList, TechArticle, FAQPage                 | 66        | **IMPROVE** | Link to AI Crawler Directory (18B); already has FAQ schema                                                      |
| /robots-txt-tester           | Tool landing | robots.txt tester                      | transactional | 514   | 6            | BreadcrumbList, TechArticle, FAQPage                 | 65        | **IMPROVE** | Link to AI Crawler Directory (18B); already has FAQ schema                                                      |
| /about                       | Trust        | about                                  | navigational  | 433   | 10           | BreadcrumbList, AboutPage                            | 43        | **KEEP**    |                                                                                                                 |
| /methodology                 | Trust        | methodology                            | navigational  | 971   | 6            | BreadcrumbList, TechArticle                          | 67        | **KEEP**    |                                                                                                                 |
| /contact                     | Trust        | contact                                | navigational  | 247   | 7            | BreadcrumbList, ContactPage                          | 45        | **KEEP**    |                                                                                                                 |
| /privacy                     | Trust        | privacy                                | navigational  | 468   | 5            | BreadcrumbList, WebPage                              | 34        | **KEEP**    |                                                                                                                 |
| /terms                       | Trust        | terms                                  | navigational  | 451   | 4            | BreadcrumbList, WebPage                              | 36        | **KEEP**    |                                                                                                                 |

### `/crawlers/[id]` profile pages (10)

All ten render TechArticle + FAQPage + **HowTo** + BreadcrumbList schema, 420–630 words, 5–9 contextual links. All **KEEP** (two get extra related links in 18G).

| URL                           | Words | Links | Notes                                  |
| ----------------------------- | ----- | ----- | -------------------------------------- |
| /crawlers/googlebot           | 632   | 9     | strongest profile                      |
| /crawlers/bingbot             | 494   | 7     |                                        |
| /crawlers/slurp               | 423   | 6     |                                        |
| /crawlers/ahrefsbot           | 491   | 6     |                                        |
| /crawlers/semrushbot          | 430   | 5     | fewest links — add related guide (18G) |
| /crawlers/bytespider          | 539   | 7     |                                        |
| /crawlers/amazonbot           | 493   | 7     |                                        |
| /crawlers/applebot-extended   | 552   | 6     |                                        |
| /crawlers/meta-externalagent  | 489   | 7     |                                        |
| /crawlers/facebookexternalhit | 499   | 5     | fewest links — add related guide (18G) |

## Classification summary

| Class    | Count | Pages                                                                                       |
| -------- | ----- | ------------------------------------------------------------------------------------------- |
| KEEP     | 38    | all guides, CMS, comparisons, profiles, hubs except AI directory, trust pages               |
| IMPROVE  | 13    | /ai-crawlers-directory, /compare, /validate, /ai-crawlers, 5 crawler pages, 4 tool landings |
| MERGE    | 0     | no duplicate topics found                                                                   |
| REDIRECT | 0     | no broken/superseded URLs                                                                   |
| CREATE   | 3     | see gap analysis below                                                                      |

**Intent-separation check (why nothing merges):** `/robots-txt-checker` (how-to guide) vs `/robots-txt-validator` (tool landing) vs `/validate` (the tool) serve guide / landing / app intents with distinct titles and canonicals — this is the correct pattern, applied consistently across all four tools.

## Gap analysis (18C)

Validated against the directory data (`src/config/ai-crawler-directory.ts` lists 9 AI crawlers; `crawlerHref()` resolves a canonical page for 7 of them) and Search Console themes (GPTBot, ClaudeBot, PerplexityBot, AI crawler policies, robots.txt validation):

| Missing page                   | Query target                                       | Why it qualifies                                                                                                                                                                                |
| ------------------------------ | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/block-ai-crawlers`           | "block ai crawlers", "block ai bots robots.txt"    | **Head query of the entire cluster** — no page targets it; `/robots-txt-examples` mentions it in one section. Becomes the bridge between the directory (reference) and the Manager (action).    |
| `/oai-searchbot-robots-txt`    | "oai-searchbot", "chatgpt search robots.txt"       | In the AI directory with a "depends" recommendation but **no page**. The GPTBot page references OAI-SearchBot five times with nowhere to link. Completes OpenAI coverage (training vs. search). |
| `/claude-searchbot-robots-txt` | "claude-searchbot", "claude web search robots.txt" | Same gap on the Anthropic side: directory row exists, ClaudeBot page references it, no page.                                                                                                    |

Explicitly **not** created (the brief's examples mapped onto existing URLs):

- `/ai-crawlers/gptbot` etc. → already exist as `/gptbot-robots-txt` etc. (creating both would split authority; classification: IMPROVE existing).
- `/guides/how-to-block-gptbot` etc. → the existing crawler pages _are_ the how-to-block guides (H1 "Block GPTBot in robots.txt", copy-paste rules, mistakes, FAQ). A parallel `/guides/` tree would be duplicate content.
- `/tools/robots-txt-validator` etc. → already exist at `/robots-txt-validator`, `/robots-txt-analyzer`, `/robots-txt-generator`, `/robots-txt-tester` (TechArticle + FAQPage, 500+ words). No `/tools/` prefix exists site-wide; minting one would fragment URL structure.
- An AI-Manager landing page → `/ai-crawlers` (the app, SoftwareApplication schema) + `/ai-crawlers-directory` (the content hub) already split that intent; a third page would cannibalize both.

## Site-wide findings

- **Metadata:** unique titles/descriptions/canonicals/OG/Twitter on all 54 pages. A few titles exceed ~70 chars and will truncate in SERPs (`/ai-crawlers-directory` 81, `/magento-robots-txt` 81, three profile pages 86–88) — acceptable: keyword-first, brand suffix is the truncated part.
- **Structured data:** JSON-LD parses on every page (0 errors). Coverage: TechArticle (33), FAQPage (32), BreadcrumbList (53), SoftwareApplication (6), HowTo (10), CollectionPage (2), DefinedTermSet (1), AboutPage/ContactPage/WebPage (4). Gaps fixed in 18I: ItemList on the AI directory hub, SoftwareApplication on /compare.
- **Outbound links:** essentially zero authoritative citations site-wide (one external link total, in /contact). E-E-A-T improvement: crawler pages should cite operator documentation (OpenAI, Anthropic, Google, Perplexity docs). Addressed in 18B for crawler pages.
- **Orphans/dead-ends:** no true orphans (footer + sitemap registry cover everything). One contextual dead-end: `/compare` (0 in-content links). The AI directory hub is a _contextual_ near-dead-end relative to its hub role.
- **Indexability:** robots.txt disallows only `/dev` and `/api/`; sitemap covers all 54 indexable URLs from the same registries that drive the footer (structurally impossible to orphan a registered page). No noindex directives anywhere. No duplicate canonicals (54 unique).

## Phase 18 implementation plan (from this audit)

1. **18B** — AI directory hub: link every crawler row + section to its canonical page (`crawlerHref()`), add ItemList schema, add "How to test" section, cite operator docs on crawler pages.
2. **18D/E** — create the 3 pages above (full section structure, FAQ, schema, related links).
3. **18F** — tool landings: add AI Crawler Directory link to related rails.
4. **18G** — fix /compare dead-end; cross-link crawler pages ↔ new pages; weakest profile pages get one more related link.
5. **18H** — sharpen /validate and /ai-crawlers app titles (brief's examples); keep others (already keyword-first).
6. **18I** — ItemList (AI hub), SoftwareApplication (/compare); re-validate all JSON-LD.
7. **18J** — add new pages to `SEO_PAGES` registry (sitemap + footer automatic).
8. **18K** — `docs/SEO_BASELINE.md` with measured baseline; GSC fields for the owner to paste.
