/**
 * Compare Reports model (PRD §18, future).
 *
 * Compare is "diff two {@link RobotsFile}s" — it reuses the canonical AST and adds
 * only the diff vocabulary. Included now to validate that the domain model
 * supports the roadmap without new core concepts.
 */
import type { RobotsFile } from "./robots";

/** What kind of change a diff entry represents. */
export type DiffChangeKind = "added" | "removed" | "changed";

/** Which part of the file a change touches. */
export type DiffScope = "group" | "rule" | "sitemap" | "crawl-delay" | "host";

/** A single difference between two files. */
export interface DiffChange {
  readonly kind: DiffChangeKind;
  readonly scope: DiffScope;
  /** Human-readable description, e.g. "GPTBot changed from allowed to blocked". */
  readonly description: string;
  /** Previous value (absent for `added`). */
  readonly before?: string;
  /** New value (absent for `removed`). */
  readonly after?: string;
}

/** The result of comparing two robots.txt files (e.g. before/after a change). */
export interface RobotsDiff {
  readonly left: RobotsFile;
  readonly right: RobotsFile;
  readonly changes: readonly DiffChange[];
  /** True when there are no changes. */
  readonly identical: boolean;
}

/* ── Semantic comparison (Phase 15C.3) ─────────────────────────────────────── */

/** A before/after score with its delta (positive = improved). */
export interface ScoreDelta {
  /** Stable key, e.g. "overall" / "visibility" / a ScoreDimension. */
  readonly key: string;
  readonly label: string;
  readonly before: number;
  readonly after: number;
  /** `after − before`. */
  readonly delta: number;
}

/** A finding that exists on one side only (added or resolved). */
export interface FindingDelta {
  readonly code: import("./validation").ValidationCode;
  readonly title: string;
  readonly severity: import("./validation").Severity;
}

/** One crawler's site-root access on each side. */
export interface CrawlerAccessDelta {
  readonly id: string;
  readonly name: string;
  readonly category: import("./crawler").CrawlerCategory;
  readonly before: "allowed" | "blocked";
  readonly after: "allowed" | "blocked";
  /** True when access changed between the two files. */
  readonly changed: boolean;
}

/**
 * A lightweight semantic comparison of two robots.txt files (A vs B) — score deltas,
 * findings added/resolved, and per-crawler visibility changes. Reuses the audit,
 * scoring, breakdown, and tester engines; adds no new robots.txt logic.
 */
export interface RobotsComparison {
  /** Audit overall score, A→B. */
  readonly overall: ScoreDelta;
  /** Search visibility score (search-engine access + file health), A→B. */
  readonly visibility: ScoreDelta;
  /** The five audit dimensions, A→B. */
  readonly dimensions: readonly ScoreDelta[];
  /** Findings present in B but not A (newly introduced). */
  readonly findingsAdded: readonly FindingDelta[];
  /** Findings present in A but not B (resolved). */
  readonly findingsResolved: readonly FindingDelta[];
  /** Crawlers whose site-root access changed (both directions). */
  readonly crawlerChanges: readonly CrawlerAccessDelta[];
  /** Every AI crawler's access on each side — the first-class AI visibility report. */
  readonly aiCrawlers: readonly CrawlerAccessDelta[];
  /** True when the two files are byte-identical (ignoring trailing whitespace). */
  readonly identical: boolean;
}
