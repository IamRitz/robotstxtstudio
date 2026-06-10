# Metrics — Phase 13B

> The metrics the product is steered by, and exactly which signal produces each one.
> Event/funnel definitions live in [`ANALYTICS.md`](./ANALYTICS.md). Sources are
> **PostHog** (behavioral events) and **Google Search Console / GSC** (SEO), which
> measure different things and are not interchangeable.

## North Star metrics

The few numbers that say whether the product delivers value.

| Metric | Definition | Source | Notes |
| --- | --- | --- | --- |
| **Tool activations** | Distinct users who meaningfully use a tool (a completion or a deliberate action), not just a pageview | PostHog: `analyze_completed`, `validation_completed`, `fetch_robots`, `code_copied` (unique users) | "Activation" = value delivered, stricter than a visit |
| **Completed analyses** | Count of finished audits that rendered a report | PostHog: `analyze_completed` | Segment by `visibility_band`, `fetch_status` |
| **Completed validations** | Count of settled validations | PostHog: `validation_completed` | Debounced, so ~one per editing session, not per keystroke |

## SEO metrics

Acquisition + reach. **Source: Google Search Console** (PostHog cannot measure
impressions/indexing). Pageview data complements GSC for on-site behavior.

| Metric | Definition | Source |
| --- | --- | --- |
| **Indexed pages** | Pages Google has indexed (target ≈ the 76 in the sitemap) | GSC → Pages report |
| **Impressions** | Times a page appeared in search results | GSC → Performance |
| **Clicks** | Search clicks to the site | GSC → Performance |
| **CTR** | Clicks ÷ impressions, per page/query | GSC → Performance |

Cross-reference: GSC tells you which pages earn impressions/clicks; PostHog
`$pageview{page_type}` tells you what those landed users then do (and which convert).

## Product metrics

Depth and stickiness of usage.

| Metric | Definition | Source |
| --- | --- | --- |
| **Engagement depth** | Events per session / pages per session | PostHog (session-aggregated events + `$pageview`) |
| **Multi-tool sessions** | Sessions touching ≥2 distinct tools | PostHog: distinct `page_type=tool` URLs (or `cta_clicked.tool`) per session |
| **Repeat sessions** | Users with >1 session over a window | PostHog (session count per distinct user; `localStorage` persistence) |

## Business metrics

Conversion and retention.

| Metric | Definition | Source |
| --- | --- | --- |
| **Conversion paths** | The five funnels' conversion rates (guide/crawler/template → tool; analyzer → validator/explainer) | PostHog funnels (`FUNNELS` in `funnels.ts`) |
| **Returning users** | Share of users who come back across sessions | PostHog (returning vs new, per distinct user) |

## Metric → source-event matrix

| Metric group | Primary events |
| --- | --- |
| North Star | `analyze_completed`, `validation_completed`, `fetch_robots`, `code_copied` |
| SEO | GSC (impressions/clicks/CTR/indexing) + `$pageview` |
| Product | `$pageview`, `cta_clicked`, `fetch_robots` |
| Business | `cta_clicked`, `analyze_completed`, `validation_completed`, `$pageview` (funnels) |

## Suggested launch targets (initial, to revisit post-deploy)

These are starting baselines to calibrate against real traffic, not commitments.

| Metric | Initial target |
| --- | --- |
| Analyzer completion rate (`analyze_completed` ÷ `fetch_robots` from analyzer) | ≥ 70% |
| Guide → Tool conversion | ≥ 5% of guide sessions |
| Crawler Page → Tool conversion | ≥ 8% of crawler-page sessions |
| Template → Generator conversion | ≥ 10% of template sessions |
| Multi-tool sessions | ≥ 15% of tool sessions |
| Indexed pages (8 weeks post-launch) | ≥ 90% of sitemap (≈ 68 / 76) |

## Privacy & integrity

- Metrics are derived from explicit, typed events — no autocapture, no session
  recording (PostHog), text masked (Clarity). See [`ANALYTICS.md`](./ANALYTICS.md).
- Returning-user / repeat-session metrics rely on `localStorage` persistence (no
  server-set cookies). A consent mechanism may be required depending on jurisdiction;
  flagged as a deploy decision in [`PRODUCTION_READINESS.md`](./PRODUCTION_READINESS.md).
- All metrics degrade gracefully to zero when analytics is unconfigured (the default).
