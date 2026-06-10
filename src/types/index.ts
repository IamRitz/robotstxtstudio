/**
 * Cross-cutting domain models — the shared vocabulary for every feature.
 *
 * Pure data and pure helpers only: no React, no `next/*`, no `zod`. Boundary
 * validation (Zod) lives in `src/schemas` so this layer stays framework- and
 * dependency-independent (PRD §16, "Zod at boundaries only").
 *
 * Import via the barrel: `import { type RobotsFile, scoreBand } from "@/types"`.
 */

// Robots.txt AST — the single canonical representation.
export * from "./robots";

// Crawler catalog vocabulary.
export * from "./crawler";

// Scoring primitives (shared by Validator + Analyzer).
export * from "./score";

// Validation (issues + aggregate result).
export * from "./validation";

// Audit scoring (multi-dimensional health, Validator 2.0).
export * from "./audit";

// URL Tester.
export * from "./test";

// Explainer.
export * from "./explanation";

// Live Analyzer (audit) + fetch boundary.
export * from "./analysis";

// Generator input config.
export * from "./generator";

// Compare (future).
export * from "./compare";

// Monitoring (future).
export * from "./monitoring";
