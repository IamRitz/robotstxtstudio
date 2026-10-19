# Robots.txt Studio

A modern all-in-one robots.txt toolkit — generate, validate, test, explain, and manage AI crawler permissions, plus fetch and analyze live robots.txt files.

**Live:** [robotstxtstudio.com](https://robotstxtstudio.com) · Deployed on Vercel (DNS via Cloudflare).

## Status

Production. Feature-complete across all tools, the SEO content clusters, trust/EEAT
pages, production hardening (security headers + CSP, error boundaries, env validation),
and vendor-neutral analytics. See [`docs/SPRINTS.md`](./docs/SPRINTS.md) for the phase log.

## Stack

Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui · Zod · Vitest · Playwright · Vercel.

## Getting started

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Run the dev server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint (Next + feature-boundary rules) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest unit/component tests |
| `pnpm test:coverage` | Unit tests with 80% coverage gate on core logic |
| `pnpm test:e2e` | Playwright end-to-end tests |
| `pnpm format` | Prettier write |
| `pnpm seo:audit [base]` | Post-build SEO smoke audit of every sitemap URL (default `http://localhost:3000`; read-only against production) |
| `pnpm seo:dates` | List pages whose source changed after their recorded lastmod (`src/config/page-dates.ts`) |
| `pnpm gsc:compare a.csv b.csv` | Compare two manual Search Console CSV exports (pages/queries, or `--urls` for indexing lists) |

## Environment

All optional and public; the app runs with none set.

| Variable | Purpose | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for canonicals/sitemap/OG/JSON-LD. Invalid value fails the production build. | `https://robotstxtstudio.com` |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | Enable PostHog analytics (opt-in) | host `https://us.i.posthog.com` |
| `NEXT_PUBLIC_CLARITY_ID` | Enable Microsoft Clarity | — |

With no analytics keys, no vendor scripts load and the CSP stays tight. See
[`docs/ANALYTICS.md`](./docs/ANALYTICS.md) and [`docs/PRODUCTION_READINESS.md`](./docs/PRODUCTION_READINESS.md).

## Architecture

Feature-based vertical slices with a strict, one-directional dependency rule:

```
ui (React) → feature lib → domain (pure logic) → types/config
```

```
src/
  app/                 # Next.js routes (tools, SEO clusters, trust pages)
  parser/              # shared robots.txt parser (one source of truth)
  features/
    generator/         # each: domain/ lib/ ui/ index.ts
    validator/
    tester/
    explainer/
    crawler-manager/
    live-checker/
  config/              # crawler DB, content registries, presets (data)
  types/               # cross-cutting domain models (pure TS, no zod)
  schemas/             # Zod boundary schemas (the only zod importer)
  lib/                 # utilities, SEO/JSON-LD, env, analytics
  components/          # shared UI + content/trust layouts + ui/ primitives
tests-e2e/             # Playwright specs
```

**Rules**
- Domain logic is pure: no React, no `next/*` imports.
- `src/types` is dependency-free; all `zod` validation lives in `src/schemas`.
- Import features only via their barrel (`@/features/<name>`), enforced by ESLint.
- The parser is shared, not owned by a feature (four consumers).

## Surface

- **Tools:** `/analyze` · `/generate` · `/validate` · `/url-tester` · `/ai-crawlers` · `/explain`
- **Reference & growth:** `/crawlers` (+ `/crawlers/[id]`) · `/ai-crawlers-directory` · `/robots-txt-templates` · `/robots-txt-glossary`
- **SEO clusters:** educational + transactional/programmatic keyword pages
- **Trust/EEAT:** `/about` · `/methodology` · `/contact` · `/privacy` · `/terms`
- 48 canonical URLs in the sitemap. Nine duplicate-intent URLs (e.g. `/robots-txt-validator`,
  `/robots-txt-format`) 308 to their canonical page — see `src/config/redirects.ts` and
  [`docs/SEO_RECOVERY_2026-10.md`](./docs/SEO_RECOVERY_2026-10.md).

## How the tools read AI crawler policy

robots.txt is an instruction to compliant crawlers — not access control, and not evidence
that a crawler visited, indexed, cited, or ranked anything. Within that limit, the tools
separate three kinds of AI agent, following each operator's documentation:

| Kind | Examples | Blocking it means |
| --- | --- | --- |
| AI search | OAI-SearchBot, Claude-SearchBot, PerplexityBot | Those assistants stop surfacing and linking your pages |
| AI training | GPTBot, ClaudeBot, CCBot | You ask those operators not to collect content for training |
| AI usage control | Google-Extended, Applebot-Extended | No crawler is blocked; you opt out of AI use of already-crawled content. Search is unaffected |

The Analyzer's **search visibility** score is 70% search-engine access + 30% file health.
AI access is shown beside it as policy, never scored, so a deliberate training opt-out
doesn't lower the number. A fetch that times out or returns 429/5xx is reported as
**policy unknown** (no score) rather than as allow-all; a 4xx means "no robots.txt", which
RFC 9309 and Google treat as allow-all.

**Catching a policy regression:** paste the old and new files into `/compare`. A staging
`Disallow: /` shipped under `User-agent: *` shows up as Googlebot/Bingbot newly blocked and a
search-visibility drop; a training block edited to also list `OAI-SearchBot` shows up as an
AI search crawler newly blocked (both cases are covered by `compare.test.ts`). Then confirm
specific URLs in `/url-tester` before deploying.

## Documentation

Product & engineering detail lives in [`docs/`](./docs): `SEO_RECOVERY_2026-10.md` (current
SEO state, URL decisions, and the GSC observation plan), `PRD.md`, `SPRINTS.md`,
`SEO_AUDIT.md`, `LAUNCH_CHECKLIST.md`, `PRODUCTION_READINESS.md`, `ANALYTICS.md`,
`METRICS.md`, `DESIGN_SYSTEM.md`, plus per-module specs (`PARSER.md`, `VALIDATOR.md`, …).

## Roadmap

All phases delivered: architecture · domain models · parser · generator · validator ·
tester · explainer · AI crawler manager · live checker · UI integration · testing ·
SEO pages & growth assets · trust/EEAT · production hardening · analytics · **deployment (live).**
