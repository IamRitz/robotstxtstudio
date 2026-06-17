# Internal Linking Report — Phase 19G

**Date:** 2026-06-18 · **Build:** post-Phase-19 production build. Counts are in-content links only (inside `<main>`, excluding the global header/footer/tab-bar). Total in-content internal links: **446** across 57 pages; average inbound **7.82**.

## Top pages by incoming links

These are the site's authority sinks — correctly, the homepage, the tools, and the AI hub:

| Page                     | Inbound | Depth |
| ------------------------ | ------- | ----- |
| `/`                      | 44      | 0     |
| `/analyze`               | 42      | 1     |
| `/validate`              | 37      | 1     |
| `/ai-crawlers`           | 27      | 1     |
| `/ai-crawlers-directory` | 27      | 1     |
| `/url-tester`            | 24      | 1     |
| `/generate`              | 21      | 1     |
| `/crawlers`              | 14      | 2     |
| `/robots-txt-syntax`     | 14      | 1     |
| `/gptbot-robots-txt`     | 12      | 1     |
| `/block-ai-crawlers`     | 11      | 1     |
| `/robots-txt-examples`   | 11      | 1     |

The tools and the AI hub dominate inbound, which is the desired shape: they are the conversion + topical-authority surfaces. CTAs across the content cluster funnel here.

## Pages with the weakest authority (lowest inbound)

| Page                                                             | Inbound | Depth | Status after Phase 19                                                                                                                                     |
| ---------------------------------------------------------------- | ------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/robots-txt-templates`                                          | 1       | 2     | Now the platform hub (high outbound); inbound is low but it's footer-linked + depth 2. Candidate for one more contextual inbound (e.g. from `/generate`). |
| `/compare`                                                       | 1       | 2     | Was orphaned; now linked from the Analyzer rail.                                                                                                          |
| `/terms`                                                         | 1       | ∞     | Legal, footer-tier — fine.                                                                                                                                |
| `/robots-txt-file`                                               | 2       | 2     | Foundational term page; could earn a link from `/what-is-robots-txt`.                                                                                     |
| `/robots-txt-glossary`                                           | 2       | 2     | Reference page; footer-linked. Fine.                                                                                                                      |
| `/robots-txt-validator` · `/analyzer` · `/generator` · `/tester` | 2 each  | 1     | Head-term landings; depth fixed via homepage. Inbound still modest by design (homepage + one chain link).                                                 |
| `/magento` · `/nextjs` · `/shopify` (platform)                   | 2–3     | 3     | Raised via the templates platform hub.                                                                                                                    |
| `/crawlers/<bot>` non-AI profiles                                | 2–3     | 3     | Hub-and-spoke via `/crawlers`. Healthy for long-tail spokes.                                                                                              |

## Crawler topic graph (19C)

The AI crawler cluster is a fully-connected hub-and-spoke with a sibling ring — **no isolated spokes**. Every spoke links the hub (`/ai-crawlers-directory`) and the head guide (`/block-ai-crawlers`), the hub links every spoke, and adjacent crawlers cross-link (training-bot ↔ its search-bot sibling; each AI guide → the next).

```
                         /ai-crawlers-directory  ← hub (CollectionPage + ItemList)
                         ▲  ▲  ▲  ▲  ▲  ▲  ▲  ▲
        ┌────────────────┘  │  │  │  │  │  │  └────────────────┐
        │      ┌────────────┘  │  │  │  │  └───────────┐       │
   /gptbot ⇄ /oai-searchbot   │  │  │  │   /perplexitybot     │
        │                      │  │  │  │        │             │
   /claudebot ⇄ /claude-searchbot │  │  │   /google-extended   │
                          /ccbot │  │  │        │             │
        └──────── all spokes ────┴──┴──┴── link ──────────────┘
                                  ▼
                         /block-ai-crawlers  ← head guide (HowTo); links every spoke + the tools
        also linked from: /ai-crawlers (Manager), /robots-txt-examples, footer (Solutions),
        and every spoke's "Related guides" rail.  Entry points: homepage "Popular resources"
        links the hub, block guide, GPTBot, ClaudeBot, Google-Extended, CCBot directly.
```

Measured inbound within the cluster (in-content): hub 27 (8 from spokes + 19 elsewhere), `/block-ai-crawlers` 11, `/gptbot` 12, `/claudebot` 8, `/google-extended` 7, `/ccbot` 6, `/perplexitybot` 4, `/oai-searchbot` 4, `/claude-searchbot` 4. Every spoke is reachable in ≤2 clicks and links onward to ≥3 cluster peers.

The non-AI crawler cluster mirrors this shape: `/crawlers` hub (inbound 14, outbound 20) → individual `/crawlers/<bot>` profiles, which cross-link to 1–2 peers and back to the hub.

## Suggested new contextual links (next pass, optional)

Not implemented in Phase 19 — listed for a future pass, in priority order. None are required to hit the ≤2-click goal:

1. `/generate` rail → `/robots-txt-templates` _(already present in generator guides)_; consider also surfacing the **platform** templates so platform pages reach depth 2.
2. `/what-is-robots-txt` → `/robots-txt-file` (foundational term, currently 2 inbound).
3. `/crawlers` hub → promote 2–3 highest-volume profiles (`googlebot`, `bingbot`) into a shallower slot, or link them from a depth-1 page, to pull them from 3 → 2.
4. A contextual inbound to `/robots-txt-templates` from a depth-1 educational page (it's the platform hub but only has 1 inbound itself).

## Estimated crawl-improvement opportunity

- **5 pages** moved from >2 clicks (or unreachable) to ≤2; **0 contextual orphans** remain (was 1).
- The four commercial head-term landings (`validator`/`analyzer`/`generator`/`tester`) went from depth 5–8 to **depth 1** — the largest single crawl-priority gain, since these are the pages most likely stuck in "Discovered – not indexed."
- Total in-content links **432 → 446** (+14), concentrated on the previously weakest pages rather than spread thin.
- Expected effect: faster first-crawl and indexation of the weak-signal set in `docs/INDEXATION_AUDIT.md`; re-check Search Console in ~28 days.
