# Validator UX Redesign — "From Report to Workspace"

> **Status: UX Phase 1 SHIPPED.** The workspace is live: sticky command bar
> (`app/validate/command-bar.tsx`), dimension chips as filters
> (`app/validate/dimension-chips.tsx`), impact-ordered linked issue panel
> (`app/validate/issue-panel.tsx`), and the `RobotsEditor` abstraction
> (`components/robots-editor.tsx`, overlay implementation) wired together in
> `app/validate/validator-screen.tsx`. Strengths/Weaknesses, the Priorities
> list, and the Score Breakdown section are removed from the Validator (the
> Analyzer still renders `AuditDashboard` unchanged).
>
> **Phase 2A SHIPPED:** preview-before-apply (expanded issue rows render the
> exact before/after diff; "review" fixes always preview first and require an
> explicit Apply), ghost diffs in the editor (`RobotsEditor.pendingEdits` —
> removed lines strike through, replacements render `old → new` in place),
> per-rule "Why this matters" explanations (`validator/domain/why.ts`, one entry
> per `ValidationCode`, compile-time complete), and workspace analytics
> (`issue_selected` / `fix_applied` / `fix_undone` — see ANALYTICS.md).
> Large-file hardening: the editor scrolls internally (gutter and code share ONE
> scroll container so they cannot desync; the heatmap stays pinned as a
> whole-file overview); verified at 153 lines / 24 findings with pixel-exact
> overlay alignment. Remaining Phase 2 items (keyboard nav, fix animations,
> dismiss, batch preview) and Phase 3 are still proposals.

> Design proposal. Redesigns the Validator screen
> (`src/app/validate/validator-screen.tsx`) from a stacked audit report into a
> split-pane remediation workspace. The domain layer
> (`src/features/validator/domain/`) is **not** touched — it already produces
> everything this design needs. Companion: [`VALIDATOR.md`](./VALIDATOR.md),
> [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md),
> [`PHASE_15_ANALYZER_ROADMAP.md`](./PHASE_15_ANALYZER_ROADMAP.md).

---

## 1. UX critique of the current Validator

### The one-sentence diagnosis

The engine computes a connected graph — *issue → line → fix → exact score
recovery* — and the UI renders it as four disconnected islands stacked
vertically, so the user must do the joining in their head while scrolling.

### What already exists and is genuinely excellent (do not touch)

| Asset | Why it matters |
| --- | --- |
| Deduction scoring (`audit.ts`) | Every lost point traceable to a rule. Most competitors show a number with no "why". |
| `fixImpact()` | Exact per-dimension + overall recovery for a single fix. This is the currency of the whole redesign. |
| `safe` vs `review` fix semantics | The trust model GitHub/Snyk use ("auto-mergeable" vs "needs review"). Already correct. |
| Line-based `TextEdit`s + 1-based line numbers on issues | Everything needed for editor anchoring already exists in the data. |
| Undo stack, session trend, before/after diff | The review-workflow primitives are built — they're just placed wrong. |
| Live re-validation on every edit | The feedback loop is already real-time. |
| Design system discipline (80/15/5) | The premium feel is achievable without new visual language. |

### What is broken (in priority order)

1. **The file and the issues never see each other.** Issues say `Line 4` as
   dead text. The textarea has no line numbers, no gutter, no highlights. The
   user manually counts lines in a `<textarea>`. This single gap produces most
   of the "report, not workflow" feeling.
2. **The payoff is off-screen at the moment of action.** When the user clicks
   "Fix this" in the issues section, the score ring — the thing that moves — is
   1–2 viewports above. The product's best moment (score ticks up) is invisible.
3. **Four surfaces restate the same facts.** A `crawl-delay-zero` issue appears
   as: a Weaknesses bullet, a Score-breakdown deduction row, a
   Highest-priority-fixes row, and an IssueCard. Same fact, four widgets, zero
   added information per repetition.
4. **Strengths/Weaknesses is filler.** "✓ Syntax is solid" duplicates the
   `Syntax 100 — Excellent` card sitting 100px below it. It consumes a full
   card-width band to say nothing actionable.
5. **The diff is transient and orphaned.** It renders between the toolbar and
   the issue list, detached from both the file (where the change happened) and
   the issue (which caused it), and vanishes on the next edit.
6. **The issue list has no ranking by value.** Sorted by severity-then-line;
   but the user's real question is "what's worth fixing first?" — which the
   engine already answers (`summary.priorities`) in a separate, read-only list.
7. **Below-the-fold cross-sell outweighs the workflow.** Next Steps + More
   Tools + Related Guides is ~40% of the page height — at the cost of making
   the core surface feel like a content page, not a tool.

### Disposition of every current surface

| Surface | Verdict | Rationale |
| --- | --- | --- |
| Domain engine (rules, audit, fixes, diff lib) | **Preserve** | World-class; the redesign is a presentation change. |
| `RobotsSourceField` paste/fetch tabs | **Preserve** | Entry UX is fine; it feeds the new editor. |
| Undo / Fix-all-safe / Download actions | **Preserve** | Relocate to a sticky command bar. |
| Session trend (78 → 84 → 91) | **Improve** | Becomes the live score ticker + end-of-session recap. |
| Overall score ring | **Improve** | Shrink to ~48px, move into the sticky bar; it must be visible *while fixing*. |
| Issue cards | **Replace** | Become selectable rows in a Problems panel with line excerpt, expandable detail, fix preview. |
| `DiffView` | **Improve** | Reused as *preview-before-apply* inside the selected issue, and as ghost lines in the editor — no longer a floating block. |
| Plain `<textarea>` | **Replace** | Annotated editor: line numbers, gutter severity markers, issue-line highlight. |
| Severity filter (Segmented) | **Replace** | Merged with dimension chips into one filter row (severity + dimension). |
| Score breakdown (5 expandable cards) | **Replace** | Five compact chips (`SEO 88`, `AI 80 −20`) that act as filters on the issue list. Deduction detail moves into each issue row (it's per-issue data anyway). |
| Strengths / Weaknesses | **Remove** | Fully redundant with banded dimension chips. |
| Highest-priority fixes list | **Remove** | Becomes the default sort ("By impact") of the single issue list. |
| Executive headline sentence | **Preserve** (condensed) | One line under the command bar; it's the only prose worth keeping above the workspace. |
| Next Steps / More Tools / Related Guides | **Improve** | Collapse into one contextual "What's next" block that appears *on success* (0 issues or post-fix), not permanently. Guides move below a divider, visually demoted. |

---

## 2. Recommended redesign: the Remediation Workspace

### Concept

One screen, three persistent regions, modeled on the VS Code Problems panel +
GitHub PR review:

1. **Command bar (sticky):** live score, recoverable points, global actions.
2. **Workspace (the page):** annotated file editor (left) ↔ issue panel
   (right), bidirectionally linked. Both independently scrollable; both always
   visible at 1440px.
3. **Contextual footer:** success/next-step content, shown when earned.

The product question it answers at every moment: **"what do I fix next, where
is it, and what do I get for it?"** — file, selected issue, and fix impact are
simultaneously visible at all times (the explicit design requirement).

### The core loop (target: < 5 seconds per fix)

```
issue row click → line highlights in editor (auto-scroll)
              → row expands: why · impact (+points) · inline diff preview
apply → editor line animates (red strike → green settle, ~400ms)
      → score in command bar ticks up (count-up already exists)
      → issue row collapses out; next issue auto-selects
      → Undo available in command bar (and `u`)
```

Fix-all-safe runs the same loop as one batch: one diff preview listing all N
edits, one confirm, one undo entry.

### Information architecture

```
/validate
├── Command bar (sticky, 56px)
│     score ring (48px) · headline band chip · "+N pts recoverable"
│     [✦ Fix N safe] [Undo] [Download] [⋯ Copy/Reset/Share]
├── Source row (collapses to a strip after first validation)
│     Paste | Fetch from URL          (RobotsSourceField, unchanged)
├── Workspace (split 55/45, min-height 70vh)
│   ├── Editor pane
│   │     line numbers · gutter severity dots · issue-line tint
│   │     selected-issue line: brand-tinted + left border
│   │     ghost diff preview (when an issue with a fix is selected)
│   └── Issue panel
│         filter row: [All 8] [● 0] [▲ 2] [ℹ 6]  ·  dimension chips
│         sort: By impact ▾ | By line | By severity
│         issue rows (selectable, keyboard navigable)
│           └── expanded: message · why-it-matters · "Recovers SEO +10 ·
│               Overall +3" · diff preview · [Apply fix] [Dismiss] [Learn more]
└── Contextual footer
      success: celebration card + recap + Compare/Tester/AI-Manager handoffs
      always (demoted): related guides, one row
```

**Dimension chips replace the Score Breakdown section.** Each chip shows
`label · value · band color · (−lost)`. Clicking a chip filters the issue list
to issues that deduct from that dimension. The score system is now literally
the navigation — "why did I lose points?" is answered by clicking the score.

---

## 3. Desktop wireframe (1440px)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ ◉ 71/100  Needs Attention   +23 pts recoverable      [✦ Fix 4 safe] [↩] [⬇] [⋯]│  ← sticky
├────────────────────────────────────────────────────────────────────────────────┤
│ “Technically valid, but AI crawler coverage is the biggest gap.”               │
│ [Syntax 100 ✓] [SEO 88 −12] [AI 80 −20] [Maint. 84 −16] [Security 88 −12]      │  ← chips = filters
├───────────────────────────────────────┬────────────────────────────────────────┤
│ robots.txt            Paste|Fetch ⌄   │ ISSUES (8)   All|Err|Warn|Info  Impact▾│
│ ┌───┬───────────────────────────────┐ │ ┌────────────────────────────────────┐ │
│ │ 1 │ User-agent: *                 │ │ │ ▲ Crawl-delay of 0          L4 +4 │ │
│ │ 2 │ Allow: /                      │ │ ├────────────────────────────────────┤ │
│ │ 3 │ Disallow: /admin/            ●│ │ │ ▲ Sitemap uses HTTP  ◀ selected    │ │
│ │ 4 │ Crawl-delay: 0               ▲│ │ │   Line 9 · SEO −4                  │ │
│ │ 5 │                               │ │ │   Sitemaps should be served over   │ │
│ │ 6 │ User-agent: GPTBot            │ │ │   https — crawlers may distrust…   │ │
│ │ 7 │ Disallow: /                   │ │ │   ┌──────────────────────────────┐ │ │
│ │ 8 │                               │ │ │   │ − Sitemap: http://e.com/s.xml│ │ │
│ │▌9 │ Sitemap: http://e.com/s.… ▲  │←┼─┼───│ + Sitemap: https://e.com/s.x…│ │ │
│ │   │ └ ghost: https://e.com/s.xml │ │ │   └──────────────────────────────┘ │ │
│ │   │                               │ │ │   Recovers SEO +4 · Overall +1     │ │
│ │   │   (editable; click a gutter   │ │ │   [Apply fix]  [Dismiss]  Learn ↗  │ │
│ │   │    marker to select issue)    │ │ ├────────────────────────────────────┤ │
│ │   │                               │ │ │ ℹ ClaudeBot inherits default   +5 │ │
│ └───┴───────────────────────────────┘ │ │ ℹ GPTBot policy is explicit ✓ …   │ │
│   sticky within pane, scrolls         │ └────────────────────────────────────┘ │
│   independently                       │   panel scrolls independently          │
├───────────────────────────────────────┴────────────────────────────────────────┤
│ (success state only) 🎉 96/100 — recap · [Compare before/after] [Test a URL]   │
└────────────────────────────────────────────────────────────────────────────────┘
```

Interaction rules:

- **Bidirectional linking.** Click an issue → editor scrolls + highlights the
  line. Click a gutter marker → issue panel scrolls + selects the issue. Lines
  with multiple issues cycle on repeated clicks.
- **Ghost preview.** While an issue with a deterministic fix is selected, the
  editor shows the would-be change inline (struck-through old / tinted new), so
  the diff lives *in the file*, not in a separate block. The right-panel mini
  diff remains for `review` fixes (explicit confirm).
- **Sticky math.** The command bar score and "+N recoverable" update on every
  edit/fix — the user never loses sight of progress (problem #2 solved
  structurally, not with animation alone).
- **Keyboard:** `j/k` next/prev issue · `Enter` expand · `f` apply fix ·
  `u` undo · `1–5` dimension filter · `Esc` clear. Mirrors GitHub/Linear; cheap
  to add; signals "premium developer tool" louder than any visual polish.
- **File-only issues** (no line: `missing-sitemap`, AI policy advice) pin to a
  "File-level" group at the top of the issue panel and highlight nothing —
  never fake a line number.

### Editor implementation note (constraint, not design)

No CodeMirror. robots.txt files are tiny (already capped at 512 KiB on fetch,
typically < 100 lines), so the classic overlay technique is sufficient: a
`<textarea>` with transparent text precisely stacked over a `<pre>` that
renders line numbers, tints, and markers; scroll positions synced. Degrades to
the plain textarea if JS measurement fails. Zero dependencies, consistent with
the project's no-new-runtime-deps principle.

---

## 4. Mobile wireframe (390px)

Split panes don't fit; the model becomes **one file, one drawer, one bar**:

```
┌──────────────────────────────┐
│ ◉ 71  Needs Attention  +23 ▸ │  ← sticky score strip (tap ▸ = dimension chips)
├──────────────────────────────┤
│ [ File ]  [ Issues (8) ]     │  ← segmented, sticky
├──────────────────────────────┤
│  1  User-agent: *            │
│  2  Allow: /                 │
│  3  Disallow: /admin/      ● │   FILE TAB: annotated, editable;
│  4  Crawl-delay: 0         ▲ │   tap a marker → bottom sheet for
│ ▌9  Sitemap: http://…      ▲ │   that issue (excerpt · why ·
│                              │   impact · [Apply fix])
├──────────────────────────────┤
│ [✦ Fix 4 safe]  [↩]  [⬇]     │  ← sticky bottom action bar
└──────────────────────────────┘

ISSUES TAB: the same issue rows, full-width.
  "Show in file ↗" on each row → switches to File tab,
  scrolls to + flashes the line.
Apply fix (either surface) → toast: "Fixed · SEO +4 · score 71→75 [Undo]"
```

- The **bottom sheet** is the mobile equivalent of the expanded issue row:
  half-height, swipe to dismiss, `Apply fix` as the primary button. The file
  stays visible behind it (context requirement holds on mobile too).
- The score strip ticking up + toast with undo keeps the payoff visible
  without the desktop's persistent split.
- Diff preview inside the sheet uses the existing stacked `DiffView` (already
  mobile-tested in 15A).

---

## 5. User journeys

**J1 — "Is my file OK?" (paste → triage → fix → ship), the core journey.**
Paste/fetch → score appears in the command bar, issues populate sorted by
impact → user taps the top issue → line highlights, sees why + "+10" → Apply →
score ticks 71→81 → repeats or hits Fix-all-safe → success footer appears →
Download. Target time-to-first-fix: **< 10 seconds from paste.**

**J2 — Arrived from Analyzer handoff.** File preloads (existing `takeHandoff`),
workspace opens with the issue panel already populated — no empty state, no
re-paste. Post-fix, "Compare against your live file" hands both versions to
`/compare` (closing the loop the Analyzer opened).

**J3 — Clean file.** 0 issues → no hollow dashboard: a single success card
("100/100 — this file follows every best practice we check"), Download/Copy,
plus the *only* persistent upsell that earns its place: "AI crawlers: 3 of 5
have explicit policies — review in AI Manager" when the AI dimension is the
lowest non-perfect one.

**J4 — Mobile quick check.** Fetch own domain → score strip → Issues tab →
Fix-all-safe from bottom bar → toast → Download. Two thumbs, under a minute.

---

## 6. Conversion, retention, differentiation

**Wow moments (in priority order):**
1. Score ticking up live in a sticky bar as fixes land (already half-built:
   `useCountUp`, trend state).
2. The ghost diff inside the file — no other robots.txt tool shows a fix *in
   situ* before applying it.
3. Session recap on success: "You fixed 6 issues and raised your score
   71 → 96" with the trend sparkline — screenshot-able by design.

**Cross-tool funnels (contextual, not a permanent card wall):**
- After any fix session → **Compare** seeded with session before/after (the
  before text is already in the undo stack — zero new state).
- Issue selected on a `Disallow` line → inline "Test a URL against this rule"
  → **Tester** with the file handed off.
- AI dimension is the weakest → **AI Manager** chip CTA on the AI filter chip.
- These replace the always-on Next Steps wall; instrument each as
  `cta_clicked{source_type=validator-context}`.

**New analytics events** (extends `ANALYTICS.md` inventory):
`issue_selected {code, via: list|gutter}`, `fix_applied {code, safe, points}`,
`fix_all_applied {count, points}`, `fix_undone`, `session_recap_shown
{from_score, to_score, fixes}`. Answers: which rules drive engagement, whether
preview-before-apply increases apply rate, where the loop is abandoned.

**Competitive position.** technicalseo.com and the generic validators are
*read-only verdict tools* (paste → list of problems → goodbye); their
credibility lever is parser fidelity, not workflow. Nobody on the market
offers: line-anchored findings, one-click in-situ remediation, measurable
score recovery per fix, or an AI-crawler policy dimension. The ownable
positioning: **"the only robots.txt tool that fixes your file, not just
grades it"** — a PR-review experience for a file format every site has and no
tool treats seriously. (Counter their credibility lever separately: a one-line
"How we parse" link to `/methodology` near the editor.)

---

## 7. Prioritization

**Must have (the redesign is meaningless without these):**
- Split-pane workspace, sticky command bar with live score + actions
- Annotated editor: line numbers, gutter markers, issue-line highlight
- Bidirectional issue↔line linking
- Issue rows: excerpt, expandable why/impact, apply/preview
- Default sort by impact; severity + dimension filters merged
- Deletions: Strengths/Weaknesses, Priorities list, Score-breakdown section
- Mobile File/Issues tabs + score strip + bottom action bar + sheet

**Should have:**
- Ghost diff preview in the editor; preview-before-apply for `review` fixes
- Animated fix transitions (line settle, row collapse, score tick)
- Success state + session recap + contextual Compare/Tester/AI-Manager CTAs
- Keyboard navigation; new analytics events
- Dismiss/ignore an issue for the session

**Nice to have:**
- Shareable score card image (OG-image pipeline already exists)
- localStorage session persistence ("resume where you left off")
- Multi-issue gutter cycling; minimap-style issue density strip
- Command palette (cut first if scope presses)

---

## 8. Rollout plan

**UX Phase 1 — The Workspace (structural, ~no new domain code).**
Split layout, sticky command bar, annotated editor (overlay technique),
issue↔line linking, merged filters/sort, the deletions, mobile tabs + bottom
bar. *Exit criterion: a user fixes 3 issues without ever scrolling to find
anything.*

**UX Phase 2 — The Review Loop.**
Expanded issue detail with diff preview-before-apply, ghost preview in editor,
fix/undo animations + score tick, keyboard nav, dismiss, batch-preview for
Fix-all-safe, new analytics events. *Exit criterion: median time from issue
selection to applied fix < 5s; `fix_applied` rate measurably above today's.*

**UX Phase 3 — Delight & Growth.**
Success/celebration state, session recap + Compare handoff (before/after),
contextual tool CTAs, shareable score card, persistence. *Exit criterion:
Validator→Compare and Validator→AI-Manager funnels visible in PostHog.*

Each phase ships independently; Phase 1 alone resolves critique items 1, 2, 3,
4, 6, 7.

---

## 9. Founder review

- **Biggest UX mistake today:** computing `line` on every issue and rendering
  it as dead text. The single highest-value join in the product — finding ↔
  file — exists in the data model and not in the UI.
- **Biggest missed opportunity:** `fixImpact()` is a gamification engine being
  used as a caption. "Click here, number goes up" is the most reliable
  engagement loop in software, and it's currently split across two screens.
- **Highest-ROI improvement:** the split workspace + line anchoring. Pure
  presentation work over existing data; transforms the product category from
  "report" to "tool".
- **One thing users will love:** the score ticking upward in a bar that never
  leaves the screen while their file visibly heals line by line.
- **One thing users will hate:** a janky custom editor. The overlay technique
  must be flawless (IME, paste, scroll sync, zoom) or it reads as broken and
  burns trust worse than the plain textarea ever did. Build it behind a
  fallback; keep the textarea path one prop away.
- **One thing competitors do better:** technicalseo.com borrows authority from
  Google's open-source parser lineage. We have a `/methodology` page —
  surface that credibility *inside* the tool, not three clicks away.
- **One thing Robots.txt Studio can uniquely own:** measurable remediation.
  No one else can say "we found it, showed you the exact line, fixed it in one
  click, and proved the score recovery" — the full loop, with an AI-crawler
  policy dimension nobody else even scores.

## 10. All recommendations ranked by Impact × Effort

| # | Recommendation | Impact | Effort | Order rationale |
| --- | --- | --- | --- | --- |
| 1 | Delete Strengths/Weaknesses + Priorities; sort issues by impact | High | Trivial | Pure deletion + reorder of existing data. Ship first. |
| 2 | Sticky command bar with live score + Fix-all/Undo/Download | High | Low | Relocation of existing widgets; fixes "payoff off-screen". |
| 3 | Dimension chips as filters (replace Score Breakdown) | High | Low | Makes the score actionable; data already in `AuditReport`. |
| 4 | Split-pane desktop workspace | High | Medium | Layout restructure; prerequisite for 5. |
| 5 | Annotated editor + issue↔line linking | **Highest** | Medium-High | The category-changing feature; the only real build risk (overlay editor). |
| 6 | Issue rows with excerpt + expandable detail + apply | High | Medium | Replaces IssueCard; pairs with 5. |
| 7 | Mobile tabs + score strip + bottom bar + issue sheet | High | Medium | 390px parity for the core loop. |
| 8 | Preview-before-apply (panel diff + editor ghost) | Medium-High | Medium | Trust for `review` fixes; reuses `DiffView`. |
| 9 | Fix animations + score tick + line glow | Medium | Low | Cheap delight on top of `useCountUp`. |
| 10 | Success state + session recap + Compare handoff | Medium | Low | Retention + cross-tool funnel; before-text already in undo stack. |
| 11 | Keyboard navigation | Medium | Low | Premium-tool signal; trivial after 6. |
| 12 | New analytics events | Medium | Low | Required to prove the redesign worked. |
| 13 | Contextual tool CTAs (replace Next Steps wall) | Medium | Low | Better conversion with less pixels. |
| 14 | Shareable score card | Medium | Medium | Growth bet; OG pipeline exists. |
| 15 | Session persistence | Low-Medium | Low | Quality-of-life. |
| 16 | Command palette | Low | Medium | Cut unless everything above ships. |
