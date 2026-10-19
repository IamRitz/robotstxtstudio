# SEO & Indexing Recovery — October 2026

**Prepared:** 2026-10-19 · **Branch:** `seo-recovery-2026-10` (not pushed, not deployed)
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
- **The Phase 19 linking work (June 18) didn't move the backlog.** It stayed at 37 from
  about Aug 22 to Oct 12. More internal links alone were probably not the constraint, so
  this sprint changes page *quality and uniqueness* (fewer, stronger URLs) rather than
  adding more links.
- **The impressions fall** (3,024 → 1,384 per 28 days) could be ranking drift, demand,
  query mix, or reprocessing. The exports can't separate these causes.

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

Environment: Node 22.16.0, pnpm 11.5.2. `pnpm <script>` fails before running here, because
pnpm 11's dependency check stops on the `allowBuilds` placeholders in
`pnpm-workspace.yaml` (an environment issue I left untouched). So I ran each script's
command directly via `node_modules/.bin` (installed from the lockfile).

| Check | Command | Before (HEAD `3c24407`) | After (this branch) |
| --- | --- | --- | --- |
| Typecheck | `tsc --noEmit` | pass | pass |
| Lint | `eslint .` | pass | pass |
| Unit tests | `vitest run` | 300/300 (38 files) | 352/352 (40 files) |
| Coverage | `vitest run --coverage` | — | pass the gate (98.0% lines, 91.4% branches) |
| Build | `next build` | — | pass (71 static pages, 48 sitemap URLs) |
| E2E | `playwright test` (system Chrome) | — | 42/42; `--repeat-each=5`: 210/210 |
| SEO smoke audit | `node scripts/seo-smoke-audit.mjs` | production: 36 errors, 2 warnings | local production build: 0 errors, 0 warnings |
| Prettier | `prettier --check` | 7 touched files were already unformatted at HEAD | new and previously clean files are formatted; those 7 were left as they were |

The production "before" errors include the expected structural ones (the 9 URLs that will
redirect are still live pages there) plus the real defects: missing head metadata on 3
dynamic pages and identical lastmod on every URL.

One e2e test (`workspace.spec.ts`, "edits in Validate reach the Manager") was racy: it
read the editor with a one-shot `inputValue()` before the client restored the working
file. It failed 3 times in 4 repeats after `/validate` grew its server-rendered guide.
It now uses auto-waiting `toHaveValue`.

Not run: Lighthouse/CrUX (no field data here), Google Rich Results Test (external; run
it on `/validate` after deploy), a live-production audit after deploy (checklist step 6).

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

---

## 8. Deployment checklist (for your approval — nothing here has been run)

**D-1 (before deploy)**
1. GSC → Performance → Pages, last 3 months: record clicks and impressions for
   `/robots-txt-validator` and `/robots-txt-analyzer`. A 308 passes signals either way. If
   either has meaningful clicks, note it so a week-4 dip isn't misread.
2. GSC → Indexing → Pages → open **Crawled – currently not indexed** and **Page with
   redirect** → export both lists (the 1 + 3 URLs). Save them next to the 37-URL file.
3. Export Performance (Pages + Queries) for the 28 days before deploy (the pre-window).
4. *(Vercel dashboard, your call)* Domains → `www.robotstxtstudio.com` → redirect to
   `robotstxtstudio.com` with **308 Permanent** instead of 307.

**D0 (deploy day) — record the date here: ________**
5. Merge `seo-recovery-2026-10` and deploy.
6. `node scripts/seo-smoke-audit.mjs https://robotstxtstudio.com` → expect `0 error(s)`.
7. Spot check: `curl -sI https://robotstxtstudio.com/robots-txt-checker` → `308`,
   `location: /validate`; `curl -s https://robotstxtstudio.com/sitemap.xml | grep -c '<loc>'` → `48`.
8. GSC → Sitemaps → resubmit `https://robotstxtstudio.com/sitemap.xml`. Confirm "Success"
   and 48 discovered URLs (the count may take a day).
9. GSC → URL Inspection → **Test live URL** for: `/validate`, `/url-tester`,
   `/what-is-robots-txt`, `/robots-txt-syntax`, `/block-ai-crawlers`. Confirm the fetch
   succeeds, the user-declared canonical equals the URL, and indexing is allowed.
   Optionally use **Request indexing** for those 5 only (don't bulk-request).
10. Inspect one redirect (e.g. `/robots-txt-format`) and confirm it reports the redirect
    to `/robots-txt-syntax`.

**Rollback:** each redirect is one entry in `src/config/redirects.ts`. To roll one back,
delete the entry and restore the page with `git checkout 3c24407 -- src/app/<slug>`. Re-add
its registry entry in `src/config/content.ts` (and a date in `page-dates.ts`; the
inventory test will remind you). For a full rollback, revert the merge commit.

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
