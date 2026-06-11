# Analyzer & Dashboard UX Review — "From Report to Verdict"

> **Status: Phase 17A SHIPPED** (verdict band `app/analyze/verdict-band.tsx`, Action
> Queue `app/analyze/action-queue.tsx`; Strengths/Weaknesses, the second hero score,
> "Error rate", the Fix & export toolbar, and the Issues/Recommendations split are
> gone from the Analyzer — `AuditDashboard` now has no production consumer). Measured
> scroll: 4.30 → 1.99 viewports at 1440×900, 7.46 → 3.08 at 390×844 (same mocked
> report).
>
> **Phase 17B SHIPPED** (17B.1 Access Matrix `app/analyze/access-matrix.tsx` —
> named blocked-bot chips + split bars, §7 option A; 17B.2 read-only file view via
> `RobotsEditor` `readOnly`; 17B.3 dimension chips as queue filters via the shared
> `components/dimension-chip-strip.tsx`, lifted from the Validator). First-viewport
> coverage at 1440×900: verdict band + full matrix visible (queue header at the
> fold); at 390×844: band + matrix through the AI-training row with its blocked
> chips. Phases 17C–17D remain proposals.
>
> Originally a design-only review of
> the Analyzer (`src/app/analyze/`) and the homepage-as-dashboard experience
> (`src/app/page.tsx`). Companion docs: [`ANALYZER.md`](./ANALYZER.md),
> [`VALIDATOR_UX_REDESIGN.md`](./VALIDATOR_UX_REDESIGN.md) (the Phase 16 playbook
> this review extends), [`AI_MANAGER.md`](./AI_MANAGER.md),
> [`PHASE_15_ANALYZER_ROADMAP.md`](./PHASE_15_ANALYZER_ROADMAP.md).
>
> File-map corrections vs. the review brief: the visibility card is not a
> dedicated component — it is the generic `ScoreCard` (`src/components/score-card.tsx`
> with `health-gauge.tsx`) instantiated inline in `analyzer-screen.tsx`; the analyzer
> domain lives in `src/features/live-checker/` (there is no `features/analyzer/`).

---

## 1. Executive summary

The Analyzer's engine is excellent and its UI is a year behind its own product.
It computes a connected story — _who can crawl this site, what that costs, and
exactly which one-click fixes recover the points_ — and renders it as **eight
stacked, non-interacting cards** that restate each other. The same finding can
appear in up to **five places** (Weaknesses bullet, Highest-priority row, Score
breakdown deduction, IssueCard, Recommendation) while the one thing the user came
for — _"what should I do first?"_ — has no single home.

Three structural problems dominate everything else:

1. **Two competing hero scores.** Visibility (gauge) and Overall Health (ring)
   sit one above the other, visually equal, mathematically entangled
   (`visibility = 0.5·search + 0.2·ai + 0.3·health`, and "Error rate" is
   literally `100 − health` renamed). The user cannot tell which number is the
   verdict. **One executive verdict; health becomes a contributing metric.**
2. **The action is buried under the readout.** "Fix & export" — the product's
   differentiator — is the seventh block, 3–4 viewports down, _below_ four cards
   of passive analysis. Priorities are listed read-only at the top and fixable
   only at the bottom. **The primary CTA belongs in the verdict band.**
3. **Percentages where names belong.** "AI access 88%" answers nothing a site
   owner asks. The real question is _"is GPTBot in or out?"_ — and the engine
   already knows, per named bot. **Replace abstract percentages with named
   allowed/blocked crawlers.**

Separately, the homepage ignores returning users. After three analyses, coming
back still shows a locked-report teaser and an empty "Recent activity" section
that _advertises its own absence_ ("Saved history is coming soon"). A
localStorage-only "Continue working" panel — recent domains, last scores,
re-analyze in one click — turns a brochure into a dashboard with zero backend.

The strategic through-line: **Phase 16 already built the remediation workspace**
(command bar, dimension chips, linked issue panel, `RobotsEditor`). The Analyzer
should converge on those primitives instead of maintaining a parallel,
pre-Phase-16 presentation (`AuditDashboard`, `IssueCard` stacks). The Analyzer's
identity stays distinct — it leads with _access_ ("who gets in"), the Validator
leads with _the file_ ("is it right") — but the fix loop should be the same
muscle memory in both.

---

## 2. Problems discovered

### P-1 — Redundant scoring surfaces (severity: high)

| Fact               | Where it renders today                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| Health score       | Health ring (132 px) · "Error rate 15%" metric (inverted) · per-dimension cards · band chip         |
| `crawl-delay-zero` | Weaknesses bullet · Highest-priority row · Maintainability deduction row · IssueCard                |
| `missing-sitemap`  | Weaknesses bullet · Priority row · SEO deduction row · IssueCard _or_ Recommendation                |
| GPTBot blocked     | "AI access 88%" · ai-training category tally · per-crawler row (collapsed) · AI dimension deduction |

Zero added information per repetition; each repetition is another card to scroll.

### P-2 — Verdict ambiguity (high)

Visibility 93 (gauge) and Health 85 (ring) render with equal visual weight and
no stated relationship. Which one do I report to my boss? Which one do fixes
move? (Answer: both, because health feeds visibility — never stated on screen.)

### P-3 — "Error rate" is a lie (high, trivial to fix)

`errorRate = 100 − health`. A file with zero errors and a few warnings shows
"Error rate: 12%". It is not a rate, and not errors. This single label can
destroy trust with a technical user ("my server has 0% errors — this tool is
wrong").

### P-4 — Action/readout inversion (high)

Read order today: fetch status → visibility → health + strengths/weaknesses +
priorities → 5 dimension cards → crawler breakdown → **finally** Fix & export →
Issues → Recommendations → Next steps. The "Highest-priority fixes" list at the
top is _display-only_ — the buttons that execute those exact fixes are 3+
viewports below, in a differently-ordered list.

### P-5 — The file is invisible (medium-high)

The Analyzer fetches, fixes, and downloads a file the user **never sees**. No
source view exists; the only glimpse is the cumulative diff _after_ a fix.
Findings cite line numbers of an invisible document. The Validator solved this
in Phase 16 (`RobotsEditor` with annotations); the Analyzer got nothing.

### P-6 — Strengths/Weaknesses is template filler (medium)

`buildSummary` generates them mechanically: dimension ≥ 85 → "X is solid
(97/100)", else "X needs attention (62/100)". They restate the dimension cards
rendered 100 px below, in vaguer words. Users skim past; the section spends a
full card band to say nothing actionable. (Phase 16 already deleted these from
the Validator for exactly this reason.)

### P-7 — Issues vs. Recommendations is an engine-internal split (medium)

Errors/warnings → "Issues"; info + fetch notes → "Recommendations". That's a
severity enum leaking into IA. The user has one question — _what should I do?_
— and gets two lists with two different ranking schemes and two different
action affordances (Fix buttons vs. deep links).

### P-8 — Homepage has no memory (high for retention)

`page.tsx` renders identically on visit 1 and visit 50: hero → locked-report
teaser → 6 tool cards → AI banner → 6 learn cards → an _empty-state_ "Recent
activity" that promises "coming soon". A returning user re-types their domain
from scratch. Nothing shows their last score, nothing offers "re-check".

### P-9 — Scroll cost (medium)

Eight stacked cards ≈ 4–5 viewports at 1440×900 before the rails. Linear/Stripe
reports of comparable density fit the verdict + actions in viewport one and put
evidence behind progressive disclosure.

### P-10 — Crawler breakdown is hidden gold (medium)

The per-crawler allowed/blocked table — the most concrete, shareable artifact in
the product ("reddit.com blocks CCBot") — is collapsed behind six `<details>`
toggles, below two score cards, styled as an appendix.

---

## 3. Founder review

**The reddit.com test.** A first-time user types `reddit.com` and lands on the
report. What do they see today? A green "fetched successfully" callout, a gauge
saying "Moderate Visibility 67", then a second ring saying health 88, then
strengths/weaknesses prose. The actual story — _reddit blocks essentially every
AI training bot and welcomes search engines_ — is six collapsed accordions deep.

The first three things they **should** notice, in order:

1. **The verdict, in one sentence with one number.** "reddit.com — Visibility
   67/100. Search engines: full access. AI crawlers: 9 of 11 blocked." A
   non-technical visitor should be able to screenshot the top band and have it
   mean something.
2. **The named access picture.** Logos/names: Googlebot ✓ Bingbot ✓ GPTBot ✗
   ClaudeBot ✗ CCBot ✗ — because _names_ are what people gossip about, share,
   and act on. This is also the viral artifact ("look who X blocks").
3. **Their move.** For a site they own: "Fix 3 issues → 67 becomes 81" with a
   button. For a site they don't own (reddit): "Compare with your site" /
   "Analyze your own domain" — the conversion path.

**Two jobs, one screen.** The Analyzer serves _owners_ (audit → fix → deploy)
and _spies_ (competitive curiosity — a large share of organic traffic). Today's
layout serves neither: owners can't find the fix loop; spies can't find the
who's-blocked table. The redesign serves both with the same hierarchy: verdict →
access matrix → action queue. Spies stop at level 2; owners continue to level 3.

**Where the moat is.** Every robots.txt checker prints warnings. Nobody else
connects _named-bot access_ + _scored impact_ + _one-click repair_ + _download_.
The redesign's only job is to make that chain visible in one screen-height.
This is the same thesis as Phase 16 — and Phase 16's shipped components are the
proof it works. The Analyzer converging on the workspace primitives is not just
UX consistency; it halves the surface we must polish forever.

**The retention story is the dashboard.** A robots.txt file changes rarely; a
user's _portfolio_ of sites and competitors changes often. "Continue working"
(recent analyses, deltas, one-click re-check) is what makes visit 2 happen —
and it costs a localStorage array. The current empty "Recent activity"
placeholder is worse than nothing: it documents that we didn't build it.

**What I would not do.** Don't merge the Analyzer into the Validator route or
vice-versa — entry intent differs (URL vs. text) and the SEO pages target
different queries. Don't add tabs/sidebar navigation inside the report —
progressive disclosure on one scroll is right for a report. Don't gate anything
behind sign-up to fake a dashboard; localStorage keeps the "no sign-up" promise
that the homepage makes in three places.

---

## 4. UX critique — section by section

Scored against: information hierarchy · action hierarchy · cognitive load ·
scanability · motivation · "does it answer _what should I do next?_"

| Section                         | Verdict                  | Critique                                                                                                                                                                                                                                                                                         |
| ------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fetch status callout            | **Improve**              | Right content, wrong prominence: a green "fetched successfully" banner is the _least_ informative outcome taking first position. Fold the success case into the verdict band's metadata line; keep a prominent callout only for non-`ok` outcomes (those genuinely change the report's meaning). |
| Crawler Visibility Score card   | **Replace**              | The signature number is right; the presentation isn't. Gauge + "High/Moderate/Low Visibility" title + three percentages = an analytics widget. No action, no names, no potential. Becomes the verdict band (§5) with named-bot evidence (§7).                                                    |
| Overall health ring             | **Demote**               | 132 px of ring for a number that is 30% of the headline score. Health stays — as a labeled contributing metric inside the verdict band ("File health 85 → 96 after fixes"), not a second hero. The ring component survives wherever a standalone health view is needed (dev gallery).            |
| Strengths / Weaknesses          | **Remove**               | Template strings of the dimension scores (≥ 85 = strength). Duplicates the cards below. Phase 16 already removed it from the Validator; `AuditDashboard` is now Analyzer-only, so it can be deleted without collateral.                                                                          |
| Highest-priority fixes          | **Promote & merge**      | The right idea, crippled: display-only, top-4, de-duplicated by code, disconnected from the buttons that execute them. Becomes the _primary_ section — the Action Queue (§5) — with the fix/deep-link affordances inline.                                                                        |
| Score breakdown (5 cards)       | **Demote to disclosure** | Useful evidence, wrong altitude. Five collapsed cards in a grid is a wall of equal-weight chrome. Becomes one row of dimension chips (the Phase 16 `DimensionChips` pattern: `SEO 96 +4`) whose panel shows the deduction detail on demand.                                                      |
| Crawler breakdown (per-crawler) | **Promote**              | The most concrete artifact in the product, currently an appendix. Moves to position 2 as the access matrix (§7), open by default for the two AI categories (the product's thesis), collapsed for the rest.                                                                                       |
| Fix & export toolbar            | **Promote**              | Correct actions, wrong position (7th block) and no payoff label. Primary action moves into the verdict band as "Fix N safe issues +Δ pts" (identical contract to the Validator's command bar). The cumulative-diff-vs-live panel is genuinely good and stays with the file view.                 |
| Issues list                     | **Merge**                | IssueCards are pre-Phase-16: no impact ordering visible, no line linking (no file to link to), severity-first framing. Merges into the Action Queue, impact-ranked.                                                                                                                              |
| Recommendations                 | **Merge**                | Same queue. An info-level row's "action" is a deep link instead of a Fix button — that's a row variant, not a separate section.                                                                                                                                                                  |
| Next steps + related rail       | **De-emphasize**         | Same treatment as the Validator got in Phase 16.1: Next Steps renders only when the queue is empty; the rail collapses into `<details>`.                                                                                                                                                         |

**Cognitive-load summary:** today a user holds ~6 mental joins (visibility ↔
health ↔ error-rate ↔ dimensions ↔ issues ↔ recommendations). The redesign asks
for one: _verdict → things to do_.

---

## 5. Proposed Analyzer redesign

### Information architecture (top to bottom)

```
1. DOMAIN BAR        input + Re-analyze (compact once a report exists)
                     recent-domain chips (from the same localStorage as §6)
2. VERDICT BAND      the ONE executive summary (sticky on scroll, like the
                     Validator command bar):
                     · Visibility 67 NOW → 81 POTENTIAL  + band chip
                     · one-sentence headline (who's in, who's out, what it costs)
                     · contributing metrics: Search access 10/10 · AI access 2/11 ·
                       File health 85
                     · PRIMARY: [Fix 3 safe issues +9 pts]  [Undo] [Download]
                     · metadata line: fetched 200 OK · 2.1 KB · redirected → www
3. ACCESS MATRIX     "Who can see reddit.com" — named bots, allowed/blocked,
                     segment bars per category; AI categories expanded by default
4. ACTION QUEUE      one impact-ranked list replacing Priorities + Issues +
                     Recommendations. Row = severity dot · title · +pts ·
                     [Fix this | Open AI Manager | Open Generator] · expandable
                     "why this matters" + diff preview (Phase 16 issue-panel
                     pattern, minus line-jumping until the file view ships)
5. THE FILE          read-only RobotsEditor with severity annotations + the
                     cumulative diff vs. live once edits exist (collapsed by
                     default at first; becomes a split pane in the workspace
                     convergence phase)
6. DIMENSION CHIPS   Syntax 100 ✓ · SEO 96 +4 · AI 40 +35 · … (chips filter the
                     queue; panel shows deductions — reuse Phase 16 components)
7. SETTLED STATE     Next Steps (only when the queue is empty) · collapsed rail
```

### Decisions the brief asked for, answered

- **What replaces Strengths/Weaknesses?** Nothing. Its honest content (dimension
  scores) lives in the chips; its dishonest content (prose padding) dies. The
  verdict headline absorbs the one useful sentence.
- **Do Highest Priority Fixes become the primary section?** Yes — as the Action
  Queue, merged with Issues + Recommendations, ranked by `fixImpact` points
  (recoverable first, then manual, then advisories), each row carrying its own
  button. One list, one ranking, every row actionable.
- **Combine Visibility and Health into one executive summary?** Yes. Visibility
  remains the headline number (the Analyzer's signature and its SEO identity);
  health appears inside the band as a contributing metric with its own
  potential. Never two heroes again.
- **How does score recovery become more prominent?** Exactly the Phase 16
  contract: `NOW → POTENTIAL` as the dominant reading, the button carries its
  payoff, every queue row shows `+N pts`, chips show `+available`.
- **How do we reduce duplication?** Each fact gets one home: score → verdict
  band; per-bot access → matrix; per-rule work → queue; per-dimension math →
  chip panels; file content → file view. The matrix and the queue may reference
  the same underlying rule (e.g. GPTBot blocked) but answer different questions
  (state vs. task) — that's the only sanctioned overlap.

### Component strategy (so implementation needs no new design)

| Surface         | Build                                                                                                                                  | Reuse                                                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Verdict band    | `analyzer/verdict-band.tsx` — variant of `app/validate/command-bar.tsx` with headline sentence + contributing metrics + fetch metadata | Button, band-chip styles, score-current testid contract                                                                            |
| Access matrix   | `analyzer/access-matrix.tsx` (§7 option A)                                                                                             | `CrawlerBadge`, `StatusBadge`, category data from `computeBreakdown` + `isAllowed`                                                 |
| Action queue    | `analyzer/action-queue.tsx`                                                                                                            | `issue-panel.tsx` row anatomy (severity chip, +pts, expandable why/diff), `whyItMatters`, `DiffView`, `RecommendationCard` retired |
| File view       | —                                                                                                                                      | `RobotsEditor` (already abstracted; pass `annotations`, omit `onChange` for read-only)                                             |
| Dimension chips | —                                                                                                                                      | `app/validate/dimension-chips.tsx` (lift to shared location, e.g. `src/components/score-chips.tsx`, when the Analyzer adopts it)   |
| Retired         | `AuditDashboard` (Analyzer was its last consumer), Analyzer's `ScoreCard` instance, `RecommendationCard` on this screen                | `IssueCard` stays for any remaining consumers until the queue ships                                                                |

Analytics additions (extend the Phase 2A taxonomy): `action_queue_clicked
{code, kind: fix|deep-link}`, reuse `fix_applied`/`fix_undone` with a
`surface: "analyzer"` property; verdict CTA uses the existing `fix_applied
{mode: "all-safe"}`.

---

## 6. Proposed homepage / dashboard redesign

### Principle

The homepage has two audiences with zero overlap: **strangers** (need the
pitch) and **returners** (need their stuff). Detect returners client-side via
localStorage; never make a stranger scroll past an empty dashboard, never make
a returner scroll past the pitch.

### Persistence (no backend)

```ts
// localStorage key: "rs:recent-analyses"   (cap 10, newest first, LRU by domain)
interface RecentAnalysis {
  domain: string; // normalized, e.g. "reddit.com"
  fetchedAt: string; // ISO
  visibility: { value: number; band: ScoreBand };
  health: { value: number; band: HealthBand };
  fetchStatus: FetchStatus; // "ok" | "not-found" | …
  findingCount: number; // errors + warnings at fetch time
  safeFixCount: number; // 1-click recoveries available
  previous?: { visibility: number; fetchedAt: string }; // set on re-analysis → delta
}
```

Written by `AnalyzerScreen` when a report lands (and updated after fixes only
for `safeFixCount`). Read by a small client component on the homepage and by
the Analyzer's recent-domain chips. Storage failures are silently ignored
(private browsing). A "Clear history" affordance deletes the key — local-only
is a _feature_; say so in the UI ("History is stored only in this browser").

### States

- **First-time (no key):** today's page, minus the two broken promises — delete
  the bottom "Recent activity" empty-state entirely, and keep `LockedReport`
  as the report teaser (it now only ever renders for strangers, which is
  exactly its design intent).
- **Returning (key non-empty):** the `LockedReport` slot becomes **Continue
  working** — a card listing recent analyses; the hero stays (input is still
  the fastest path) but the locked teaser is gone. Each row: letter-avatar ·
  domain · visibility score + band dot · delta vs. previous run (`▲ +6` /
  `▼ −3` / `—`) · "N fixes available" · relative timestamp · **Re-analyze** →
  `/analyze?domain=…` (the existing deep-link; zero new routing). Row click =
  same navigation. Overflow menu: Remove · Compare → `/compare?a=…`.
- **Empty-after-clear:** identical to first-time (the clear action removes the
  key; no special third state to design or test).

No favicon service (an external `<img>` per domain leaks the user's analysis
history to a third party — letter avatars cost nothing and stay private).

Secondary placement: on `/analyze`, render the same recent domains as one row
of chips under the input (`reddit.com · 2h ago · 67`), so the resume loop works
wherever the user lands. SSR note: the homepage stays a server component; the
Continue-working slot is one client island that renders `LockedReport` as its
no-data fallback, so there's no layout shift for strangers and no SEO impact
(the educational content below is untouched).

Analytics: `recent_analysis_saved {findingCount}`, `dashboard_resume_clicked
{ageHours, hasDelta}`, `dashboard_history_cleared`.

---

## 7. Visibility score rework

### Critique of the current card

`Search access 100% · AI access 88% · Error rate 15%` fails the 3-second test
three different ways:

1. **Percentages hide the units.** 88% of _what_? (Answer: 8 of 9 bots across
   two categories — knowledge the user can't reconstruct.) With n ≈ 10, a
   percentage is false precision for "one bot is blocked"; and the _name_ of
   that bot is the entire story.
2. **"Error rate" is mislabeled math** (`100 − health`) — see P-3. Any rework
   that keeps this label is a failure.
3. **No verdict, no names, no action.** "High Visibility" + a gauge is a grade,
   not an answer to "who can see my site?"

### Options considered

| Option                                                                                                                                                                                   | 3-second readability | Density              | Verdict                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | -------------------- | ----------------------------------------------------------------------------------------- |
| **A. Category segment bars + named exceptions** — per category, a green/red split bar with `9/10 allowed`, and chips naming only the _blocked_ bots (the exceptions are the information) | Excellent            | Compact (6 rows max) | **Recommended**                                                                           |
| B. Full access matrix (every bot × allowed/blocked grid)                                                                                                                                 | Good, but 21 rows    | Heavy above the fold | Becomes option A's expanded state (already built as `CrawlerBreakdown` — reuse, restyled) |
| C. Sentence summary only ("All search engines allowed · 3 AI bots blocked: GPTBot, ClaudeBot, CCBot")                                                                                    | Excellent            | One line             | Adopted _in addition_ — this is the verdict band's headline                               |
| D. Keep gauge, fix labels (counts not %, drop "Error rate")                                                                                                                              | Mediocre             | Same as today        | Rejected as the primary, but the fixes apply regardless                                   |

### Recommended composition (A + C)

The verdict band carries the sentence (option C) and the headline number. The
access matrix (position 2) renders option A:

```
WHO CAN SEE REDDIT.COM
Search engines   ██████████  10/10 allowed
AI training      █░░░░░░░░░   1/6 allowed   ✗ GPTBot ✗ ClaudeBot ✗ CCBot ✗ Google-Extended ✗ Meta…
AI search        ██░░░░░░░░   1/3 allowed   ✗ PerplexityBot ✗ …
SEO tools        ██████░░░░   4/6 allowed   ✗ AhrefsBot ✗ SemrushBot
…                                            [Show all 21 crawlers ▾]
```

Blocked-bot chips are clickable → filters the Action Queue / opens the AI
Manager deep-link for that bot. "Show all" expands to the existing per-crawler
list. The three old metrics map to: Search/AI access → the bars (counts, not
%); Error rate → deleted; File health → contributing metric in the verdict
band. `searchEngineAccess`/`aiCrawlerAccess` percentages remain in the domain
model (the score formula needs them) — they just stop being UI copy.

---

## 8. Desktop wireframes (1440)

### 8.1 Analyzer — report state

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Robots.txt Studio / Analyze                                                  │
│ ┌──────────────────────────────────────────────┐ ┌─────────────────────────┐ │
│ │ 🌐 reddit.com                                │ │  ⟳ Re-analyze           │ │
│ └──────────────────────────────────────────────┘ └─────────────────────────┘ │
│ recent: stripe.com 84 · mysite.io 91 · vercel.com 88                         │
├══════════ VERDICT BAND (sticky) ═════════════════════════════════════════════┤
│  67 NOW → 81 POTENTIAL   [Needs attention]                                   │
│  Search engines see everything · 9 of 11 AI bots blocked · 3 fixable         │
│  issues cost 14 pts.                                                         │
│  Search 10/10 · AI 2/11 · File health 85→96        [Fix 3 safe issues +9 pts]│
│  200 OK · text/plain · 2.1 KB · 14:02 UTC          [Undo] [Download ⬇]      │
├──────────────────────────────────────────────────────────────────────────────┤
│  WHO CAN SEE REDDIT.COM                                                      │
│  Search engines  ██████████ 10/10                                            │
│  AI training     █░░░░░░░░░  1/6   ✗GPTBot ✗ClaudeBot ✗CCBot ✗Google-Ext …   │
│  AI search       ██░░░░░░░░  1/3   ✗PerplexityBot ✗YouBot                    │
│  SEO tools       ██████▒░░░  4/6   ✗AhrefsBot ✗SemrushBot                    │
│                                            [Show all 21 crawlers ▾]          │
├──────────────────────────────────────────────────────────────────────────────┤
│  WHAT TO DO (ranked by payoff)                          Sort: Impact ▾       │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ ⚠ Crawl-delay of 0 has no effect        +6 pts   [Fix this]            │ │
│  │   ▸ why this matters · preview diff                                     │ │
│  │ ⚠ Sitemap uses HTTP                     +5 pts   [Fix this]            │ │
│  │ ⓘ 4 AI bots follow the catch-all        +3 pts   [Open AI Manager ↗]   │ │
│  │ ⓘ No comment header                     manual   [show line]            │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│  Syntax 100 ✓ · SEO 89 +11 · AI 40 +35 · Maint. 93 +7 · Security 100 ✓       │
├──────────────────────────────────────────────────────────────────────────────┤
│  ▸ THE FILE (robots.txt as served — 48 lines, 2 flagged)        [expand]     │
│    (expanded: read-only RobotsEditor w/ severity gutter; after any fix:      │
│     "Your changes vs. live on reddit.com" cumulative DiffView)               │
├──────────────────────────────────────────────────────────────────────────────┤
│  (only when queue is empty → Next steps)   ▸ More tools & related guides     │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Homepage — returning user

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                      Who Can See Your Website?                               │
│        ┌──────────────────────────────┐ ┌──────────────────┐                 │
│        │ 🌐 Enter your domain…        │ │ Analyze My Site  │                 │
│        └──────────────────────────────┘ └──────────────────┘                 │
├──────────────────────────────────────────────────────────────────────────────┤
│  CONTINUE WORKING                                  Clear history · local-only│
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ Ⓜ mysite.io      91 ● ▲ +6    0 fixes left      2h ago    [Re-analyze] │ │
│  │ Ⓢ stripe.com     84 ●  —      2 fixes available  1d ago    [Re-analyze] │ │
│  │ Ⓡ reddit.com     67 ● ▼ −2    3 fixes available  3d ago    [Re-analyze] │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│  (stranger state: this slot renders the existing LockedReport teaser)        │
├──────────────────────────────────────────────────────────────────────────────┤
│  Everything you need to manage crawler access   [6 tool cards — unchanged]   │
│  AI visibility banner — unchanged                                            │
│  Learn robots.txt — unchanged                                                │
│  (bottom "Recent activity" empty-state: DELETED)                             │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Mobile wireframes (390)

### 9.1 Analyzer report

```
┌─────────────────────────────┐
│ 🌐 reddit.com      [⟳]      │
├═ VERDICT (sticky) ══════════┤
│ 67 NOW → 81 POTENTIAL       │
│ [Needs attention]           │
│ Search 10/10 · AI 2/11      │
│ [Fix 3 safe issues +9 pts]  │
│ [Undo] [⬇]                  │
├─────────────────────────────┤
│ WHO CAN SEE REDDIT.COM      │
│ Search    ████████ 10/10    │
│ AI train  █░░░░░░░  1/6     │
│  ✗GPTBot ✗ClaudeBot ✗CCBot  │
│ AI search ██░░░░░░  1/3     │
│  ✗PerplexityBot             │
│ [Show all 21 ▾]             │
├─────────────────────────────┤
│ WHAT TO DO                  │
│ ⚠ Crawl-delay 0   +6        │
│   [Fix this]                │
│ ⚠ HTTP sitemap    +5        │
│   [Fix this]                │
│ ⓘ 4 AI bots undecided +3    │
│   [AI Manager ↗]            │
│ Syntax✓ SEO+11 AI+35 → (scroll)
├─────────────────────────────┤
│ ▸ The file (48 lines)       │
│ ▸ More tools & guides       │
└─────────────────────────────┘
```

The verdict band collapses to two rows when scrolled (score pair + primary
button), mirroring the Validator's mobile command bar. The matrix's blocked-bot
chips wrap to one line each with horizontal scroll, never truncating names.

### 9.2 Homepage returning / first-time

```
returning:                      first-time:
┌─────────────────────────┐     ┌─────────────────────────┐
│ Who Can See Your        │     │ Who Can See Your        │
│ Website?                │     │ Website?                │
│ [🌐 domain… ]           │     │ [🌐 domain… ]           │
│ [Analyze My Site]       │     │ [Analyze My Site]       │
├─────────────────────────┤     ├─────────────────────────┤
│ CONTINUE WORKING        │     │ ┌─────────────────────┐ │
│ ┌─────────────────────┐ │     │ │ 🔒 Unlock your full │ │
│ │Ⓜ mysite.io  91 ▲+6 │ │     │ │ crawler report      │ │
│ │ 2h ago  [Re-analyze]│ │     │ │ [Run free analysis] │ │
│ │Ⓢ stripe.com 84  —  │ │     │ └─────────────────────┘ │
│ │ 1d ago  [Re-analyze]│ │     ├─────────────────────────┤
│ └─────────────────────┘ │     │ [tool cards…]           │
│ [tool cards…]           │     └─────────────────────────┘
└─────────────────────────┘
```

---

## 10. Impact × Effort prioritization

Effort: S < 0.5 day · M ≈ 1–2 days · L ≈ 3–5 days (matching Phase 16 actuals).

| #   | Item                                                                                                                  | User value                                                | Business value                                           | Complexity                                          | Priority |
| --- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------- | -------- |
| 1   | Delete Strengths/Weaknesses; retire `AuditDashboard` summary block                                                    | Removes the #1 skim-past section; less scroll             | Perceived quality jump for free                          | **S** — Analyzer is the last consumer               | **P0**   |
| 2   | Kill/relabel "Error rate" (→ "File health 85/100"); access metrics as counts not %                                    | Stops an actively misleading number                       | Trust with technical users (our amplifiers)              | **S**                                               | **P0**   |
| 3   | Verdict band: merge Visibility+Health, NOW→POTENTIAL, primary Fix CTA, fetch metadata line; success-callout folded in | Verdict + action in viewport 1                            | The screenshot-able artifact; conversion to fix-flow     | **M** — Phase 16 command-bar variant                | **P0**   |
| 4   | Action Queue: merge Priorities+Issues+Recommendations, impact-ranked, inline fix/deep-link, why+diff expansion        | Answers "what do I do next" in one list                   | Fix-applied rate (the activation metric)                 | **M** — issue-panel patterns exist                  | **P0**   |
| 5   | Access matrix with named blocked bots (option A+C), `CrawlerBreakdown` as its expansion                               | 3-second "who's in/out"; serves the competitive-intel job | The shareable/viral surface; differentiator made visible | **M**                                               | **P1**   |
| 6   | Homepage "Continue working" (localStorage), recent chips on `/analyze`, delete dead "Recent activity"                 | Visit-2 starts in one click                               | Retention with zero backend; removes a broken promise    | **M** — one client island + storage util            | **P1**   |
| 7   | File view: read-only `RobotsEditor` + annotations + cumulative diff                                                   | See what you're fixing/downloading                        | Trust ("no black boxes"), parity with Validator polish   | **S/M** — component exists                          | **P1**   |
| 8   | Dimension chips on Analyzer (lift Phase 16 component to shared)                                                       | Score math on demand, not as a card wall                  | One design system across tools                           | **S** after #3/#4                                   | **P1**   |
| 9   | Workspace convergence: Analyzer fix-mode = split editor+queue (Phase 16 layout), line-linked                          | Same muscle memory both tools; line-level navigation      | Halves long-term UI maintenance                          | **L**                                               | **P2**   |
| 10  | Re-analysis deltas everywhere (dashboard ▲/▼, verdict "since last check")                                             | Progress feedback loop                                    | Habit formation                                          | **S** once #6 ships                                 | **P2**   |
| 11  | Blocked-bot chip → AI Manager deep-link with bot preselected                                                          | Decision in two clicks                                    | AI Manager activation (headline feature)                 | **M** — needs Manager to accept a `?crawler=` param | **P2**   |
| 12  | Share artifact (copy-link/social card of verdict+matrix)                                                              | Bragging/shaming rights                                   | Top-of-funnel                                            | **L** + OG infra                                    | **P3**   |
| 13  | Scheduled re-checks / change alerts                                                                                   | Monitoring                                                | Retention/monetization seed                              | needs backend                                       | **P3**   |

Explicitly **not** proposed: animations, celebrations, keyboard shortcuts,
command palette — same discipline as Phase 16; reassess after P0/P1 ship.

---

## 11. Recommended implementation phases

**Phase 17A — Verdict & Queue (P0; items 1–4).** One PR-sized arc, mirrors
Phase 16 Phase-1: delete summary filler, build `verdict-band.tsx` +
`action-queue.tsx`, retire the Analyzer's `ScoreCard`/`AuditDashboard`/
`RecommendationCard` usage. e2e contract care: `analyzer.spec`-equivalents that
reference "Crawler Visibility Score", IssueCard buttons, or the Fix toolbar will
need the same testid-based updates the Validator specs got (`score-current`,
`issue-list` already exist as conventions to copy). Exit criteria: verdict +
primary CTA visible without scrolling at 1440×900 _and_ 390×844; zero facts
rendered twice; all gates green.

**Phase 17B — Access matrix + file view (P1; items 5, 7, 8).** The identity
phase: named-bot matrix at position 2, read-only `RobotsEditor` with
annotations, dimension chips lifted to `src/components/`. Exit criteria: the
reddit.com test — blocked AI bots named within the first two screen-heights;
the served file viewable pre-fix.

**Phase 17C — Continue working (P1; item 6).** Independent of 17A/B, can ship
in parallel: `src/lib/recent-analyses.ts` (versioned schema, try/catch on
storage), homepage client island replacing the `LockedReport` slot for
returners, chips on `/analyze`, delete the dead section, analytics events.
Exit criteria: analyze → return home → resume in one click; stranger view
pixel-identical to today minus the dead section.

**Phase 17D — Convergence & deltas (P2; items 9–11).** Only after 17A–C are
validated by usage: split-pane fix mode on the Analyzer reusing the Phase 16
workspace wholesale, re-analysis deltas, AI-Manager preselection deep-links.
Stop-and-reassess gate before any of it, per the standing polish policy.

Every phase is presentation-layer only — `live-checker` domain code needs zero
changes except (optionally) exporting a tiny `formatAccessSummary` helper for
the verdict sentence; the percentages stay in the model for the score formula.
