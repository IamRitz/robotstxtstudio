# Technical SEO Audit — Phase 12A

> Audit + implemented changes for the technical-SEO foundation. Content clusters
> (12B–12F), the internal-linking engine (12G), and EEAT/AdSense pages (12H) build on
> this. Companion: [`PRD.md`](./PRD.md), [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md).

## Implemented in 12A

| # | Item | Status | Where |
| --- | --- | --- | --- |
| 1 | sitemap.xml | ✅ | `app/sitemap.ts` (7 routes; extended as 12B–F land) |
| 2 | robots.txt | ✅ | `app/robots.ts` (allow all; disallow `/dev`, `/api/`; sitemap + host) |
| 3 | Canonical tags | ✅ | root (`/`) + per-tool-page `alternates.canonical` |
| 4 | OpenGraph | ✅ | root metadata (`type/site/url/title/description`), inherited |
| 5 | Twitter cards | ✅ | root metadata (`summary_large_image`) |
| 6 | Structured data (JSON-LD) | ✅ | `src/lib/seo.ts` builders + `<JsonLd>` |
| 7 | Organization schema | ✅ | site-wide (root layout) |
| 8 | WebSite schema | ✅ | site-wide (root layout) |
| 9 | Breadcrumb schema | ✅ | each tool page (`BreadcrumbList`) |
| 10 | FAQ schema | 🟡 | `faqSchema()` builder ready; rendered on content pages (12B+) |
| 11 | SearchAction schema | ✅ | WebSite `potentialAction` → `/analyze?domain={search_term_string}` |

Verified live: `/robots.txt`, `/sitemap.xml`, `Organization`+`WebSite`+`SearchAction`
on `/`, canonical on `/analyze`, `BreadcrumbList` on `/validate`.

## Review findings (12–18)

**12. Crawlability** — ✅ Static prerender for marketing/tool shells; `/analyze` is
dynamic (server fetch) and indexable. `/dev` is `noindex` + disallowed. No JS-only
content (screens render a server shell + client island; headings/copy are in HTML).
Recommendation: keep API routes out of the sitemap (done).

**13. Metadata** — ✅ Title template `%s — Robots.txt Studio`; unique title +
description per tool page; keywords + canonical present. 🟡 Gap: OG/Twitter use the
default site copy on tool pages (no per-page OG image yet) → add `opengraph-image` and
per-page OG in 12B+.

**14. Heading hierarchy** — ✅ One `<h1>` per page (`PageHeader`); section labels are
styled `<span>` eyebrows (not headings) so they don't pollute the outline; cards use
`<h2>/<h3>`. Recommendation: content pages (12B+) must keep a single H1 + ordered
H2/H3.

**15. Internal linking** — 🟡 Tool↔tool links exist via the top nav, footer, and the
Home tool grid; Analyzer recommendations deep-link to Generator/AI Manager. Formal
"related resources / next page" blocks come in **12G**. Current internal links/page: 3–6
(nav+footer); target ≥3 contextual met on Home, thinner on tool screens.

**16. Image alt text** — ✅ The UI is icon-driven; all icons are decorative
(`aria-hidden`), crawler "logos" are text initials, and the favicon is `app/icon.svg`.
No content `<img>` lacking alt. Recommendation: when 12B adds diagrams, require
descriptive `alt`.

**17. Page performance** — ✅ (from Phase 11) shared baseline 102 kB; largest route
`/ai-crawlers` 133 kB. Static prerender + fonts via `next/font` (self-hosted, `swap`).
No render-blocking third-party scripts. JSON-LD is inline + tiny.

**18. Core Web Vitals** — 🟡 Expected good: no layout-shift sources (fonts use `swap`
+ `next/font` size-adjust; gauges/cards have fixed dimensions), minimal JS on
marketing pages, no hero image. Recommendation: confirm with a production Lighthouse
run post-deploy (Phase 13); add `opengraph-image` (no CWV impact) and watch CLS when
diagrams land.

## Remaining recommendations (later sub-phases)

- **Per-page OG images** + richer per-page OG/Twitter — ✅ dynamic renderer
  (`src/lib/og.tsx`) shipped in 12D for home + Crawler Directory + templates +
  glossary; remaining 12B/12C content routes still inherit the site default.
- **FAQ schema rendered** on educational/tool/template pages (12B–E).
- **Internal-linking engine** with related-resources + next-page blocks — ✅ shipped
  in 12D: computed `src/lib/internal-links.ts`, `ToolRelatedRail` on all tool pages,
  Crawler Directory hub-and-spoke, `ContentPage.extraSchema` for richer JSON-LD.
- **EEAT pages** (About, Methodology, Author, Changelog) + legal (Privacy/Terms/
  Cookies/Contact) for AdSense (12H).
- **Sitemap expansion** as content routes are added (each sub-phase appends).
- **Production Lighthouse + Search Console** verification (Phase 13).
