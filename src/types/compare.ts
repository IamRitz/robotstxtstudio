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
