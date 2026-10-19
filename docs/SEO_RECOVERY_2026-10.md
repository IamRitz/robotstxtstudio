# SEO & Indexing Recovery — October 2026

**Prepared:** 2026-10-19 · **Branch:** `seo-recovery-2026-10` · **Deployed:** 2026-10-19 11:04 UTC, merge commit `530848e` (§8a)
**Supersedes:** `INDEXATION_AUDIT.md` (Phase 19E). Older SEO docs describe June 2026 state.

This sprint consolidates duplicate-intent URLs, fixes the indexing signals that were actually
wrong, makes the canonical tool pages explain themselves in server HTML, and corrects
crawler-policy claims. Google decides what gets crawled and indexed. Nothing here
guarantees that any URL will be indexed or will rank.

---

## 1. What likely caused friction, and what is still unknown

**Evidence-backed (fixed in code):**

| Finding | Evidence | Fix |
| --- | --- | --- |
| Canonical/title/description were missing from `<head>` on `/analyze`, `/generate`, `/ai-crawlers` for Googlebot | Production HTML on 2026-10-19: with a Googlebot UA, `<title>` and `rel=canonical` appear ~36 KB into `<body>`. Next 15.5 streams metadata for clients not on its "HTML-limited" list, and Google honours `rel=canonical` only in `<head>`. | `htmlLimitedBots: /.*/` in `next.config.ts` puts metadata in `<head>` for every UA. |
| Sitemap `lastmod` was a build timestamp, identical on all 57 URLs (`2026-06-17T21:31:13Z`), plus ignored `changefreq`/`priority` | `curl /sitemap.xml` | Real per-page dates in `src/config/page-dates.ts`, taken from git history. changefreq/priority removed. |
| 9 near-duplicate URLs split one intent across two pages | e.g. `/validate` (3,830 impressions) vs `/robots-txt-validator` (a marketing page for the same tool); `/robots-txt-format` vs `/robots-txt-syntax` (1,338 impressions) | Content merged into the stronger page; source 308s there (§3). |
| Google-Extended / Applebot-Extended were classed as "AI search crawlers". OAI-SearchBot / Claude-SearchBot were missing from the manager/generator/analyzer catalog. | `src/config/crawlers.ts` vs operator docs (§6) | New `ai-control` category; the two search bots added. |
| The analyzer score fell when a site deliberately blocked AI training bots | `0.5·search + 0.2·AI + 0.3·health` | The score is now search-only: `0.7·search + 0.3·health`. AI search and AI training are shown separately and not scored. |
| A failed robots.txt fetch (timeout/5xx/429) rendered as a 100/100 "allow all" report | `report.ts` analyzed failures as an empty file | `policyStatus: "unverified"` → "Policy unknown", with no score and no access matrix. |
| 401/403/410 were reported as fetch errors, although RFC 9309 and Google treat any 4xx except 429 as "no robots.txt" | `fetch-robots.ts` | 4xx (not 429) → `not-found` (allow-all). 429/5xx → unknown. |
| Rules served with the wrong Content-Type were discarded and assumed allow-all | `fetch-robots.ts` | The body is kept and parsed, as crawlers do. Only an HTML page counts as "no rules". |
| The root layout set `canonical: "/"` site-wide (a latent trap for any page without its own) | `layout.tsx` | Moved to the homepage. A test enforces a self-canonical on every page. |

**Plausible but not provable from code:**

- **Young site, low crawl demand.** All 57 URLs went live between 2026-06-08 and 06-18. I
  found no evidence of external links. "Discovered – currently not indexed" with no crawl
  date means Google found the URLs and chose not to fetch them yet. That pattern is
  common for new sites whose page count runs ahead of their perceived value.
- **The Phase 19 linking work (June 18) helped some pages, then stalled.** *(Corrected
  2026-10-19 using the June 17 drilldown export.)* The backlog fell from 46 (June 17) to
  37. The 9 URLs that left were `/ai-crawlers-directory`, `/gptbot-robots-txt`,
  `/claudebot-robots-txt`, `/google-extended-robots-txt`, `/perplexitybot-robots-txt`,
  `/robots-txt-examples`, `/compare`, `/robots-txt-validator`, and
  `/robots-txt-analyzer`. All 9 now show impressions, so they were indexed. Six of
  them had just received homepage links. The backlog has been flat at 37 since Aug 22. So
  homepage links helped the pages they pointed to, but don't scale to every URL. This
  sprint therefore reduces the URL count and strengthens pages, and gives the
  platform guides homepage links.
- **The impressions fall** (3,024 → 1,384 per 28 days) is concentrated at deep positions
  (~75–80, i.e. result page 8). Clicks went the other way: 1 click in Jul 17–Aug 13, 0 in
  Aug 22–Sep 18, and 5 of the 6 total in Sep 19–Oct 16. Daily impressions halved around
  Sep 1 and again around Sep 17, while clicks didn't fall. That fits fewer counted
  deep-page impressions (e.g. changes in automated SERP fetching) better than fewer real
  searchers — but it's a hypothesis the exports can't prove. **So judge this release on
  clicks, indexing, and top-20 impressions, not raw impressions.**

**Unknown / needs external evidence:** server logs (did Googlebot ever request these
URLs?), backlinks, the identities of the 1 crawled-not-indexed URL and the 3
page-with-redirect URLs, and the GSC status of `/robots-txt-validator` and
`/robots-txt-analyzer` (not in the 37 list; may be indexed).

**Production setting, not code:** `https://www.robotstxtstudio.com/` → apex is a **307
(temporary)** redirect, and `http://www.` → `https://www.` → apex is a 2-hop chain. Both are
Vercel domain settings (see the deployment checklist).

---

## 2. The 37 "Discovered – currently not indexed" URLs

Legend: **KEEP + IMPROVE** = unique and strategic · **CONSOLIDATE + 308** = duplicate intent
(merged, permanent redirect) · **KEEP UTILITY** = useful, not an acquisition target ·
**INVESTIGATE** = not enough evidence; re-evaluate at week 8. No URL got `noindex`.

| # | URL | Decision | Changed now | Why |
| --- | --- | --- | --- | --- |
| 1 | `/about` | KEEP UTILITY | — | Trust page. |
| 2 | `/ccbot-robots-txt` | KEEP + IMPROVE | — | Distinct crawler with "block AI bots" demand. Content is fine; deeper edits deferred. |
| 3 | `/contact` | KEEP UTILITY | — | Trust page. |
| 4 | `/crawlers/ahrefsbot` | KEEP UTILITY | link | Distinct entity with verification details. Its link now points to the SEO guide. |
| 5 | `/crawlers/amazonbot` | KEEP + IMPROVE | schema | AI-adjacent crawler with real policy questions. |
| 6 | `/crawlers/applebot-extended` | KEEP + IMPROVE | yes | Now labelled "AI usage control (no crawler)". |
| 7 | `/crawlers/bingbot` | KEEP UTILITY | schema | Reference. Bing's own docs will outrank it. |
| 8 | `/crawlers/bytespider` | KEEP + IMPROVE | schema | AI training crawler with blocking demand. |
| 9 | `/crawlers/facebookexternalhit` | KEEP UTILITY | schema | Explains the link-preview vs Meta AI distinction. |
| 10 | `/crawlers/googlebot` | KEEP UTILITY | schema | Reference. Google's docs dominate the query. |
| 11 | `/crawlers/meta-externalagent` | KEEP + IMPROVE | schema | AI training crawler with blocking demand. |
| 12 | `/crawlers/semrushbot` | KEEP UTILITY | link | Reference. |
| 13 | `/crawlers/slurp` | INVESTIGATE | schema | Yahoo Slurp has little remaining relevance. If it is still not crawled at week 8, fold it into the `/crawlers` hub row. No single redirect target fits today. |
| 14 | `/explain` | KEEP UTILITY | — | Working tool. |
| 15 | `/how-does-robots-txt-work` | KEEP + IMPROVE | link | Unique (group selection, precedence, status codes). Now linked from the URL Tester guide. |
| 16 | `/how-to-find-robots-txt` | KEEP + IMPROVE | link | Distinct task intent. Linked from what-is and the analyzer guide. |
| 17 | `/how-to-read-robots-txt` | INVESTIGATE | — | Overlaps how-it-works and the Explainer. Candidate merge into `/how-does-robots-txt-work` if still undiscovered at week 8. |
| 18 | `/magento-robots-txt` | KEEP + IMPROVE | link | Platform guide. Now linked from the homepage. |
| 19 | `/methodology` | KEEP UTILITY | yes | Trust page. Updated to the new scoring and fetch semantics. |
| 20 | `/nextjs-robots-txt` | KEEP + IMPROVE | link | Platform guide. Homepage link. |
| 21 | `/privacy` | KEEP UTILITY | — | Legal. |
| 22 | `/robots-txt-checker` | CONSOLIDATE → `/validate` | yes | "Checker" and "validator" are one intent, and the validator also fetches live files. The checker-vs-validator FAQ moved to `/validate`. |
| 23 | `/robots-txt-file` | CONSOLIDATE → `/what-is-robots-txt` | yes | Location, contents, and creation steps merged into the indexed definition guide. |
| 24 | `/robots-txt-format` | CONSOLIDATE → `/robots-txt-syntax` | yes | Merged as a "File format, encoding, and delivery" section. |
| 25 | `/robots-txt-generator` | CONSOLIDATE → `/generate` | yes | Marketing copy for the tool. The guide now renders on `/generate`. |
| 26 | `/robots-txt-glossary` | KEEP UTILITY | — | Definitions hub. |
| 27 | `/robots-txt-seo-guide` | KEEP + IMPROVE | yes | Absorbed "why robots.txt is important" (crawl budget, when you need one, silent failures). |
| 28 | `/robots-txt-sitemap` | KEEP + IMPROVE | yes | Absorbed "robots.txt vs sitemap". |
| 29 | `/robots-txt-templates` | KEEP UTILITY | — | Hub. |
| 30 | `/robots-txt-tester` | CONSOLIDATE → `/url-tester` | yes | Marketing copy for the tool. The guide now renders on `/url-tester`. |
| 31 | `/robots-txt-vs-noindex` | KEEP + IMPROVE | link | High-value distinction. Now linked from the validator guide and the SEO guide. |
| 32 | `/robots-txt-vs-sitemap` | CONSOLIDATE → `/robots-txt-sitemap` | yes | Two pages about the same pair of concepts. |
| 33 | `/shopify-robots-txt` | KEEP + IMPROVE | link | Platform guide. Homepage link. |
| 34 | `/terms` | KEEP UTILITY | — | Legal. |
| 35 | `/url-tester` | KEEP + IMPROVE | yes | Canonical "robots.txt tester". Has a server-rendered guide and 5 worked examples verified by tests. |
| 36 | `/why-robots-txt-is-important` | CONSOLIDATE → `/robots-txt-seo-guide` | yes | See #27. |
| 37 | `/wordpress-robots-txt` | KEEP + IMPROVE | link | Platform guide. Homepage link. |

Totals: 7 consolidated, 15 keep + improve, 13 keep utility, 2 investigate.

**Two consolidations outside the 37:** `/robots-txt-validator` → `/validate` and
`/robots-txt-analyzer` → `/analyze`. These are the same tool-landing pattern. Their GSC
status is unknown, so check them before deploying (checklist step 1).

**Why the `/crawlers/[id]` pages stay separate:** each covers a distinct crawler, with
editorial content specific to that crawler (verification method, operator docs, honouring
behaviour, recommendation). They aren't one template with names swapped. Merging them into
the hub would lose that detail. Only `/crawlers/slurp` is weak (see #13).

---

## 3. Architecture after the change

- **Canonical URLs:** 48, all in `/sitemap.xml` (57 before). Every page declares a
  self-referencing canonical, and the root layout declares none.
- **Redirects:** 9 permanent 308s in `src/config/redirects.ts`, used by
  `next.config.ts`, the tests, and the smoke audit. No chains, no redirect source in the
  sitemap, no internal link to a redirect source.
- **Sitemap policy:** canonical 200 URLs only, with `lastmod` = last real content change
  (`src/config/page-dates.ts`; `pnpm seo:dates` flags drift). No changefreq/priority.
- **robots.txt:** allow all; disallow `/dev`, `/api/`; Sitemap line. The non-standard
  `Host:` line was removed.
- **Intentional noindex:** only `/dev` (component gallery). Nothing else.
- **Hub → spoke:** tool pages ← homepage hero/nav. Basics: `/what-is-robots-txt` →
  syntax / how-it-works / find / examples / platform guides. SEO: `/robots-txt-seo-guide`
  ↔ `/robots-txt-vs-noindex` ↔ `/robots-txt-sitemap`. AI: `/ai-crawlers-directory` and
  `/block-ai-crawlers` → per-crawler pages and `/crawlers/[id]`.
- **Structured data:** Breadcrumb, TechArticle (with real dates, or omitted),
  FAQPage (only where the FAQ is visible), SoftwareApplication (no ratings claimed),
  ItemList, DefinedTermSet. HowTo was removed: it wasn't mirrored by visible steps, it
  described a non-crawling token as "crawling", and Google retired HowTo rich results.
- **Trust copy:** the author bio no longer claims to "parse thousands of real-world
  files". It now states what is verifiable.

---

## 4. Change log (priority order)

1. `next.config.ts` — `htmlLimitedBots` (metadata in `<head>`); `redirects()` from the redirect map.
2. `src/config/redirects.ts` (new); 9 route folders removed; content merged into
   `what-is-robots-txt`, `robots-txt-syntax`, `robots-txt-seo-guide`, `robots-txt-sitemap`.
3. `src/config/tool-guides.ts`, `src/components/tool-guide.tsx` (new) — server-rendered guide,
   worked examples, FAQ and sources on `/validate`, `/url-tester`, `/generate`, `/analyze`.
   Titles and H1s now match the query each page is canonical for.
4. `src/app/sitemap.ts`, `src/config/page-dates.ts` (new), `schema-wrapper.tsx`,
   `author-box.tsx`, `methodology` — real per-page dates.
5. `src/types/crawler.ts`, `src/config/crawlers.ts` — `ai-control` category,
   OAI-SearchBot and Claude-SearchBot added, AI search recommended "allow".
   `isAiCategory`/`AI_CATEGORIES` are used in compare, crawler-manager, generator presets
   (control tokens follow the training decision), and the analyzer.
6. `src/features/live-checker/*` — `policy-status.ts` (new), search-only visibility
   score, RFC 9309 status mapping, parsing of wrong-content-type bodies.
   `analyzer-screen.tsx` / `verdict-band.tsx`: "Policy unknown" state, and AI policy shown
   separately from the score. The `analyze_completed` event gains `policy_status` and omits
   scores when unverified.
7. Validator: `Disallow: /*.css$` (anchored) now flagged as blocking rendering assets.
8. Copy corrections: methodology categories, block-AI FAQ (Google-Extended has no
   separate user-agent), Perplexity training flag, homepage hero/AI copy ("18 more" was
   false), SEO guide overclaims ("100% visible").
9. `src/app/layout.tsx` (no site-wide canonical), `src/app/robots.ts` (no `Host:`).
10. Tests and tools: `seo-inventory.test.ts`, `tool-guides.test.ts`, catalog/report/fetch/
    compare tests, `tests-e2e/seo.spec.ts`, `scripts/seo-smoke-audit.mjs`,
    `scripts/check-page-dates.mjs`, `scripts/gsc-compare.mjs`.

---

## 5. Validation

Final run on 2026-10-19, after the release-readiness review (§5a). Node 22.16.0, pnpm
11.5.2, starting from a clean `rm -rf node_modules .next && pnpm install --frozen-lockfile`
(the lockfile was unchanged).

| Check | Command | Before (HEAD `3c24407`) | Final (this branch) |
| --- | --- | --- | --- |
| Install | `pnpm install --frozen-lockfile` | `pnpm <script>` aborted (workspace placeholders) | pass, lockfile unchanged |
| Lint | `pnpm lint` | pass | pass |
| Typecheck | `pnpm typecheck` | pass | pass |
| Unit tests | `pnpm test` | 300/300 (38 files) | 354/354 (40 files) |
| Coverage | `pnpm test:coverage` | — | gate passes (98.1% lines, 91.7% branches) |
| Build | `pnpm build` | — | pass (71 static pages, 48 sitemap URLs) |
| E2E | `pnpm test:e2e --repeat-each=3` (system Chrome) | — | 126/126 (42 tests x 3) |
| SEO smoke audit | `pnpm seo:audit` against `pnpm start` | production today: 36 errors, 2 warnings | 0 errors, 0 warnings (48 URLs, 48 link targets, 9 redirects) |
| Prettier | `prettier --check` | 7 touched files were already unformatted at HEAD | new and previously clean files are formatted; those 7 were left as they were |

The production "before" errors include the expected structural ones (the 9 URLs that will
redirect are still live pages there) plus the real defects: missing head metadata on 3
dynamic pages and identical lastmod on every URL.

One e2e test (`workspace.spec.ts`, "edits in Validate reach the Manager") was racy: it
read the editor with a one-shot `inputValue()` before the client restored the working
file, and failed 3 times in 4 repeats once `/validate` grew its server-rendered guide.
It now uses auto-waiting `toHaveValue`.

Not run: Lighthouse/CrUX (no field data here), Google Rich Results Test (external; run it
on `/validate` after deploy), and a live-production audit (deployment step 7).

### 5a. Release-readiness review (2026-10-19)

**Redirects:** all 9 verified on a production build.
- Each is a single-hop 308 to a sitemap page with a self-canonical. Matching is
  case-insensitive (`/ROBOTS-TXT-VALIDATOR` → `/validate`). Query strings are kept.
- A trailing slash takes two hops (`/robots-txt-validator/` → `/robots-txt-validator` →
  `/validate`); that's Next's standard slash normalisation and is acceptable.
- No internal link or sitemap entry points at a source (inventory test + smoke audit).
- `/robots-txt-validator` content is kept on `/validate` (what it checks, severity table,
  checker-vs-validator, FAQs), now as test-verified examples.
- `/robots-txt-analyzer` content is kept on `/analyze` (what it reports, how fetch results
  are handled, competitor FAQ).
- A legacy link like `/robots-txt-analyzer?domain=x` lands on `/analyze?domain=x`, which
  starts an analysis of `x`. That's the analyzer's normal deep-link behaviour, and no
  internal links use it.

**`htmlLimitedBots: /.*/` — kept.**
- In Next 15.5.19 the option only controls `serveStreamingMetadata`
  (`next/dist/server/lib/streaming-metadata.js`). Bot detection (`getBotType`) and
  streaming of page content (the `/analyze` loading state) are unaffected.
- All three dynamic routes (`/analyze`, `/generate`, `/ai-crawlers`, plus
  `/analyze?domain=…`) now carry title and canonical in `<head>` for Googlebot desktop,
  Googlebot smartphone, Chrome, and Bingbot.
- Their metadata is a static object, so blocking costs nothing: local TTFB is 8–11 ms.
- Static pages are prerendered and unaffected.
- The alternative (making those routes static by reading `searchParams` on the client)
  would mean restructuring three tools. A Googlebot-only regex would leave Google's other
  user-agents (e.g. Google-InspectionTool) and other engines on streamed metadata.

**`pnpm-workspace.yaml` — fixed.**
- It had held pnpm's literal `set this to true or false` placeholders since the first
  commit, so every `pnpm <script>` aborted under pnpm 11.
- `allowBuilds` is now `esbuild: true`, `unrs-resolver: true`, and `sharp: false`. The
  prebuilt `@img/sharp-*` binary loads fine; sharp's install script only attempts a
  from-source build that fails without node-gyp.
- `onlyBuiltDependencies`, which pnpm 9/10 read and Vercel uses for lockfile v9, is
  unchanged, so production installs behave as before.
- No dependency versions changed.

**Corrected during review:**
- The access matrix showed Google-Extended / Applebot-Extended as red "blocked" crawlers
  and counted them in "N of M known crawlers get in". That row now reads "opted out" /
  "not opted out", and the crawler total excludes the control tokens.
- The `/api/analyze` recommendation for 401/403 said "This site has no robots.txt". It now
  names the status code and notes Google's advice against 401/403.
- The wrong-content-type text said crawlers "may ignore it". It now distinguishes rules
  that are still parsed from an HTML page that contains none. Both are covered by tests.

**Accepted, documented:** over 5 redirect hops is reported as "policy unknown", while
Google treats it as a 404 (allow-all). That's conservative rather than misleading.

---

## 6. Crawler semantics (verified against operator docs, 2026-10-19)

- **OpenAI** (developers.openai.com/api/docs/bots): GPTBot = training. OAI-SearchBot =
  ChatGPT search ("sites opted out … will not be shown in ChatGPT search answers").
  ChatGPT-User = user-initiated; "robots.txt rules may not apply".
- **Anthropic** (support.claude.com/…/8896518): ClaudeBot = training; Claude-SearchBot =
  search quality; Claude-User = user-initiated retrieval.
- **Perplexity** (docs.perplexity.ai/guides/bots): PerplexityBot surfaces and links results
  and is "not used to crawl content for AI foundation models". Perplexity-User "generally
  ignores robots.txt".
- **Google** (google-common-crawlers): Google-Extended "doesn't have a separate HTTP request
  user agent string", covers Gemini training **and grounding**, and "does not impact a
  site's inclusion in Google Search" or ranking.
- **Apple** (support.apple.com/119829): Applebot-Extended "does not crawl webpages"; pages
  that disallow it "can still be included in search results".
- **Google robots.txt spec:** 4xx except 429 = no restrictions. 5xx/429/network errors =
  crawling stops for 12 h, then the cached copy is used for up to 30 days. The first 500 KiB
  is read. Specific groups are not combined with `*`.

User-triggered agents (ChatGPT-User, Claude-User, Perplexity-User) are not in the
catalog. Their operators say robots.txt may not apply, and listing them as controllable
would overstate what a robots.txt can do.

---

## 7. Baseline (for comparison — periods differ, GSC lags ~2–3 days)

**Indexing (Page indexing report, exported 2026-10-18):** 60 known · 19 indexed · 41 not
indexed = 37 Discovered – currently not indexed (flat from about Aug 22 to Oct 12; "Last
crawled" = 1970-01-01, i.e. never/unknown) + 1 Crawled – currently not indexed + 3 Page
with redirect. The 37 paths are in `docs/gsc/discovered-not-indexed-2026-10-18.txt`.

**Performance (2026-07-17 → 2026-10-16):** 12,151 impressions · 6 clicks · ~0.05% CTR ·
average position 77.7. First 28 days: 3,024 impressions. Last 28 days: 1,384.

| Page | Impressions | Avg position |
| --- | --- | --- |
| `/validate` | 3,830 | 79.8 |
| `/what-is-robots-txt` | 2,945 | 79.5 |
| `/robots-txt-syntax` | 1,338 | 77.8 |
| `/crawlers` | 991 | 81.9 |
| `/block-ai-crawlers` | 986 | 82.6 |
| `/claudebot-robots-txt` | 252 | 47.2 |
| `/google-extended-robots-txt` | 238 | 32.3 |
| `/compare` | 14 | 7.1 (tiny sample) |

**Query cohort:** robots.txt validator · robot.txt validator · validate robots txt · what is
robots txt · block ai bots robots txt · gptbot robots.txt. The Performance page list and
the indexed count are separate reports. Rare queries are anonymized, so query rows don't
add up to the totals.

### 7a. Pre-deploy evidence (collected 2026-10-19)

Source: the 2026-10-18 Performance export (last 3 months, web) and the 2026-06-17 and
2026-10-18 indexing drilldowns.

| URL (redirected by this release) | Clicks | Impressions | Avg position | Index status |
| --- | --- | --- | --- | --- |
| `/robots-txt-validator` → `/validate` | 0 | 637 | 77.9 | indexed (left "Discovered" after June 17; has impressions) |
| `/robots-txt-analyzer` → `/analyze` | 1 | 92 | 67.6 | indexed (same) |
| `/validate` (destination) | 0 | 3,830 | 79.8 | indexed |
| `/analyze` (destination) | 0 | 75 | 57.7 | indexed |

- The validator query family ("robots.txt validator", "robot.txt validator", "validate
  robots txt", …) has 2,879 impressions. That's the largest cohort, and it was split
  across two URLs from this site.
- "check for robots.txt"-type queries have 548 impressions; `/validate`'s new title
  includes "Checker".
- All 6 clicks in the period came from anonymized queries; no named query has a click.
- **Decision impact: none.** Both pages are indexed, but their traffic is negligible: 1
  click combined, page-8 rankings. Consolidating the split validator cohort onto one URL
  is the intended fix.
- **Measurement:** compare `/validate` + `/robots-txt-validator` combined (4,467
  impressions) before vs after, not `/validate` alone. Same for `/analyze` +
  `/robots-txt-analyzer` (167 impressions, 1 click).

**Site-wide 28-day windows** (from the daily chart):

| Window | Clicks | Impressions | CTR | Avg position |
| --- | --- | --- | --- | --- |
| Jul 17 – Aug 13 | 1 | 3,024 | 0.03% | 75.0 |
| Aug 22 – Sep 18 | 0 | 5,842 | 0.00% | 79.5 |
| **Sep 19 – Oct 16 (pre-deploy baseline)** | **5** | **1,384** | **0.36%** | **73.0** |

**Remaining indexing exports** (drilldowns exported 2026-10-19):

- **Page with redirect (3):** `http://www.robotstxtstudio.com/`,
  `https://www.robotstxtstudio.com/`, `http://robotstxtstudio.com/`. These are host and
  protocol variants of the homepage, redirecting to the canonical
  `https://robotstxtstudio.com/` as intended. No action. Making the `www` hop a 308 (§8
  step 4) is a tidy-up, not a fix.
- **Crawled – currently not indexed (1):** `/claude-searchbot-robots-txt`, last crawled
  2026-06-18 (5 days after it was published) and not since. Google fetched it and chose
  not to index it.
  - In production it gets links only from deep AI pages. `/crawlers` doesn't link it,
    because Claude-SearchBot wasn't in the catalog.
  - This release adds Claude-SearchBot to the catalog, so `/crawlers` (indexed, 991
    impressions) now links it (verified in the build).
  - No content change during the freeze. After deploy it's a reasonable candidate for a
    single "Request indexing" (§8 step 10).
- From 2026-09-19 to 10-09 the crawled-not-indexed count was 2 while indexed fell from 19
  to 18, then both recovered. Some indexed page was briefly dropped and re-indexed; the
  export doesn't say which. Informational.

**Decision impact: none. Deployment can proceed.**

---

## 8. Deployment checklist (for your approval — nothing here has been run)

**D-1 (before deploy)**
1. ~~GSC → Performance → Pages: record `/robots-txt-validator` and `/robots-txt-analyzer`~~
   — done 2026-10-19 (§7a); no impact on the decision.
2. ~~Export the 1 + 3 URLs~~ — done 2026-10-19 (§7a): homepage host/protocol variants, and
   `/claude-searchbot-robots-txt`.
3. Export Performance (Pages + Queries) for the 28 days before deploy (the pre-window).
4. *(Vercel dashboard, your call)* Domains → `www.robotstxtstudio.com` → redirect to
   `robotstxtstudio.com` with **308 Permanent** instead of 307.

**D0 (deploy day): 2026-10-19.** Steps 5–8 are done (see §8a). Steps 9–11 are for you in GSC.
5. Review the branch: `git log --oneline main..seo-recovery-2026-10` (4 commits). Re-run
   `pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck && pnpm test && pnpm build`.
6. Merge and deploy the way you normally do, e.g. `git checkout main && git merge --no-ff
   seo-recovery-2026-10 && git push origin main`. Vercel builds main. Wait for the
   deployment to show Ready.
7. `pnpm seo:audit https://robotstxtstudio.com` → expect `0 error(s)` (read-only, fewer than 100
   GET requests; it also confirms title and canonical sit in `<head>`).
8. Spot check: `curl -sI https://robotstxtstudio.com/robots-txt-checker` → `308`,
   `location: /validate`; `curl -s https://robotstxtstudio.com/sitemap.xml | grep -c '<loc>'` → `48`.
9. GSC → Sitemaps → resubmit `https://robotstxtstudio.com/sitemap.xml`. Confirm "Success"
   and 48 discovered URLs (the count may take a day).
10. GSC → URL Inspection → **Test live URL** for `/validate`, `/url-tester`,
    `/what-is-robots-txt`, `/robots-txt-syntax`, `/block-ai-crawlers`. Confirm the fetch
    succeeds, the user-declared canonical equals the URL, and indexing is allowed.
    Optionally use **Request indexing** for those 5 only (don't bulk-request).
11. Inspect one redirect (e.g. `/robots-txt-format`) and confirm it reports the redirect
    to `/robots-txt-syntax`.

**Rollback**
- **Whole release, fastest:** Vercel → Deployments → previous production deployment →
  **Instant Rollback**. Then `git revert -m 1 <merge-commit>` on main so the next deploy
  doesn't reintroduce the release.
- **One redirect:**
  1. Delete its entry in `src/config/redirects.ts`.
  2. Restore the page with `git checkout 3c24407 -- src/app/<slug>`.
  3. Re-add its registry entry in `src/config/content.ts` and a date in `page-dates.ts`
     (`pnpm test` fails until both agree).
  4. Deploy.
- **Caveats:** browsers cache 308s, so returning visitors may still be redirected until
  their cache clears. Google re-crawls and picks up the restored 200 on its own schedule.
  The analyzer score and catalog changes have no data to migrate; reverting the code
  restores the old behaviour.

### 8a. Deployment record

| Item | Value |
| --- | --- |
| Date (D0) | 2026-10-19. Pushed 11:02 UTC; Vercel production ready 11:04:45 UTC |
| Commit | Merge `530848e` (`--no-ff`) of `seo-recovery-2026-10` (6 commits, `944df09`..`a7820f0`) into `main`, from `3c24407` |
| Vercel | Production deployment of `530848e`, GitHub deployment id 7172055282, status success (`robotstxtstudio-5k8rrfbjt-ritesh-studio.vercel.app`) |
| Pre-push checks | `pnpm lint`, `pnpm typecheck` pass; `pnpm test` 354/354. No code change since the full validation in §5 (build, e2e 126/126, local audit 0/0) |

**Production verification (2026-10-19, after deploy):**

| Check | Result |
| --- | --- |
| `pnpm seo:audit https://robotstxtstudio.com` | 0 errors, 0 warnings (48 URLs, 48 link targets, 9 redirects) |
| Sitemap | 48 `<loc>`; real lastmod dates (Jun 10–18; 15 pages 2026-10-19); no changefreq/priority |
| robots.txt | allow `/`, disallow `/dev` and `/api/`, Sitemap line, no `Host:` |
| Redirects | e.g. `/robots-txt-checker` → 308 `/validate`; all 9 single-hop (audit) |
| Head metadata | title + canonical in `<head>` on `/analyze`, `/generate`, `/ai-crawlers` for Googlebot and Chrome user-agents |
| `/api/analyze` | `google.com` → `policyStatus: verified`; unresolvable `.invalid` domain → `unverified`; breakdown includes `ai-control` |
| Browser flows (Chrome, 1280px and 390px) | home → analyze google.com → "Search visibility" + access matrix; validator; URL tester trace; generator with "AI usage controls"; no horizontal overflow; no JS errors |

**Known, accepted:**
- For `unverified` fetches, the `/api/analyze` JSON still contains a placeholder
  `visibility` object. The UI never shows it, and no public client consumes the API.
- The `www` → apex redirect is still a 307. It was intentionally left unchanged in this
  release.

**Still to do (you, in GSC):** steps 9–11 above, plus a 28-day page and query export
(Performance → Search results → Last 28 days → Export) saved as the page-level pre-deploy
baseline. Its window ends before D0 because of GSC's ~2-day lag.

---

## 9. 4–8 week observation plan

**Freeze:** from D0 to D0+28, no non-critical SEO changes (no new pages, no title
rewrites, no new redirects). Bug fixes and factual corrections are fine. Log any change
with its date.

**Weekly (D0+7, +14, +21, +28, +42, +56):**
- Export Indexing → "Discovered – currently not indexed" (and "Crawled – currently not
  indexed") → `node scripts/gsc-compare.mjs --urls <previous>.csv <this-week>.csv`.
- Export Performance Pages and Queries (last 7 days) →
  `node scripts/gsc-compare.mjs <prev>/Pages.csv <this>/Pages.csv --cohort docs/gsc/discovered-not-indexed-2026-10-18.txt`.
- `node scripts/seo-smoke-audit.mjs https://robotstxtstudio.com` (must stay at 0 errors).
- If PostHog is configured: count `analyze_completed` (by `policy_status`) and
  `validation_completed`. Vercel Analytics: tool-page visits from organic referrers.

**Comparison windows:** pre = the 28 days before D0. Post = D0+15 → D0+42 (skips the first
two weeks of reprocessing). Then D0+29 → D0+56. Compare the same weekdays, look at cohorts
(tool pages; basics guides; AI guides; the 37 URLs), and note seasonality: Q4 holidays
lower B2B/dev search volume.

**What to track:** crawl dates appearing for the 28 retained URLs; movement out of
"Discovered"; the 9 redirect sources appearing under "Page with redirect"; impressions and
average position for `/validate` and the validator query cohort; organic clicks; completed
tool events.

**Guideposts at D0+56** (indicators, not promises):
- Healthy: several retained URLs show a crawl date (leading signal). Redirect sources are
  classified as "Page with redirect". Smoke audit stays clean. Tool-page cohort impressions
  are not more than 20% below the pre-window.
- Investigate: still no crawl date on any retained URL by D0+42. Look for host-level
  issues (Crawl stats report, Settings → Crawl stats) before changing content again.
- Roll back a specific redirect: if its destination loses more than 40% of impressions for
  2 consecutive weekly exports, with no seasonal or sitewide explanation. Start with
  `/robots-txt-checker` and `/robots-txt-validator`.

---

## 10. Who can fix what

**Code can fix (done here):** head metadata, canonicals, sitemap contents and dates,
redirects, duplicate pages, server-rendered tool explanations, structured-data accuracy,
crawler-policy semantics, unknown-state handling, tests and audits.

**Google controls / needs external evidence:** whether and when URLs are crawled and
indexed; rankings; how quickly the "Discovered" bucket clears; whether site quality is
reassessed.

**Only you can do:**
- GSC exports and inspections (§8, §9), and the 1 + 3 URL identities.
- The Vercel www → apex 308 setting.
- Earning real links: e.g. a short write-up of the RFC 9309 status-code behaviour or the
  training-vs-search table, shared where developers discuss robots.txt; listing the tool in
  relevant open-source/awesome lists. No paid links.
- Real user feedback on the validator/analyzer first run.
- Deciding at week 8 on the two INVESTIGATE pages (`/crawlers/slurp`, `/how-to-read-robots-txt`).
