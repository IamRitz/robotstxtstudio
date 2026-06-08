# Robots.txt Studio

A modern all-in-one robots.txt toolkit — generate, validate, test, explain, and manage AI crawler permissions, plus fetch and analyze live robots.txt files.

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

## Architecture

Feature-based vertical slices with a strict, one-directional dependency rule:

```
ui (React) → feature lib → domain (pure logic) → types/config
```

```
src/
  app/                 # Next.js routes (thin)
  parser/              # shared robots.txt parser (one source of truth)
  features/
    generator/         # each: domain/ lib/ ui/ index.ts
    validator/
    tester/
    explainer/
    crawler-manager/
    live-checker/
  config/              # crawler DB, module registry, presets (data)
  types/               # cross-cutting domain models (pure TS, no zod)
  schemas/             # Zod boundary schemas (the only zod importer)
  lib/                 # generic utilities (cn, fetch helpers)
  components/ui/        # shadcn primitives
tests-e2e/             # Playwright specs
```

**Rules**
- Domain logic is pure: no React, no `next/*` imports.
- `src/types` is dependency-free; all `zod` validation lives in `src/schemas`.
- Import features only via their barrel (`@/features/<name>`), enforced by ESLint.
- The parser is shared, not owned by a feature (four consumers).

## Roadmap (phased)

1. ✅ Architecture & setup
2. Core domain models
3. robots.txt parser
4. Generator
5. Validator
6. Tester
7. Explainer
8. AI crawler manager
9. Live checker
10. UI integration
11. Testing
12. SEO pages
13. Deployment
