# Analytics & Observability — Phase 13B

> The instrumentation design: how events, funnels, and providers fit together to
> answer product, SEO, and business questions — not just count clicks. Companion:
> [`METRICS.md`](./METRICS.md) (the metrics these events feed),
> [`PRODUCTION_READINESS.md`](./PRODUCTION_READINESS.md) (CSP + deploy).

## Principles

1. **No vendor lock-in.** Call sites import typed `track*` helpers from
   `@/lib/analytics` and never a vendor SDK. A provider is one adapter implementing
   `AnalyticsProvider` (`init`/`capture`/`pageview`). Swapping PostHog or Clarity, or
   adding Plausible/Segment, touches one file.
2. **Opt-in by configuration.** Providers load only when their `NEXT_PUBLIC_*` key is
   set. No keys → nothing loads, nothing is sent, no vendor origin is added to the CSP.
   Local dev and the default deploy are zero-tracking.
3. **No unnecessary dependencies.** Vendors load via their official snippets expressed
   as real (CSP-safe, non-`eval`) code — **no npm packages added**.
4. **Privacy-conscious.** PostHog runs with autocapture off, session recording off,
   manual pageviews, `localStorage` persistence (no server-set cookies), and DNT
   honored. Clarity masks text by default. We capture explicit, typed events only.
5. **Designed around questions.** Every event/property exists to answer a specific
   product, SEO, or business question (see the mapping below).

## Architecture

```
 call sites (components / screens)
   ToolCTA · CopyButton · AnalyzerScreen · ValidatorScreen · RobotsSourceField
        │  import typed helpers only
        ▼
 @/lib/analytics  (public API)
   events.ts   → trackPageview / trackCtaClicked / trackToolClicked /
                 trackFetchRobots / trackAnalyzeCompleted /
                 trackValidationCompleted / trackCodeCopied
   classify.ts → classifyPath(pathname) → page_type
   funnels.ts  → FUNNELS (taxonomy-as-code)
        │
        ▼
 client.ts  (dispatcher)
   • server → no-op   • pre-init → buffer → flush   • one provider throws → others unaffected
        │  fan-out
        ├───────────────► providers/posthog.ts ──► PostHog snippet (us.i.posthog.com)
        └───────────────► providers/clarity.ts ──► Clarity snippet (clarity.ms)
        ▲
        │ registerProviders + init (once) + pageview on route change
 components/analytics-provider.tsx  ("use client", mounted in app/layout.tsx)
        ▲
        │ buildProviders() reads env keys
 lib/env.ts  (analyticsConfig)         next.config.ts (CSP adds vendor origins iff keys set)
```

## Providers & configuration

| Provider          | Purpose                                     | Env var                                                  | Default                         |
| ----------------- | ------------------------------------------- | -------------------------------------------------------- | ------------------------------- |
| PostHog           | Product analytics, events, funnels, metrics | `NEXT_PUBLIC_POSTHOG_KEY` (+ `NEXT_PUBLIC_POSTHOG_HOST`) | host `https://us.i.posthog.com` |
| Microsoft Clarity | Heatmaps + session replay (qualitative)     | `NEXT_PUBLIC_CLARITY_ID`                                 | —                               |

Set keys only in the production/preview environment. The CSP in `next.config.ts`
automatically allows each vendor's origins **only when its key is present**; with no
keys the policy stays `script-src 'self' 'unsafe-inline'` / `connect-src 'self'`.

## Event inventory

All events auto-carry PostHog's `$current_url` (so any event is segmentable by page).

| Event                  | Fires when                                                   | Key properties                                                                                                              | Answers                                                                                                                  |
| ---------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `$pageview`            | Every client navigation                                      | `page_type` (home/tool/crawler/ai-hub/glossary/template/tool-landing/comparison/cms/guide/trust), `$current_url`            | Top landing/crawler/glossary/template/guide pages; organic paths; tool visits                                            |
| `tool_clicked`         | A tool is opened from an entry surface                       | `tool`, `source_path`, `source_type`                                                                                        | Per-tool entry breakdown (analyze/generate/validate/tester/explain/ai_manager) — available in the API for entry surfaces |
| `cta_clicked`          | A tool CTA is clicked (`ToolCTA`)                            | `tool`, `source_path`, `source_type`, `location`                                                                            | Page→tool, crawler→tool, template→generator, guide→tool conversion                                                       |
| `fetch_robots`         | A live robots.txt fetch starts (Analyzer / fetch-from-URL)   | `source`                                                                                                                    | Fetch usage; funnel entry; abandonment vs completion                                                                     |
| `analyze_completed`    | An analysis renders a report                                 | `fetch_status`, `policy_status` (verified/absent/unverified), `visibility_score/band` (search visibility; omitted when unverified), `health_score`, `error_count`, `warning_count`, `finding_count`, `finding_codes[]` | Completed analyses; **most common analyzer findings**; analyzer completion rate                                          |
| `validation_completed` | A validation settles (debounced 1.5 s)                       | `health_score/band`, `error_count`, `warning_count`, `info_count`, `issue_codes[]`                                          | Completed validations; **most common validation errors**                                                                 |
| `code_copied`          | A code/template snippet is copied                            | `context` (panel title), `path`                                                                                             | Template copies; which snippets convert                                                                                  |
| `issue_selected`       | A Validator issue is selected (Phase 2A)                     | `code`, `via` (`list` \| `editor`)                                                                                          | Which rules users engage with; whether the issue↔line linking (gutter/heatmap) is used                                   |
| `fix_applied`          | A fix is applied to the working file (Phase 2A)              | `mode` (`single` \| `all-safe`), `code`, `safe`, `count`, `score_delta`, `surface` (`validator` \| `analyzer`, Phase 17A)   | Fix adoption per rule; batch vs single; real score recovery delivered; which workspace drives fixes                      |
| `fix_undone`           | The last applied fix is undone (Phase 2A)                    | `surface` (Phase 17A)                                                                                                       | Fix trust/regret rate (undo ÷ applies)                                                                                   |
| `action_queue_clicked` | An Analyzer Action Queue row's action is clicked (Phase 17A) | `code`, `kind` (`fix` \| `deep-link`)                                                                                       | Whether the queue drives in-app remediation, navigation into Control tools, or both                                      |

**Taxonomy note (one event + property, not many names).** The brief lists
`analyze_clicked`, `generate_clicked`, … and `crawler_page_visit`, `guide_page_visit`.
We model these as **property breakdowns** rather than separate event names:
`tool_clicked` / `cta_clicked` broken down by `tool` yield the per-tool events, and
`$pageview` broken down by `page_type` yields `crawler_page_visit` (`page_type=crawler`)
and `guide_page_visit` (`page_type=guide`). Fewer event names = stable dashboards and
no taxonomy drift.

## Instrumentation map (where each event lives)

| Surface                                     | File                                                   | Emits                                                                                       |
| ------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Route changes                               | `components/analytics-provider.tsx`                    | `$pageview` + `page_type`                                                                   |
| Tool CTA cards (all content pages)          | `components/content/tool-cta.tsx`                      | `cta_clicked`                                                                               |
| Copy buttons (snippets/templates)           | `components/copy-button.tsx` (via `code-panel.tsx`)    | `code_copied`                                                                               |
| Analyzer                                    | `app/analyze/analyzer-screen.tsx`                      | `fetch_robots`, `analyze_completed`                                                         |
| Validator                                   | `app/validate/validator-screen.tsx`                    | `validation_completed` (debounced), `issue_selected`, `fix_applied`, `fix_undone`           |
| Analyzer queue                              | `app/analyze/analyzer-screen.tsx` + `action-queue.tsx` | `action_queue_clicked`, `fix_applied` / `fix_undone` with `surface: "analyzer"` (Phase 17A) |
| Fetch-from-URL (Validator/Tester/Explainer) | `components/robots-source-field.tsx`                   | `fetch_robots`                                                                              |

## Funnel inventory

Defined as code in `src/lib/analytics/funnels.ts` (single source for docs + future
dashboards). All five funnels from the brief:

| Funnel                   | Steps                                                                                                      | Primary question                             |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| **Guide → Tool**         | `$pageview{guide}` → `cta_clicked{source_type=guide}` → `$pageview{tool}`                                  | Do guides convert readers into tool users?   |
| **Crawler Page → Tool**  | `$pageview{crawler}` → `cta_clicked{source_type=crawler}` → `$pageview{tool}`                              | Do crawler pages convert into the tools?     |
| **Template → Generator** | `$pageview{template}` → `code_copied` (on templates) → `cta_clicked{tool=generator, source_type=template}` | Do templates drive Generator usage?          |
| **Analyzer → Validator** | `analyze_completed` → `$pageview{tool}` → `validation_completed`                                           | After auditing, do users validate/fix?       |
| **Analyzer → Explainer** | `analyze_completed` → `$pageview{tool}`                                                                    | After auditing, do users open the Explainer? |

The tool→tool funnels (Analyzer→Validator/Explainer) resolve from sequential pageviews,
so they work even though the analyzer's in-result links aren't individually tagged.

## How instrumentation answers each question

| Question                                          | Source                                                           |
| ------------------------------------------------- | ---------------------------------------------------------------- |
| Top landing / crawler / glossary / template pages | `$pageview` grouped by `page_type` + `$current_url`              |
| Organic conversion paths                          | `$pageview` path sequences + `cta_clicked`                       |
| Most used tools                                   | `$pageview{page_type=tool}` + `cta_clicked{tool}`                |
| Completion rates                                  | `fetch_robots`→`analyze_completed`; edits→`validation_completed` |
| Abandonment points                                | funnel drop-off (started events without the completion event)    |
| Most common analyzer findings                     | `analyze_completed.finding_codes[]`                              |
| Most common validation errors                     | `validation_completed.issue_codes[]`                             |
| Page/crawler/template → tool conversion           | the funnels above (`cta_clicked.source_type`)                    |

## Replacing or adding a provider

1. Add `src/lib/analytics/providers/<vendor>.ts` exporting
   `create<Vendor>Provider(...): AnalyticsProvider`.
2. Register it in `providers/index.ts` behind its env key.
3. If it loads an external script, add its origins to `analyticsHosts()` in
   `next.config.ts`.

No call site changes — that's the point of the abstraction.

## Performance & infrastructure providers (Vercel)

Two Vercel providers sit **deliberately outside** the vendor-neutral event layer above:
**Vercel Web Analytics** and **Vercel Speed Insights**. They are wired in
`components/vercel-insights.tsx` (rendered once in `app/layout.tsx`) and gated by
`vercelInsights` in `@/lib/env`.

### Why they are not in `@/lib/analytics`

The `AnalyticsProvider` contract is an **event** abstraction (`init` / `capture(event,
props)` / `pageview`); call sites emit typed `track*` events that fan out to PostHog /
Clarity. The Vercel components emit **none** of those events — they auto-collect data
from browser Performance APIs and beacon it to Vercel's first-party `/_vercel/*`
endpoints. There is no `capture()` for them to implement, so modeling them as
`AnalyticsProvider`s would be a category error. They are a separate
**infrastructure/RUM** concern, kept as a thin gated component instead.

### What each collects, and how it differs

| Provider                  | Layer                         | Collects                                                                   | Differs from PostHog/Clarity                                                                           |
| ------------------------- | ----------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **PostHog**               | event (`@/lib/analytics`)     | Typed product events, funnels, pageviews                                   | Product behaviour & conversion (what users _do_)                                                       |
| **Clarity**               | event (`@/lib/analytics`)     | Heatmaps, session replay                                                   | Qualitative UX (how users _interact_)                                                                  |
| **Vercel Web Analytics**  | infra (`vercel-insights.tsx`) | Aggregate page views, visitors, referrers, country/device                  | Privacy-friendly _traffic_ counts, no events/funnels                                                   |
| **Vercel Speed Insights** | infra (`vercel-insights.tsx`) | Real-user **Core Web Vitals** (LCP, INP, CLS, FCP, TTFB) per route, scored | _Performance_ (RUM), not behaviour — answers "are real users' pages fast?" which none of the others do |

### Configuration & gating

| Env var                             | Default | Effect                                         |
| ----------------------------------- | ------- | ---------------------------------------------- |
| `NEXT_PUBLIC_VERCEL_ANALYTICS`      | on      | `0`/`false`/`off`/`no` disables Web Analytics  |
| `NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS` | on      | `0`/`false`/`off`/`no` disables Speed Insights |

These are **keyless** and default **on** (opt-out) — unlike the keyed PostHog/Clarity
providers, which are opt-in to guarantee zero tracking everywhere. The justification:
both Vercel components are **inert by construction** off Vercel — the `/_vercel/*`
endpoints exist only on a production Vercel deployment, and each respects the
project's dashboard "Enable" toggle. So "default on + explicit opt-out" still yields
zero data locally / in previews, while keeping the dashboard as the real control. Set
a flag to `0` only to remove the component (and its harmless local `/_vercel/*` 404)
entirely.

### When to enable

Enable Speed Insights for launch and keep it on — Core Web Vitals are an SEO ranking
signal and the only RUM performance signal we collect. Enable in the Vercel dashboard
(Project → Speed Insights → Enable); the code is already in place.

### Privacy

Both are cookieless and collect no PII — Web Analytics records aggregate, anonymized
traffic; Speed Insights records anonymous timing metrics keyed by route. No CSP change
is needed (first-party `/_vercel/*`, covered by `script-src 'self'` / `connect-src
'self'` from Phase 13A). They do not feed the PostHog event stream or the funnels above.
