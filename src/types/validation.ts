/**
 * Validation model.
 *
 * The Validator inspects a {@link RobotsFile} and produces a {@link ValidationResult}
 * (aggregate) made of {@link ValidationIssue}s (items). The Analyzer reuses the same
 * issue type for its audit findings — no duplicate "finding" concept exists.
 */
import type { HealthScore } from "./score";
import type { LineRange } from "./robots";

/** Severity levels, matching the design's status colors (DESIGN_SYSTEM §2). */
export type Severity = "error" | "warning" | "info";

/**
 * Severity sort order (most→least serious). Single source of truth for ordering
 * issues in the UI, reused by the Validator and Analyzer.
 */
export const SEVERITY_ORDER: readonly Severity[] = ["error", "warning", "info"];

/** Compare two severities; negative if `a` is more serious than `b`. */
export function compareSeverity(a: Severity, b: Severity): number {
  return SEVERITY_ORDER.indexOf(a) - SEVERITY_ORDER.indexOf(b);
}

/**
 * Stable, machine-readable issue codes. Each maps to a check the Validator
 * performs (PRD §11 S6 acceptance criteria). Extend this union as checks are added.
 */
export type ValidationCode =
  // Critical (error) — likely to cause crawler problems.
  | "missing-colon"
  | "empty-user-agent"
  | "directive-before-user-agent"
  | "invalid-crawl-delay"
  | "conflicting-rules"
  | "invalid-sitemap-url"
  // Warning — valid but potentially problematic.
  | "duplicate-rule"
  | "missing-sitemap"
  | "overly-broad-disallow"
  | "excessive-rules"
  | "unsupported-directive"
  | "crawl-delay-zero"
  // Recommendation (info) — best-practice guidance.
  | "missing-ai-crawler-policy"
  | "ai-crawler-inherits-default"
  | "no-default-group"
  | "no-crawler-specific-groups"
  | "no-comments"
  | "sitemap-not-https"
  | "crawl-delay-ignored-by-google";

/** A concrete, deterministic edit suggestion attached to an issue ("Fix This"). */
export interface SuggestedFix {
  /** Human-readable description of the fix. */
  readonly description: string;
  /** Optional concrete text edits to apply. */
  readonly edits?: readonly TextEdit[];
}

/** A single text edit: replace `line` (1-based) with `replacement`, or insert when `line` is past EOF. */
export interface TextEdit {
  readonly line: number;
  /** New text for the line; empty string deletes the line's content. */
  readonly replacement: string;
}

/** One validation finding. */
export interface ValidationIssue {
  /** Unique id within a result (stable across renders, e.g. `${code}:${line}`). */
  readonly id: string;
  readonly severity: Severity;
  readonly code: ValidationCode;
  /** Short title for the issue card (Screen 6). */
  readonly title: string;
  /** Plain-English description of the cause. */
  readonly message: string;
  /** 1-based line the issue points at, for editor highlighting. */
  readonly line?: number;
  /** Span when the issue covers multiple lines (e.g. conflicting rules). */
  readonly lineRange?: LineRange;
  readonly fix?: SuggestedFix;
  /** Link to an explanatory doc ("Learn More"). */
  readonly learnMoreUrl?: string;
}

/** The aggregate validation outcome for a file. */
export interface ValidationResult {
  /** True when there are no `error`-severity issues. */
  readonly isValid: boolean;
  /** All issues, conventionally sorted by {@link compareSeverity} then line. */
  readonly issues: readonly ValidationIssue[];
  readonly health: HealthScore;
  /** Convenience counts by severity for badges (Screen 6). */
  readonly counts: Readonly<Record<Severity, number>>;
}
