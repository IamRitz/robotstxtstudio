# Crawl Depth Audit — Phase 19A

**Date:** 2026-06-18 · **Build:** post-Phase-19 production build. Every figure here is measured by crawling the live production bundle on localhost — no estimates.

## Method

A script (`crawl-audit.tmp.mjs`, not committed) fetches every URL in `sitemap.xml`, extracts the in-content links (everything inside `<main>`, which excludes the global header, footer, and mobile tab bar), then computes:

- **Click-depth** — breadth-first distance from `/` following only in-content links. The footer links every cluster head site-wide, so _footer_ depth is 1 for almost everything; that is deliberately **not** what we measure. Contextual depth is what passes authority and what this audit optimises.
- **Inbound** — how many _other_ indexable pages link to a page in-content.
- **Outbound** — unique in-content internal links a page emits.

> Tool pages stream a `loading.tsx` skeleton plus resolved content, so they render two `<main>` blocks; the crawler concatenates both and de-dupes links per page. Two `<main>` / one `<h1>` / one canonical per page — confirmed, no duplicate-H1 issue.

## Summary

| Metric                                    | Before (2ec47b0)         | After (Phase 19)         |
| ----------------------------------------- | ------------------------ | ------------------------ |
| Pages reachable in ≤2 clicks (contextual) | 33 / 57                  | **38 / 57**              |
| Pages deeper than 2 clicks                | 18                       | **14**                   |
| Deepest page                              | 8 (`/robots-txt-tester`) | **3**                    |
| Contextual orphans (0 inbound)            | 1 (`/compare`)           | **0**                    |
| Content-unreachable (footer-only)         | 6                        | **5** (legal/trust only) |
| Total in-content links                    | 432                      | **446**                  |
| Avg inbound per page                      | —                        | 7.82                     |

**Depth histogram** (contextual): before `{0:1, 1:13, 2:19, 3:10, 4:2, 5:2, 6:2, 7:1, 8:1, ∞:6}` → after `{0:1, 1:22, 2:15, 3:14, ∞:5}`.

The linear chains that buried high-intent pages are gone. The four head-term tool landings dropped from depth 5–8 to **depth 1**; the AI cluster's six core pages moved from 2 → 1; the platform pages came up from 4–6 to 3.

### Pages moved from >2 (or unreachable) to ≤2 clicks

| Page                    | Depth | Inbound | Why it was deep                    | Fix                          |
| ----------------------- | ----- | ------- | ---------------------------------- | ---------------------------- |
| `/robots-txt-tester`    | 8 → 1 | 1 → 2   | tail of a `nextReading` chain      | homepage "Popular resources" |
| `/robots-txt-analyzer`  | 7 → 1 | 1 → 2   | tail of chain                      | homepage "Popular resources" |
| `/robots-txt-validator` | 6 → 1 | 1 → 2   | tail of chain                      | homepage "Popular resources" |
| `/robots-txt-generator` | 5 → 1 | 1 → 2   | tail of chain                      | homepage "Popular resources" |
| `/compare`              | ∞ → 2 | 0 → 1   | footer-only, no in-content inbound | Analyzer related-rail link   |

Six AI-cluster pages additionally moved 2 → 1 (direct homepage links): `/block-ai-crawlers`, `/gptbot-robots-txt`, `/claudebot-robots-txt`, `/ccbot-robots-txt`, `/google-extended-robots-txt`, plus the already-shallow `/ai-crawlers-directory`. Platform pages improved via the templates hub: `/magento-robots-txt` 5→3, `/nextjs-robots-txt` 6→3, `/shopify-robots-txt` 4→3, `/robots-txt-vs-sitemap` 4→3.

## Priority classification

- **P0 — must be ≤2 clicks and strongly linked** (homepage, the six tools, the AI hub + head guides, the four head-term tool landings). **All 15 now at depth ≤1.** Goal met.
- **P1 — important, target ≤3** (remaining AI crawler guides, the educational cluster, platform deep-dives, comparison pages). All ≤3.
- **P2 — long-tail spokes & utility** (individual non-AI crawler profiles behind the `/crawlers` hub; legal/trust pages). Crawler profiles sit at depth 3 behind their hub with healthy inbound (2–3); legal/trust pages are footer-tier by design.

### Full table (sorted by priority, then depth)

| Page                            | Depth (before→after) | Inbound (b→a) | Out | Priority |
| ------------------------------- | -------------------- | ------------- | --- | -------- |
| `/`                             | 0                    | 44            | 22  | P0       |
| `/ai-crawlers`                  | 1                    | 27            | 6   | P0       |
| `/ai-crawlers-directory`        | 1                    | 27            | 16  | P0       |
| `/analyze`                      | 1                    | 42            | 7   | P0       |
| `/block-ai-crawlers`            | 2→1                  | 10→11         | 16  | P0       |
| `/claudebot-robots-txt`         | 2→1                  | 7→8           | 10  | P0       |
| `/explain`                      | 1                    | 6             | 7   | P0       |
| `/generate`                     | 1                    | 21            | 7   | P0       |
| `/gptbot-robots-txt`            | 2→1                  | 11→12         | 9   | P0       |
| `/robots-txt-analyzer`          | 7→1                  | 1→2           | 7   | P0       |
| `/robots-txt-generator`         | 5→1                  | 1→2           | 8   | P0       |
| `/robots-txt-tester`            | 8→1                  | 1→2           | 7   | P0       |
| `/robots-txt-validator`         | 6→1                  | 1→2           | 8   | P0       |
| `/url-tester`                   | 1                    | 24            | 7   | P0       |
| `/validate`                     | 1                    | 37            | 7   | P0       |
| `/ccbot-robots-txt`             | 2→1                  | 5→6           | 9   | P1       |
| `/google-extended-robots-txt`   | 2→1                  | 6→7           | 9   | P1       |
| `/how-does-robots-txt-work`     | 1                    | 7             | 5   | P1       |
| `/robots-txt-examples`          | 1                    | 11            | 6   | P1       |
| `/robots-txt-seo-guide`         | 1                    | 9             | 7   | P1       |
| `/robots-txt-syntax`            | 1                    | 14            | 6   | P1       |
| `/what-is-robots-txt`           | 1                    | 6             | 6   | P1       |
| `/why-robots-txt-is-important`  | 1                    | 7             | 7   | P1       |
| `/claude-searchbot-robots-txt`  | 2                    | 4             | 8   | P1       |
| `/compare`                      | ∞→2                  | 0→1           | 4   | P1       |
| `/crawlers`                     | 2                    | 14            | 20  | P1       |
| `/how-to-find-robots-txt`       | 2                    | 4             | 6   | P1       |
| `/how-to-read-robots-txt`       | 2                    | 6             | 5   | P1       |
| `/oai-searchbot-robots-txt`     | 2                    | 4             | 8   | P1       |
| `/perplexitybot-robots-txt`     | 2                    | 4             | 7   | P1       |
| `/robots-txt-checker`           | 2                    | 4             | 5   | P1       |
| `/robots-txt-file`              | 2                    | 2             | 8   | P1       |
| `/robots-txt-format`            | 2                    | 4             | 7   | P1       |
| `/robots-txt-glossary`          | 2                    | 2             | 6   | P1       |
| `/robots-txt-sitemap`           | 2                    | 4             | 7   | P1       |
| `/robots-txt-templates`         | 2                    | 1             | 8   | P1       |
| `/magento-robots-txt`           | 5→3                  | 1→2           | 7   | P1       |
| `/nextjs-robots-txt`            | 6→3                  | 1→2           | 7   | P1       |
| `/robots-txt-vs-noindex`        | 3                    | 4             | 5   | P1       |
| `/robots-txt-vs-sitemap`        | 4→3                  | 1→2           | 7   | P1       |
| `/shopify-robots-txt`           | 4→3                  | 2→3           | 7   | P1       |
| `/wordpress-robots-txt`         | 3                    | 3             | 6   | P1       |
| `/crawlers/amazonbot`           | 2                    | 3             | 8   | P2       |
| `/crawlers/bytespider`          | 2                    | 4             | 8   | P2       |
| `/crawlers/ahrefsbot`           | 3                    | 2             | 7   | P2       |
| `/crawlers/applebot-extended`   | 3                    | 2             | 7   | P2       |
| `/crawlers/bingbot`             | 3                    | 3             | 8   | P2       |
| `/crawlers/facebookexternalhit` | 3                    | 2             | 7   | P2       |
| `/crawlers/googlebot`           | 3                    | 3             | 10  | P2       |
| `/crawlers/meta-externalagent`  | 3                    | 2             | 8   | P2       |
| `/crawlers/semrushbot`          | 3                    | 2             | 7   | P2       |
| `/crawlers/slurp`               | 3                    | 3             | 7   | P2       |
| `/about`                        | ∞                    | 4             | 10  | P2       |
| `/contact`                      | ∞                    | 4             | 7   | P2       |
| `/methodology`                  | ∞                    | 4             | 6   | P2       |
| `/privacy`                      | ∞                    | 3             | 5   | P2       |
| `/terms`                        | ∞                    | 1             | 4   | P2       |

## Remaining items (deliberate, not defects)

1. **Eight non-AI crawler profiles at depth 3** (`/crawlers/<bot>`) — reachable via the `/crawlers` hub (depth 2) with 2–3 inbound links each. Acceptable: these are long-tail spokes and the hub-and-spoke shape is correct. Promoting them to ≤2 would mean putting the `/crawlers` directory on the homepage, which the AI directory already covers for the higher-value bots.
2. **Four platform pages + two comparison guides at depth 3** — improved from 4–6; reachable via the templates hub and the sitemap/noindex guides. P1, monitor.
3. **Five legal/trust pages content-unreachable (footer-only)** — `/about`, `/contact`, `/methodology`, `/privacy`, `/terms`. Footer-tier by design; each is one click from every page via the footer. Not promoted to in-content links on purpose.

## Re-measurement

Re-run the crawl after any linking change and compare the depth histogram and the "moved to ≤2" list against this file. The method is identical to `docs/SEO_CONTENT_AUDIT.md`.
