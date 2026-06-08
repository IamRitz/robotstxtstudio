# Robots.txt Studio — Design System

> Extracted from the approved design handoff in `Screens/design_spec.png` and the
> coded reference in `Screens/design_spec_vite/Screen 8/` (tokens in `src/index.css`,
> component patterns in `src/App.tsx`). This is the implementation reference for
> Phase 10 (UI integration). The product-level summary lives in
> [`PRD.md` §13–14](./PRD.md).

> **Brand note:** the design files use the working name **"RobotsKit."** The
> canonical product name is **Robots.txt Studio** (see [PRD §1](./PRD.md)). Treat
> any "RobotsKit" string in mockups as a placeholder.

---

## 1. Design principles

The handoff states five principles, in priority order:

1. **Minimalist** — Remove visual noise. Every element must earn its place.
2. **Developer-First** — Monospace code, semantic labels, technical precision.
3. **Trustworthy** — Consistent, predictable, honest UI patterns.
4. **Hierarchy** — Strong typographic scale. Outside-in spacing.
5. **Purposeful Color** — **80% gray, 15% blue accent, 5% semantic status only.**

The 80/15/5 color rule is the single most important constraint: the UI is
overwhelmingly neutral; blue means "interactive/brand"; green/red/amber mean
"status" and nothing else. Never decorate with semantic colors.

---

## 2. Color tokens

### Neutral scale (the 80%)

| Token | Usage |
| --- | --- |
| `neutral-950` | Headings, primary text, **dark surfaces** (top nav, code panels) |
| `neutral-700` | Body text, labels |
| `neutral-500` | Secondary / muted text |
| `neutral-400` | Section labels, captions, placeholder icons |
| `neutral-200` | Borders, dividers |
| `neutral-100` | Subtle surfaces, chips, category-card headers |
| `neutral-50`  | Inset panels, table header rows, hover rows |
| `white`       | Card backgrounds, page background |

### Brand accent (the 15%)

| Token | Usage |
| --- | --- |
| `blue-600` | Primary CTA, active nav/tab, toggles (on), links, focus |
| `blue-50` / `blue-700` | Info panels, info badges |

### Semantic status (the 5%)

| State | Surface / Text / Dot |
| --- | --- |
| Allowed / Success | `green-50` / `green-700` / `green-500` |
| Blocked / Error | `red-50` / `red-700` / `red-500` (filled error badge: `red-600` on white) |
| Warning | `amber-50` / `amber-700` / `amber-500` |
| Info | `blue-50` / `blue-700` / `blue-500` |

### Health/visibility gauge thresholds

`80–100` → `green-500` · `60–79` → `amber-500` · `0–59` → `red-500`.

### Token reconciliation (important for implementation)

The coded reference's `@theme` block follows the **shadcn default**, where
`--primary` is `neutral-950` (near-black) — used for dark bars and code panels.
But the component inventory's **Primary CTA is `blue-600`**. To avoid confusion,
Phase 10 will introduce explicit semantic tokens rather than overloading shadcn's
`--primary`:

```
--brand        → blue-600   (CTAs, active states, links)
--surface-dark → neutral-950 (nav bar, code panels)
--status-{allowed|blocked|warning|info}
```

> The Phase 1 `src/app/globals.css` currently sets `--primary` to a blue and uses
> HSL. Phase 10 must migrate it to the OKLCH neutral base above and add the
> `--brand`/status tokens. This is a known, tracked deviation — see
> [PRD §13](./PRD.md).

---

## 3. Typography

Font families:

- **Sans (UI):** Inter → `ui-sans-serif, system-ui, sans-serif`
- **Mono (code/paths/directives):** Geist Mono → `ui-monospace, SFMono-Regular, …`
- **Serif (optional editorial):** Source Serif 4

Scale:

| Role | Classes | Use |
| --- | --- | --- |
| Display | `text-4xl font-bold tracking-tight` | Page titles |
| Heading 1 | `text-2xl font-bold tracking-tight` | Section headers |
| Heading 2 | `text-lg font-semibold` | Card titles |
| Heading 3 | `text-sm font-semibold` (neutral-900) | Row labels, item names |
| Body | `text-sm` (neutral-700) | Descriptions, copy |
| Caption | `text-xs` (neutral-500) | Secondary info, hints |
| Section label | `text-xs font-semibold tracking-widest uppercase` (neutral-400) | Card/section eyebrows |
| Code | `font-mono text-sm` (neutral-700) | Directives, paths, user-agents |

**Rule:** every user-agent string, path, and directive renders in `font-mono`.

---

## 4. Spacing & radius

- **Base unit: 4px (0.25rem).** Steps used: `1` (4px), `2` (8px), `4` (16px),
  `6` (24px), `8` (32px), `12` (48px).
- **Outside-In principle:** outer containers use larger spacing, inner elements
  smaller. Never invert.
  - Page: `px-12 py-12`
  - Card: `p-6 gap-4`
  - CardHeader / CardContent: `p-0 gap-2`
  - Row items: `gap-2` or `gap-1`
- **Radius:** `--radius: 0.65rem`.
  - `rounded-sm` → badges, chips, tags, brand logo tiles
  - `rounded-lg` → buttons, inputs, small cards
  - `rounded-xl` → cards, panels, modals
  - `rounded-full` → pills, avatars, status dots

---

## 5. Surfaces / card styles

| Surface | Recipe |
| --- | --- |
| **Standard card** | `bg-white border-neutral-200 rounded-xl shadow-sm p-6 gap-4` |
| **Category card** | `rounded-xl` with `bg-neutral-100` header (dark icon + uppercase label) + `bg-white p-4` body |
| **Info / impact panel** | `bg-blue-50 border-l-4 border-blue-600 rounded-xl p-4` |
| **Dark code panel** | `bg-neutral-950 rounded-xl`, `font-mono text-neutral-300` |
| **Empty state** | `border-neutral-200 border-dashed rounded-xl p-6`, centered |

---

## 6. Component inventory (with recipes)

### Navigation
- **TopNav** — dark `bg-neutral-950` bar; logo left, nav items center, auth right.
  Active item: `bg-neutral-800 text-white rounded-md px-3 py-1.5`.
- **Breadcrumb** — `text-xs tracking-widest uppercase neutral-400`, `neutral-300` separator.
- **Tab Switcher (pill)** — track `bg-neutral-100 p-1`; active `bg-blue-600 text-white rounded-md`; inactive `text-neutral-600`.
- **Underline Tabs** — active `text-blue-600 border-b-2 border-blue-600`; inactive `text-neutral-500`.
- **Sticky Bottom Bar** — fixed action bar with stats left, actions right (desktop).

### Buttons
| Variant | Recipe |
| --- | --- |
| Primary CTA | `bg-blue-600 text-white rounded-lg px-4 py-2` |
| Secondary | `bg-white border-neutral-200 text-neutral-700` |
| Blue Outline | `border-blue-600 text-blue-600` |
| Destructive | `border-red-300 text-red-600` |
| Text Link | `text-blue-600 underline` |
| Muted Link | `text-neutral-500 underline` |

Buttons use a leading Lucide icon at `size-3`, `gap-1.5`, `text-xs font-medium`.

### Forms
- **Text / Search input** — `border-neutral-200 rounded-lg px-3 py-2 text-sm`, leading neutral-400 icon (`Globe`, `Search`).
- **Toggle** — On: `bg-blue-600` thumb-white (justify-end). Off: `bg-neutral-200` thumb-`neutral-400` (justify-start). `w-9 h-5` track, `w-4 h-4` thumb.

### Data display
- **Crawler Row** — brand logo tile (`w-6 h-6 rounded bg-neutral-100`, bold 1–3 char abbrev in neutral-700) + name + owner + mono user-agent + status badge + toggle.
- **Category Card** — neutral-100 header + body of rows.
- **Table** — header row `bg-neutral-50 border-b`, rows divided `border-neutral-100`, hover `bg-neutral-50`, optional alternating rows.
- **SVG Gauge** — circular score (visibility/health), colored by threshold.
- **Progress Bar / Mini Bar Chart** — per-category allowed/blocked.

### Feedback
- **Status Badge (pill)** — `rounded-full px-2.5 py-1 text-xs font-semibold` + `1.5×1.5` dot. (Allowed/Blocked/Warning/Info per §2.)
- **Severity Badge** — filled count badge: `2 Errors` (`bg-red-600 text-white`), `3 Warnings` (`bg-amber-50 text-amber-700 border-amber-200`), `2 Info` (`bg-neutral-100 text-neutral-500`).
- **Severity Icon** — `w-6 h-6 rounded-full` tinted bg + Lucide icon: `XCircle`/red, `AlertTriangle`/amber, `Info`/blue, `CheckCircle2`/green.
- **Issue Card** — severity icon + title + line ref + description + `Fix This` / `Learn More` links.
- **Info Banner / Impact Preview** — blue-50 panel describing the effect of a change.

### Full component list (from handoff)
Navigation: TopNav, Breadcrumb, Tab Switcher, Underline Tabs, Sticky Bottom Bar.
Data Display: Crawler Row, Category Card, SVG Gauge, Progress Bar, Mini Bar Chart.
Feedback: Status Badge, Severity Badge, Issue Card, Info Banner, Impact Preview.
Forms & Actions: Text Input, Search Input, Toggle Switch, Preset Button, Code Editor Panel.

---

## 7. Interaction patterns

- **Live updating** — Generator/Crawler Manager update the export preview instantly
  on every toggle (labelled "Auto-updating"). No "apply" step.
- **Impact preview** — toggling a crawler surfaces a blue info panel explaining the
  consequence before the user commits.
- **Rule trace** — the Tester shows a numbered, step-by-step evaluation
  (Fetch → Match User-Agent → Evaluate Path Rules → verdict) so the verdict is
  explainable, never a black box.
- **Severity filtering** — the Validator filters issues by All/Errors/Warnings/Info.
- **Copy / Download / Export** — every output surface offers copy + download.
- **Line highlighting** — the Validator highlights offending lines (red/amber) in
  the code editor, cross-linked to issue cards by line number.

---

## 8. Visual hierarchy

1. Page title (Display) + one-line subtitle in `neutral-500`.
2. Primary input/action zone (domain field + primary CTA) directly under the title.
3. Result surfaces in cards, scored summary first (gauge), then itemized detail.
4. Section labels (uppercase eyebrows) introduce each card.
5. A persistent action zone (sticky bottom bar on desktop) for the screen's
   primary outputs (Download / Export / Add to Generator).

---

## 9. Responsive behavior

| Breakpoint | Layout |
| --- | --- |
| **Desktop ≥ 1140px** (primary target) | `px-12 py-12`, `grid-cols-2/3`, sticky bottom action bar, horizontal top nav |
| **Laptop 900–1139px** | `px-8 py-8`, `grid-cols-2` max, nav may truncate, cards stack earlier |
| **Tablet 600–899px** | `px-6 py-6`, `grid-cols-1`, hamburger nav, full-width cards |
| **Mobile < 600px** | `px-4 py-4`, `grid-cols-1`, bottom tab bar, collapsed sections |

Design is **desktop-first** (the tools are professional/technical), degrading to a
single-column mobile layout with a bottom tab bar.

---

## 10. Accessibility commitments

- Status is never color-only: pair every status color with a dot + text label and
  an icon (the severity-icon pattern).
- Mono code blocks must remain selectable/copyable.
- Toggles, tabs, and the bottom bar must be keyboard-operable with visible focus
  (`ring` token, `blue-600`).
- Gauges expose their numeric score as text, not just arc color.
