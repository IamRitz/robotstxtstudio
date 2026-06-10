# Phase 15 — Analyzer Improvement Roadmap (Design Proposal)

> **Status: DESIGN ONLY. Do not build yet.** This document proposes the architecture
> and UX for the next generation of the Analyzer. It is the deliverable for Phase
> 14G and the input to a future Phase 15 build sprint. Estimates and sequencing are
> indicative.

## 1. Goal

Today the Analyzer (and Validator) are **diagnostic**: they tell the user what's
wrong. Phase 15 makes them **prescriptive and actionable**: every finding carries a
severity, an explanation of why it matters, and — where safe — a one-click fix that
rewrites the file in place, with a before/after diff. The Analyzer also gains
**comparison** (two files, or two domains) and a deeper **detection** layer.

This builds directly on existing domain modules and introduces no new runtime
dependencies:

- `src/parser/` — tokenizer + parser → `RobotsFile` AST (already line-aware).
- `src/features/validator/domain/rules/` — `syntax.ts`, `best-practices.ts`, `ai.ts`
  produce `Issue`s. This is where new detectors live.
- `src/features/generator/domain/` — `build.ts` / `serialize.ts` already turn a
  structured config into text. This is the natural home for fix application.
- `src/features/live-checker/` — fetch + analyze + report assembly.
- `src/types/` — `analysis.ts`, `validation.ts`, `compare.ts` (already stubbed).

---

## 2. Core architecture change: the `Fix` model

Every detector today returns an `Issue` (code, severity, message, line). Phase 15
extends issues with an **optional, declarative `Fix`** — a pure description of an AST
edit, never raw string surgery. Fixes are computed against the parsed model and
re-serialized, so the output is always well-formed.

```ts
// src/types/fix.ts (proposed)
export type FixOp =
  | { kind: "remove-line"; line: number }
  | { kind: "replace-directive"; line: number; field: string; value: string }
  | { kind: "remove-directive"; line: number }
  | { kind: "add-directive"; afterLine: number; field: string; value: string }
  | { kind: "merge-groups"; userAgents: string[] }      // de-dupe duplicate groups
  | { kind: "add-group"; userAgent: string; rules: Rule[] };

export interface Fix {
  readonly id: string;
  readonly label: string;          // "Remove Crawl-delay: 0"
  readonly rationale: string;      // why it matters (see §6/#10)
  readonly safety: "safe" | "review"; // safe = auto-appliable; review = needs confirm
  readonly ops: readonly FixOp[];
}

export interface Issue {
  // …existing fields…
  readonly fix?: Fix;
}
```

A single pure reducer applies fixes:

```ts
// src/features/generator/domain/apply-fix.ts (proposed)
export function applyFixes(file: RobotsFile, fixes: Fix[]): RobotsFile;
export function serialize(file: RobotsFile): string; // reuse existing serializer
```

Because everything routes through parse → edit AST → serialize, the diff is just
`serialize(before)` vs `serialize(applyFixes(before, fixes))`.

---

## 3. Feature designs (the 19 requested items)

### One-click Fix (1) & Inline Fix Application (2)

- Each `IssueCard` with a `fix` renders a **"Fix this"** button (already in the design
  system inventory — `IssueCard` lists `Fix This` / `Learn More`).
- Clicking applies the fix to an in-memory working copy of the file and re-renders the
  report against the new text. The fetched original is preserved so the user can
  reset.
- A **"Fix all safe issues"** action in the audit summary applies every
  `safety: "safe"` fix at once; `review` fixes stay manual.
- State: introduce a `workingSource` alongside the fetched `report.file.source`. The
  Analyzer screen becomes lightly stateful (a reducer) instead of a pure render of one
  report.

### Before/After Diff View (3)

- New `src/components/diff-view.tsx`: line-aligned two-column (desktop) / stacked
  (mobile) diff. Added lines tint `status-allowed-bg`, removed lines
  `status-blocked-bg`, mono font, line numbers — consistent with the Validator's
  line-highlighting pattern (DESIGN_SYSTEM §7).
- Diff algorithm: a small LCS line-diff (~60 LOC, no dependency). Inputs are short
  (robots.txt files are tiny), so cost is irrelevant.
- Surfaced in a panel after any fix is applied, and as the body of the comparison
  features (#9/#10).

### Fix Suggestions (4) & Fix Severity Levels (5)

- Detectors already classify severity (`error` / `warning` / `info`). Phase 15 maps
  severity → fix affordance: `error` fixes are surfaced first and eligible for "Fix
  all"; `info` suggestions are opt-in "Consider…" cards (the existing
  `RecommendationCard`).
- A `safety` flag (§2) gates auto-apply: e.g. removing `Crawl-delay: 0` is `safe`;
  re-scoping an over-broad `Disallow: /` is `review` because intent is ambiguous.

### Explain Why Fix Matters (6)

- Every `Fix.rationale` is a one-sentence, plain-English consequence ("`Crawl-delay`
  is ignored by Google and Bing — keeping it at 0 just adds noise"). Reuse the
  Explainer's `humanize.ts` vocabulary so tone is consistent across tools.
- The IssueCard expands to show rationale + the exact diff the fix would produce
  before the user commits (preview-before-apply, matching the AI Manager's "impact
  preview" pattern).

### Analyzer → Generator integration (7)

- A **"Open in Generator"** action converts the (optionally fixed) `RobotsFile` into a
  `GeneratorConfig` via a new `fileToConfig(file): GeneratorConfig` inverse of the
  existing `to-config.ts`. This is the one handoff Phase 14E could not do (the
  Generator builds from config, not text); Phase 15 closes that gap.
- Carries through the Phase 14E `lib/handoff.ts` channel, extended to also stash a
  structured config when available.

### Analyzer → Validator integration (8)

- Already shipped in Phase 14E (the analyzer "Validate this robots.txt" next-step
  hands the fetched file to the Validator). Phase 15 upgrades it to carry the
  **working copy** (post-fix) rather than only the original.

### Compare Two robots.txt Files (9) & Compare Against Another Domain (10)

- New route `/compare` (and an entry from the Analyzer). Two source panels (paste/paste
  or fetch/fetch). `src/types/compare.ts` is already stubbed for this.
- Output: the diff view (#3) plus a **semantic** comparison — not just textual:
  per-crawler access delta ("GPTBot: allowed → blocked"), health-score delta, and
  added/removed groups. Reuse `live-checker` breakdown + `validator` scoring on each
  side and diff the structured results.
- "Compare against another domain" is the same screen seeded with two fetches
  (`/api/fetch-robots` already exists and is reused).

### Detection layer (11–19)

All new detectors are pure functions added under
`src/features/validator/domain/rules/` with table-driven test fixtures (the existing
rules already follow this pattern; see `validate.test.ts`). Each emits an `Issue` and,
where deterministic, a `Fix`.

| # | Detector | Module | Severity | Auto-fix? |
|---|----------|--------|----------|-----------|
| 11 | **Malformed directives** (missing colon, bad value, stray tokens) | `syntax.ts` | error | safe (drop/repair) |
| 12 | **Quoted directives** (`Disallow: "/admin"`) | `syntax.ts` | error | safe (strip quotes) |
| 13 | **Unknown directives** (typos like `Disalow`, unsupported fields) | `syntax.ts` | warning | review (suggest nearest known field via edit-distance) |
| 14 | **Duplicate groups** (same user-agent declared twice) | `best-practices.ts` | warning | safe (`merge-groups`) |
| 15 | **Conflicting rules** (`Allow` + `Disallow` on identical path in one group) | `best-practices.ts` | warning | review |
| 16 | **Crawl-budget issues** (huge disallow lists, `Disallow:` of JS/CSS that block rendering, no `Sitemap`) | new `crawl-budget.ts` | info/warning | mixed |
| 17 | **Common CMS mistakes** (WordPress blocking `/wp-content/uploads`, blocking `/wp-admin/admin-ajax.php`) | new `cms.ts` | warning | review |
| 18 | **Ecommerce-specific problems** (Shopify/Magento: blocking faceted-search params badly, exposing `/checkout`) | new `ecommerce.ts` | warning | review |
| 19 | **AI crawler configuration gaps** (no policy for major AI bots, partial coverage, `Google-Extended` not addressed) | extend `ai.ts` | info | safe (`add-group` from AI-manager presets) |

CMS/ecommerce detectors (#17/#18) need a platform hint. Derive it heuristically
(comment markers, sitemap URL shape, characteristic paths) and let the user override
with a platform selector — never hard-fail on a wrong guess.

---

## 4. UX surface changes

- **Audit summary** gains a sticky action bar (DESIGN_SYSTEM §8): "Fix all safe
  issues · Download · Open in Generator · Compare".
- **IssueCard**: add `Fix this` (when `fix` present), expandable rationale + inline
  diff preview.
- **New components**: `diff-view.tsx`, `fix-button.tsx`, comparison screen, platform
  selector.
- **Reset/undo**: applying fixes is reversible (keep original; fixes are an ordered
  list that can be popped). No destructive state.

---

## 5. Sequencing (proposed)

1. **15A — Fix model foundation**: `types/fix.ts`, `apply-fix.ts`, diff algorithm +
   `diff-view.tsx`. Wire "Fix this" for the existing syntax errors only. (Highest
   value, lowest risk — proves the loop end to end.)
2. **15B — Detection expansion**: detectors #11–#16 with fixtures.
3. **15C — Platform-aware detection**: #17/#18 + platform selector; extend #19.
4. **15D — Comparison**: `/compare` route, semantic + textual diff (#9/#10).
5. **15E — Generator round-trip**: `fileToConfig` + "Open in Generator" (#7), upgrade
   handoffs (#8).

---

## 6. Risks & principles

- **Never edit text directly.** All fixes go through parse → AST edit → serialize, so
  output is always valid and idempotent.
- **Safe vs review.** Auto-apply only deterministic, intent-preserving fixes. Anything
  touching access scope is `review` and requires explicit confirmation with a diff.
- **No black boxes.** Every fix shows what it changes and why before applying — the
  same explainability commitment as the Tester's rule trace.
- **Pure & tested.** Detectors and the fix reducer are pure; each ships with table
  fixtures. No new runtime dependencies.
- **Reversible.** The fetched original is always preserved; fixes can be undone.
