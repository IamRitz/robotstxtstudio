# Robots.txt Studio — Product Requirements Document (PRD)

> **Status:** canonical product source of truth. Supersedes ad-hoc context in
> chat history and the marketing copy in `README.md`.
> **Owner:** Product/Eng (this repo). **Last updated:** 2026-06-08.
> **Companion docs:** [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) (tokens, components),
> `README.md` (developer quickstart).

This document synthesizes the product brief, the architecture decisions from Phase 1,
the approved high-fidelity designs (`Screens/Screen 1–6.png`), the coded design
handoff (`Screens/design_spec_vite/`), and the roadmap. When this document and code
disagree, **fix one of them deliberately** — do not let them drift.

> **Naming (DECIDED):** the canonical product name is **Robots.txt Studio.**
> "RobotsKit" was an earlier design-stage name only and must not appear in product
> code or copy; any "RobotsKit" string in the mockups is a historical placeholder.
> No logo work is required yet.

---

## 1. Product Vision

Robots.txt Studio is a **crawler visibility and permissions platform**. It helps
anyone who owns a website understand — and control — how search engines, AI
crawlers, SEO tools, and automated agents access their content.

The robots.txt file is the control surface, but it is *not* the product. The
product is **clarity and control over who can see your website.** We turn an
obscure, error-prone plaintext format into an explainable, testable, auditable
workflow.

The long-term vision: the default place professionals go to answer "who is
crawling my site, what can they reach, and how do I change it?"

---

## 2. Problem Statement

robots.txt is simultaneously **critical and badly understood**:

- The syntax is deceptively simple but has sharp edges (precedence, wildcards,
  `$` anchors, per-user-agent groups, ordering) that cause silent, costly errors —
  e.g. accidentally blocking an entire site from Google.
- The **AI crawler era** (GPTBot, ClaudeBot, PerplexityBot, CCBot, Google-Extended,
  Bytespider…) created an urgent new need: deciding and enforcing whether AI
  systems may train on or cite your content. Most owners don't know which bots
  exist, what they do, or how to allow/block them.
- Existing tools are fragmented: a generator here, a tester there, no explanation,
  no audit, no AI-crawler awareness, no "why is this URL blocked" tracing.
- Errors are invisible until traffic drops. There is no "health score" or
  plain-English review.

**The gap:** there is no single, trustworthy, developer-grade workspace that
*generates, validates, tests, explains, audits live sites, and manages AI crawler
permissions* — with explainable results.

---

## 3. Target Users

- Website owners & bloggers
- SEO professionals
- Agencies (managing many client sites)
- SaaS founders & developers
- Publishers & content creators

Common thread: they need to control crawler access but span a wide range of
technical depth — from "I just don't want ChatGPT training on my blog" to "show me
the exact rule precedence trace."

---

## 4. User Personas

### P1 — "Maya," the Blogger / Creator (low technical depth)
Wants AI companies to stop scraping her writing. Doesn't know what a user-agent is.
Needs: presets, plain-English explanations, one-click "Block all AI crawlers,"
copy/paste output. Success = a correct robots.txt without learning the spec.

### P2 — "Dev Diego," the Developer / SaaS Founder (high technical depth)
Owns the site's infra. Wants precise control, correctness guarantees, and to verify
specific URLs against specific bots before shipping. Needs: raw editor, URL tester
with rule trace, validation with line-level errors, predictable output.

### P3 — "Sasha," the SEO Professional / Agency (medium–high depth, many sites)
Audits client sites. Needs: live fetch + audit ("Crawler Visibility Audit"),
health/visibility score, exportable reports, fast triage of issues by severity, and
a defensible explanation to send to clients.

### P4 — "Priya," the Publisher (medium depth, content-heavy)
Balances SEO discoverability against AI-training opt-out. Needs: category-level
control (allow search engines, block AI training, allow AI search/citation),
sitemap correctness, and impact previews before committing.

---

## 5. Core User Jobs To Be Done

1. **"When I worry AI is scraping my site, I want to see who can access it and block
   them, so I keep control of my content."** → Live Checker, AI Crawler Manager.
2. **"When I set up a new site, I want a correct robots.txt without learning the
   syntax, so I don't accidentally hurt my SEO."** → Generator + presets.
3. **"When I change a rule, I want to confirm a specific URL is blocked/allowed for a
   specific bot, so I trust the change."** → URL Tester with rule trace.
4. **"When I inherit a robots.txt, I want it explained in plain English, so I
   understand what it actually does."** → Explainer.
5. **"When I audit a client site, I want a scored report of issues and fixes, so I
   can act and show value."** → Live Checker / Validator + Export.
6. **"When I write rules by hand, I want to catch mistakes before they go live, so I
   don't silently block crawlers."** → Validator with line-level diagnostics.

---

## 6. Product Positioning

> **Robots.txt Studio is not primarily a robots.txt generator. It is a crawler
> visibility and permissions platform.**

The primary differentiation is **helping users understand and control how search
engines, AI crawlers, SEO crawlers, and automated systems access their websites.**

Positioning consequences (these are binding product decisions):

- The landing page leads with **"Who Can See Your Website?"** and a **domain-first**
  call to action ("Analyze My Site"), *not* with a generator form. Generation is a
  downstream action, not the headline.
- Tools are framed as three jobs — **Analyze · Control · Verify** — not as a list of
  utilities.
- **AI crawler management is a first-class pillar**, not a checkbox. The crawler
  database (owner, purpose, "what this means," recommendation) is a core asset.
- Every result is **explainable** (rule traces, plain-English, impact previews).
  Trust is the moat; we never show an unexplained verdict.
- SEO keyword pages (generator, tester, validator, gptbot/claudebot/perplexitybot…)
  are **acquisition surfaces** that funnel into the platform.

---

## 7. Information Architecture

```
Robots.txt Studio
├── Marketing / Landing            "Who Can See Your Website?"
│   └── SEO keyword pages          /robots-txt-generator, /gptbot-robots-txt, …
│
├── ANALYZE  (understand)
│   ├── Crawler Visibility Audit   live fetch → score → audit → breakdown
│   └── Explainer                  paste/fetch → plain-English explanation
│
├── CONTROL  (decide & produce)
│   ├── AI Crawler Manager         categorized crawler DB + toggles → export
│   └── Generator                  presets + rules → live robots.txt
│
├── VERIFY   (prove correctness)
│   ├── Validator                  syntax/health diagnostics + fixes
│   └── URL Tester                 URL × user-agent → verdict + rule trace
│
├── Crawler Directory              reference DB of crawlers (SEO + utility)
├── Compare (future)               diff two robots.txt files / before-after
└── Dashboard (future, post-auth)  saved sites, history, monitoring
```

The **Analyze / Control / Verify** grouping is the canonical IA and appears on the
landing page and in navigation.

---

## 8. Navigation Structure

**Primary nav (dark `neutral-950` top bar):** Logo · Dashboard · Analyze · Generate ·
Validate · URL Tester · AI Crawlers · Compare · `Sign In` · **`Get Started`** (blue CTA).

- Active item: `bg-neutral-800 text-white`.
- **Breadcrumb** under the bar on tool pages: `ROBOTS.TXT STUDIO / ANALYZE` (uppercase, tracked).
- **Responsive:** horizontal nav ≥900px; hamburger on tablet; **bottom tab bar** on mobile.
- **Sticky bottom action bar** on tool pages (desktop) hosts the screen's primary
  outputs (Download / Export / Add to Generator).

See the **Route Map** in §16 for URL bindings.

---

## 9. User Flows

**F1 — Audit a live site (P3/P1, the hero flow)**
Landing → enter domain → "Analyze My Site" → Crawler Visibility Audit (score + audit
+ breakdown) → "Fix Issues" (→ Generator/Crawler Manager prefilled) or "Export Report."

**F2 — Generate from scratch (P1/P2)**
Generate → pick starter template → toggle crawler categories → set advanced rules
(disallow paths, sitemap, crawl-delay) → live preview updates → Copy / Download →
optional "Validate This File."

**F3 — Manage AI crawlers (P1/P4)**
AI Crawlers → choose preset (e.g. "Block All AI Crawlers") or toggle per crawler →
see impact preview → "Add to Generator" or "Copy robots.txt Block."

**F4 — Test a URL (P2)**
URL Tester → set domain/robots source + URL + user-agent → Run Test → verdict
(BLOCKED/ALLOWED) + matched rule + 4-step rule trace → "Fix This Rule" or "Test Another."

**F5 — Validate hand-written rules (P2/P3)**
Validate → paste or fetch → health score + severity-filtered issue cards +
line-highlighted editor → "Fix This" per issue or "Fix All Issues."

**F6 — Explain an inherited file (P1)**
Explainer → paste/fetch → plain-English, per-group explanation of what the file does.

Cross-flow: results **funnel into Control** ("Fix Issues" / "Add to Generator") so
analysis always has a next action.

---

## 10. Screen Inventory

| ID | Screen | Status | Module | Route |
| --- | --- | --- | --- | --- |
| S1 | Landing — "Who Can See Your Website?" | ✅ Approved (Screen 1) | Marketing | `/` |
| S2 | Crawler Visibility Audit | ✅ Approved (Screen 2) | Live Checker | `/analyze` |
| S3 | Generate robots.txt | ✅ Approved (Screen 3) | Generator | `/generate` |
| S4 | Test a URL | ✅ Approved (Screen 4) | Tester | `/url-tester` |
| S5 | AI Crawler Manager | ✅ Approved (Screen 5) | Crawler Manager | `/ai-crawlers` |
| S6 | Validate robots.txt | ✅ Approved (Screen 6) | Validator | `/validate` |
| S7 | Explainer | 🟡 Defined, not yet mocked | Explainer | `/explain` |
| S8 | Crawler Directory | 🟡 Defined | Reference | `/crawlers` |
| S9 | Compare | ⚪ Future | Compare | `/compare` |
| S10 | Dashboard | ⚪ Future (post-auth) | Dashboard | `/dashboard` |

---

## 11. Detailed Screen Specifications

> Format per approved screen: Purpose · User goal · Inputs · Outputs · Components ·
> Empty · Loading · Error · Success · Acceptance criteria. Visual recipes live in
> [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md).

### S1 — Landing: "Who Can See Your Website?" (Screen 1)

- **Purpose:** convert visitors by leading with crawler visibility, not generation.
- **User goal:** find out who can access my site and start in seconds.
- **Inputs:** domain text field; primary CTA "Analyze My Site"; secondary
  "Create Your Visibility File."
- **Outputs:** navigation into `/analyze` (or `/generate`); a static **Crawler Access
  Preview** strip (Google, Bing, GPTBot, ClaudeBot, PerplexityBot → Allowed/Blocked);
  3-step explainer (Check → See Who's Crawling → Take Control); the six-tool grid
  grouped Analyze / Control / Verify.
- **Components:** Pill badge ("Crawler Visibility & Permissions Platform"), hero
  Display heading, domain Text Input, Primary CTA, preview card, step indicators,
  tool cards (one highlighted dark card = AI Crawler Manager), footer.
- **Empty state:** n/a (static marketing); domain field shows placeholder.
- **Loading state:** on submit, CTA shows spinner; route transition to `/analyze`.
- **Error state:** invalid/empty domain → inline field error ("Enter a valid domain")
  ; CTA disabled until valid.
- **Success state:** valid domain → navigates to `/analyze?domain=…` and auto-runs.
- **Acceptance criteria:**
  - Hero copy is visibility-led, not generator-led.
  - Domain submit validates and routes to Analyze with the domain prefilled.
  - Tool grid renders all six tools in Analyze/Control/Verify groups.
  - No sign-up required to reach any tool ("no sign-up required to get started").

### S2 — Crawler Visibility Audit (Screen 2) — Live Checker

- **Purpose:** fetch a live site's robots.txt and produce a scored, explained audit.
- **User goal:** understand how exposed/blocked my site is and what to fix.
- **Inputs:** domain field; "Fetch & Analyze"; "Paste File" (paste raw instead of fetch).
- **Outputs:**
  - **Crawler Visibility Score** gauge (e.g. 62/100, "Moderate Visibility") with
    breakdown: Search Engine access %, AI Crawler access %, Error rate %.
  - **Audit Summary**: severity-ranked findings (HIGH/MEDIUM/…), e.g. "AI crawlers
    fully blocked," "No sitemap declared," "Wildcard rule may cause unintended blocks."
  - **Crawler Breakdown** by category (Search Engines, AI Training, AI Search,
    Other/Data) with allowed/blocked counts + colored bar.
  - Action bar: Fix Issues · View robots.txt · Export Report · Run New Audit.
- **Components:** Breadcrumb, Text Input, Primary/Secondary buttons, SVG Gauge,
  Issue/Audit rows w/ severity, Category breakdown bars, Sticky bottom bar.
- **Empty state:** "No robots.txt detected — Enter a domain above to fetch and
  analyze." (dashed empty card + `Fetch & Analyze` CTA).
- **Loading state:** skeleton gauge + shimmer rows while fetching/parsing.
- **Error state:** fetch failures handled distinctly — domain unreachable, timeout,
  redirect loop, non-text content-type, 404 (treated as "no robots.txt = all
  allowed," shown explicitly, not as an error). Each shows a specific message.
- **Success state:** gauge + audit + breakdown populated; export enabled.
- **Acceptance criteria:**
  - Distinguishes "missing robots.txt (allow-all)" from "fetch error."
  - Score is derived from access %, restrictions, and syntax health (documented formula).
  - Every audit finding has a severity and a one-line plain-English cause.
  - Export produces a shareable report; "Fix Issues" deep-links to Generator/Manager.
  - Handles redirects, timeouts, and wrong content-types gracefully.

### S3 — Generate robots.txt (Screen 3) — Generator

- **Purpose:** produce a correct robots.txt from presets + crawler toggles + rules.
- **User goal:** get a valid file without knowing the syntax.
- **Inputs:** Starter Template chips (Blog, SaaS, E-commerce, Publisher,
  Documentation); per-crawler toggles grouped by category (Search Engines, AI
  Crawlers, SEO Crawlers, Social Crawlers); Advanced Rules — Disallow paths
  (repeatable + "Add path"), Sitemap URL, Crawl-delay; Preview / Raw Editor toggle.
- **Outputs:** **Live Preview** (auto-updating) dark code panel of the generated
  robots.txt; Copy; Download .txt; "What this file does" info panel; file stats
  (group count, line count); "Validate This File"; Download robots.txt CTA.
- **Components:** TopNav, template chips, Category Cards w/ Toggle rows, path inputs,
  Tab Switcher (Preview/Raw), Dark Code Panel, Info Panel, Primary CTA.
- **Empty state:** sensible default (e.g. allow-all + sitemap placeholder) so preview
  is never blank; placeholder sitemap line.
- **Loading state:** none required (generation is synchronous/local); Raw Editor
  reflects edits immediately.
- **Error state:** invalid sitemap URL or malformed path → inline field warning;
  Raw Editor edits that break parsing surface a non-blocking "invalid" hint linking
  to Validate.
- **Success state:** preview reflects all toggles; Copy/Download succeed with toast.
- **Acceptance criteria:**
  - Toggling any crawler updates the preview within the same interaction (no apply).
  - Output is deterministic and always valid for default inputs.
  - Raw Editor and visual controls stay in sync (editor is source-editable).
  - Presets set correct category defaults (e.g. E-commerce disallows /checkout/).
  - Sitemap and crawl-delay render in correct robots.txt positions.

### S4 — Test a URL (Screen 4) — Tester

- **Purpose:** simulate how a given crawler evaluates a URL against robots.txt.
- **User goal:** know — and understand *why* — a URL is blocked or allowed.
- **Inputs:** Domain/Robots.txt source; URL to test; User-Agent selector (dropdown +
  crawler chips: GPTBot, Googlebot, Bingbot, ClaudeBot, PerplexityBot); "Run Test."
- **Outputs:** verdict **BLOCKED/ALLOWED** (large, color-coded); matched rule
  (`User-agent` + `Disallow/Allow`); plain-English explanation of precedence; **Path
  Hierarchy** visualization; **Visual Rule Matching** (dark panel, matched rule
  highlighted); **Rule Trace** (4 numbered steps: Fetch robots.txt → Match
  User-Agent → Evaluate Path Rules → verdict); Recent Tests list; Test Summary
  (counts); Quick Tips. Actions: Fix This Rule · Test Another URL · View Full robots.txt.
- **Components:** Breadcrumb, inputs, dropdown, crawler chips, verdict banner, mono
  rule block, Path Hierarchy, Dark Code Panel w/ MATCH highlight, numbered Rule Trace,
  Recent Tests rows, Test Summary, Quick Tips.
- **Empty state:** before first test — show configuration with a hint; Recent Tests
  empty placeholder.
- **Loading state:** "Run Test" spinner while fetching/parsing remote robots.txt.
- **Error state:** can't fetch robots.txt → explain (treat 404 as allow-all and say
  so); invalid URL/user-agent → inline validation.
- **Success state:** verdict + matched rule + full trace render; test added to Recent.
- **Acceptance criteria:**
  - Verdict matches the documented matching algorithm (longest-match / Allow-vs-
    Disallow precedence, wildcards `*`, `$` anchor, case sensitivity).
  - The matched rule and the "first matching rule wins" reasoning are always shown.
  - The 4-step trace is always present and accurate, including which user-agent group
    was selected (specific vs `*`).
  - Recent Tests persists within the session.

### S5 — AI Crawler Manager (Screen 5) — Crawler Manager

- **Purpose:** decide which crawlers may access the site, by category, with context.
- **User goal:** allow/block bots confidently, understanding each one's impact.
- **Inputs:** Recommended Presets (Blog/Publisher, SaaS/Docs, E-commerce,
  Open/Research, **Block All AI Crawlers**); search ("by name or owner"); Allow All /
  Block All; per-crawler Toggle.
- **Outputs:** categorized crawler rows (Search Engines, AI Training, AI Search,
  Other/Data) each with logo tile, name, owner, "what this means" description,
  Allowed/Blocked badge; **Impact Preview** panel on change; recommendation tags
  (e.g. "Recommended: Block all"); export bar: counts · Preview Block · Add to
  Generator · Copy robots.txt Block; "Load more crawlers."
- **Components:** Breadcrumb, Info Panel ("What are AI crawlers…"), Preset Buttons,
  Search Input, Category Cards, Crawler Rows w/ Toggle + Status Badge, Impact Preview,
  Sticky bottom bar.
- **Empty state:** search no-match → "No results found — adjust your search or
  filters" + Clear filters.
- **Loading state:** crawler DB is local/config — render immediately; "Load more"
  may lazy-render.
- **Error state:** none for local data; export copy failure → toast retry.
- **Success state:** toggles reflected instantly in the export preview/count; Copy/
  Add to Generator succeed.
- **Acceptance criteria:**
  - Crawler data (name, owner, user-agent, purpose, category, recommendation) comes
    from the **config layer** (`src/config/crawlers`), not hardcoded UI.
  - Presets set documented allow/block patterns; "Block All AI Crawlers" blocks the
    AI training + AI search categories.
  - Changes update the export preview within the interaction (live).
  - Search filters by crawler name and owner.
  - "Add to Generator" hands the current selection to S3.

### S6 — Validate robots.txt (Screen 6) — Validator

- **Purpose:** diagnose a robots.txt for errors, warnings, and best-practice issues.
- **User goal:** catch mistakes (and fix them) before they go live.
- **Inputs:** Paste Content / Fetch from URL tabs; code editor (editable, line-numbered).
- **Outputs:** **Robots Health Score** gauge (e.g. 72/100, "Good") with sub-scores
  (Syntax, AI Crawler Config, Best Practices); severity filter tabs (All / Errors /
  Warnings / Info with counts); **Issue Cards** (severity icon, title, line ref,
  description, Fix This / Learn More); line highlighting in the editor (red/amber);
  "Fix All Issues"; Educational Recommendations.
- **Components:** Breadcrumb, Tab Switcher (Paste/Fetch), Code Editor w/ line
  highlights, SVG Gauge w/ sub-scores, severity filter tabs, Severity Badges, Issue
  Cards, Info/edu panel.
- **Empty state:** empty editor → prompt to paste or fetch; gauge shows "—".
- **Loading state:** Fetch from URL → spinner; validation of pasted text is instant.
- **Error state:** fetch failure → message; unpar. content still validated line-by-line
  with explicit syntax errors rather than crashing.
- **Success state:** score + categorized issues render; clicking an issue scrolls to
  and highlights its line.
- **Acceptance criteria:**
  - Detects (at minimum): missing colon / invalid syntax, unsupported directives,
    duplicate rules, empty directives, conflicting Allow/Disallow, missing sitemap,
    `crawl-delay: 0`, HTTP (vs HTTPS) sitemap, missing AI-crawler config, no comments.
  - Each issue has severity (Error/Warning/Info), a line number, and a plain-English
    description; issue ↔ editor line are cross-linked.
  - Health score is decomposed into Syntax / AI Crawler Config / Best Practices.
  - "Fix This"/"Fix All" propose concrete edits (deterministic).

### S7 — Explainer (defined, mock pending)

- **Purpose:** translate a robots.txt into plain English, per group.
- **User goal:** understand what an inherited file actually does.
- **Inputs:** paste raw robots.txt or fetch from URL.
- **Outputs:** per-group, plain-English explanation (e.g. "GPTBot is blocked from
  crawling your website"; "This blocks all crawlers from every page").
- **States:** empty (prompt to paste/fetch) · loading (fetch only) · error (fetch/
  parse) · success (explanation list). **Deterministic, no LLM initially** (per brief).
- **Acceptance criteria:** explanations are generated from the parsed AST,
  group-by-group, covering allow/disallow scope, wildcards, sitemap, crawl-delay, and
  notable AI crawlers. Must not require an LLM in v1.

---

## 12. Feature Specifications

| Module | Core capability | Inputs → Outputs | Key rules |
| --- | --- | --- | --- |
| **Generator** | Build robots.txt | presets + toggles + rules → file | Deterministic, always-valid defaults, live preview |
| **Validator** | Diagnose file | raw text → ValidationResult[] | Error/Warning/Info, line-linked, health score |
| **Tester** | Match URL × UA | robots + URL + UA → TestResult | Allow/Disallow precedence, `*`/`$`, group selection, trace |
| **Explainer** | Plain-English | raw text → ExplanationResult | Deterministic from AST, per-group, no LLM v1 |
| **AI Crawler Manager** | Permission control | preset/toggles → robots block | Config-driven crawler DB, presets, impact preview |
| **Live Checker** | Audit live site | domain → fetch+parse+validate+explain | Server-side fetch; handle 404/redirect/timeout/content-type |

**Shared parser** (`src/parser`) is the one source of truth feeding Validator,
Tester, Explainer, and Live Checker. It must support: `User-agent`, `Allow`,
`Disallow`, `Sitemap`, `Crawl-delay`, comments, and multiple groups; returning a
structured AST. No third-party robots parser (own implementation, per brief).

**Crawler database (config layer).** Each crawler: `id`, `name`, `owner`,
`userAgent`, `category` (search-engine | ai-training | ai-search | seo | social |
data), `description` ("what this means"), `defaultRecommendation`, `docsUrl`. Initial
set must include at least: Googlebot, Bingbot, Slurp, GPTBot, ClaudeBot,
PerplexityBot, CCBot, Google-Extended, Applebot-Extended, Bytespider,
Meta-ExternalAgent, Amazonbot, cohere-ai, Diffbot, ImagesiftBot, AhrefsBot,
SemrushBot, MJ12bot, Twitterbot, facebookexternalhit. Designed for easy extension.

---

## 13. Design System Summary

Full reference: [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md). Essentials:

- **Principles:** Minimalist · Developer-First · Trustworthy · Hierarchy ·
  Purposeful Color (**80% gray / 15% blue / 5% semantic**).
- **Color:** neutral scale base; **`blue-600` is the only brand accent** (CTAs,
  active, links); semantic green/red/amber for status only; `neutral-950` dark
  surfaces (nav, code). Gauge thresholds 80+/60–79/0–59 = green/amber/red.
- **Type:** Inter (UI), Geist Mono (all code/paths/user-agents), Source Serif 4
  (optional). Display→Caption scale + uppercase tracked section labels.
- **Spacing:** 4px base; **outside-in** (page `p-12`, card `p-6`, inner `gap-2`).
- **Radius:** chips `sm`, controls `lg`, cards/panels `xl`, pills `full`.
- **Surfaces:** standard card, category card, blue info/impact panel, dark code panel,
  dashed empty state.
- **Responsive:** desktop-first ≥1140px → mobile bottom-tab-bar <600px.

> **Implementation deviation to fix in Phase 10:** the Phase 1 `globals.css` uses an
> HSL blue `--primary`. Migrate to the OKLCH neutral base from the handoff and add
> explicit `--brand` (blue-600) + status tokens, so we don't overload shadcn's
> `--primary`. Tracked in [`DESIGN_SYSTEM.md` §2](./DESIGN_SYSTEM.md).

---

## 14. Component Inventory

Grouped, mapping to `src/components/ui` (shadcn primitives) + feature `ui/` folders.
Recipes in [`DESIGN_SYSTEM.md` §6](./DESIGN_SYSTEM.md).

- **Navigation:** TopNav (dark bar), Breadcrumb, Tab Switcher (pill), Underline Tabs,
  Sticky Bottom Bar, Bottom Tab Bar (mobile).
- **Data Display:** Crawler Row, Category Card, SVG Gauge (score), Progress Bar, Mini
  Bar Chart, Table/List rows, Dark Code Panel.
- **Feedback:** Status Badge (pill), Severity Badge, Severity Icon, Issue Card, Info
  Banner, Impact Preview, Empty State.
- **Forms & Actions:** Text Input, Search Input, Toggle Switch, Preset/Chip Button,
  Button (Primary/Secondary/Outline/Destructive), Code Editor Panel.

**Ownership rule:** generic primitives live in `src/components/ui`; screen-specific
compositions (e.g. Rule Trace, Crawler Breakdown) live in the relevant feature's
`ui/` folder and are exported through the feature barrel.

---

## 15. Domain Models

Implemented in `src/types` (Phase 2) as pure TypeScript; boundary validation lives
in `src/schemas` (Zod). These are the shared vocabulary across all modules. The
names below reflect the implemented layer (refined from the original §15 draft — see
the Phase 2 refinements A/B/C noted at the end of this section).

**Robots.txt AST (`robots.ts`) — the single canonical representation**
- **Directive** — one source line: `{ field, value, raw, line }` where `field` ∈
  `user-agent | allow | disallow | sitemap | crawl-delay | host | comment | blank | unknown`.
- **CrawlRule** — an Allow/Disallow path rule: `{ type, path, hasWildcard, hasEndAnchor, raw, line }`.
- **RobotsGroup** — `{ userAgents, rules, crawlDelay?, lineRange }`.
- **RobotsFile** — the AST: `{ groups, sitemaps, host?, comments, unknownDirectives, lineCount, source? }`.
  Produced by **both** the parser (from text) and the generator (from config).

**Crawler (`crawler.ts`)**
- **Crawler** — `{ id, name, owner, userAgent, category, description, defaultRecommendation, docsUrl? }`.
- **CrawlerCategory** — `search-engine | ai-training | ai-search | seo | social | data`.
- **CrawlPolicy** — `allow | block` (user intent); distinct from a rule's `allow | disallow`.

**Scoring (`score.ts`)** — one banding rule shared by Validator + Analyzer
- **Score / ScoreBand** + `scoreBand()` (80/60 thresholds), **HealthScore**, **VisibilityScore**.

**Validation (`validation.ts`)**
- **ValidationIssue** — one finding: `{ id, severity, code, title, message, line?, lineRange?, fix?, learnMoreUrl? }`.
- **ValidationResult** — aggregate: `{ isValid, issues, health, counts }`.

**Tester / Explainer / Analyzer**
- **UrlTestResult** — `{ url, userAgent, decision, matchedRule?, matchedUserAgent?, reason, trace }`.
- **ExplanationResult** — `{ summary, groups, sitemaps, notes }`.
- **FetchResult** — `{ status, requestedUrl, finalUrl?, httpStatus?, contentType?, body?, robotsExists, redirected, error? }`.
- **AnalysisReport** — composes the above: `{ domain, fetchedAt, fetch, file, validation, visibility, breakdown, findings, recommendations, explanation? }`.

**Generator / Compare / Monitoring**
- **GeneratorConfig** — `{ template?, crawlerPolicies, disallowPaths, sitemapUrl?, crawlDelay? }`.
- **RobotsDiff / DiffChange** (Compare) and **MonitoredSite / MonitorSnapshot /
  MonitorChangeEvent** (Monitoring) reuse `RobotsFile` and `AnalysisReport` — no new core concepts.

Models are **plain data** + a few pure helpers (`scoreBand`, `compareSeverity`);
pure functions in `src/parser` and feature `domain/` operate on them. No
React/`next/*`/`zod` imports in this layer.

> **Phase 2 refinements (vs. the original §15 draft):** (A) one `RobotsFile` AST
> replaces the separate parse/generate shapes; (B) the parser emits **no**
> `ValidationIssue`s — it preserves fidelity (`unknownDirectives`, line numbers) and
> the Validator derives all judgements; (C) `ValidationResult` (aggregate) is split
> from `ValidationIssue` (item), and Validator health + Analyzer visibility share one
> `Score`/`scoreBand`.

---

## 16. Technical Architecture Summary

Full rationale: Phase 1 commit + `README.md`. Essentials:

- **Stack:** Next.js 15 App Router, TypeScript (strict), Tailwind v4, shadcn/ui, Zod
  (boundaries only), Vitest + Playwright, Vercel, Plausible.
- **Layering (one-directional):** `ui (React) → feature lib → domain (pure) → types/config`.
  Domain/parser never import React or `next/*`.
- **Feature-based slices:** each feature owns `domain/ lib/ ui/ index.ts`; imported
  only via its barrel (ESLint-enforced). Shared `parser/` is top-level (4 consumers).
- **Server-side fetch:** Live Checker / remote-fetch tools use Route Handlers to avoid
  browser CORS and to control redirects/timeouts/content-type.
- **Config layer:** crawler DB + website-type presets + module registry as data.
- **Domain vs. schemas:** pure models in `src/types` (no `zod`); boundary DTO
  validation in `src/schemas` (the only `zod` importer) — keeps types dependency-free.
- **Testing:** 80%+ coverage gate on `parser/` and feature `domain/`+`lib/`.

### Route Map

| Route | Screen | Type | Phase |
| --- | --- | --- | --- |
| `/` | Landing (S1) | Static/marketing | 10/12 |
| `/analyze` | Crawler Visibility Audit (S2) | Tool (server fetch) | 9/10 |
| `/generate` | Generator (S3) | Tool (client) | 4/10 |
| `/validate` | Validator (S6) | Tool (client + opt. fetch) | 5/10 |
| `/url-tester` | Tester (S4) | Tool (client + opt. fetch) | 6/10 |
| `/ai-crawlers` | AI Crawler Manager (S5) | Tool (client) | 8/10 |
| `/explain` | Explainer (S7) | Tool (client + opt. fetch) | 7/10 |
| `/crawlers` | Crawler Directory (S8) | Reference/SEO | 12 |
| `/compare` | Compare (S9) | Tool | Future |
| `/dashboard` | Dashboard (S10) | App (post-auth) | Future |
| `/robots-txt-generator`, `/robots-txt-tester`, `/robots-txt-validator`, `/robots-txt-checker`, `/robots-txt-format`, `/robots-txt-syntax`, `/wordpress-robots-txt`, `/gptbot-robots-txt`, `/claudebot-robots-txt`, `/perplexitybot-robots-txt` | SEO keyword pages | Static, funnel to tools | 12 |
| `/api/fetch-robots` | Live fetch endpoint | Route Handler | 9 |
| `/api/health` | Healthcheck | Route Handler | 13 |

---

## 17. Milestone Plan

Phased delivery (Phase 1 complete). Each phase: explain goals/architecture/tradeoffs,
build, verify, await approval.

| Phase | Deliverable | Notes |
| --- | --- | --- |
| 1 ✅ | Architecture & setup | Done (commit `d976fbb`) |
| — | **Product docs (this PRD + Design System)** | This deliverable |
| 2 | Core domain models | `src/types` per §15 |
| 3 | robots.txt parser | Shared AST, own impl, unit-tested |
| 4 | Generator | S3; presets + live preview |
| 5 | Validator | S6; severity + health score |
| 6 | Tester | S4; matching + rule trace |
| 7 | Explainer | S7; deterministic, no LLM |
| 8 | AI Crawler Manager | S5; config-driven crawler DB |
| 9 | Live Checker | S2; route handler fetch + audit |
| 10 | UI integration | Apply design system; all screens |
| 11 | Testing | 80%+ core coverage; e2e |
| 12 | SEO pages | Keyword routes (§16) |
| 13 | Deployment | Vercel + Plausible |

---

## 18. Future Opportunities

- **Compare / diff** two robots.txt files or before/after a change.
- **Accounts + Dashboard:** save sites, history, scheduled re-audits, change alerts
  ("a crawler you allowed is now blocked").
- **Monitoring:** notify on robots.txt changes or new AI crawler appearances.
- **Agency mode:** multi-site management, white-label exports, shareable report links.
- **LLM-assisted explanations** layered *on top of* the deterministic baseline.
- **Sitemap validation** and crawl-budget insights.
- **Crawler Directory as SEO asset:** a page per crawler (gptbot, claudebot, …).
- **Browser extension / API** for programmatic checks in CI.

---

## 19. Non-Goals

- **Not** a general SEO suite (no rank tracking, backlinks, keyword research).
- **Not** a server/CDN that serves robots.txt; we generate/analyze, we don't host.
- **Not** an LLM wrapper — core explanations and validation are deterministic v1.
- **Not** a crawler/scraper itself (beyond fetching a site's own robots.txt).
- **No** mandatory sign-up to use the core tools.
- **Not** dependent on a third-party robots.txt parsing library (own parser).
- **No** dark-pattern monetization; trust/explainability is the product.

---

## 20. Success Metrics

**Activation**
- % of landing visitors who run an Analyze/audit (hero-flow conversion).
- % who reach any tool without sign-up.

**Engagement / value**
- Tool completion rate (e.g. Generator → Copy/Download; Tester → result).
- Cross-flow funnel: Analyze/Validate → "Fix Issues"/"Add to Generator".
- Repeat usage per session (Recent Tests count, multi-tool sessions).

**Quality / trust (product correctness)**
- Parser/tester correctness vs. a known robots.txt conformance test suite.
- ≥80% unit coverage on core logic (enforced).
- Validator false-positive/negative rate on a curated corpus.

**Acquisition (SEO)**
- Organic impressions/clicks on keyword routes (§16) via Plausible/Search Console.
- Ranking for target keywords (generator, tester, validator, gptbot/claudebot/
  perplexitybot robots.txt).

**Reliability**
- Live Checker fetch success rate; correct handling of 404/redirect/timeout/content-type.
- p95 audit latency.

---

### Appendix — Source assets

- Approved screens: `Screens/Screen 1–6.png`.
- Design handoff (overview): `Screens/design_spec.png`.
- Coded design reference: `Screens/design_spec_vite/Screen 8/` (`src/index.css` tokens,
  `src/App.tsx` component recipes).
- Architecture: Phase 1 commit, `README.md`, `src/config/modules.ts`.
