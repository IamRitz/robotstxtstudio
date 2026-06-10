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
  | "quoted-directive"
  // Warning — valid but potentially problematic.
  | "duplicate-rule"
  | "missing-sitemap"
  | "overly-broad-disallow"
  | "excessive-rules"
  | "unsupported-directive"
  | "crawl-delay-zero"
  | "path-missing-leading-slash"
  | "redundant-wildcard"
  | "duplicate-user-agent-group"
  | "blocks-rendering-assets"
  | "noindex-unsupported"
  // Recommendation (info) — best-practice guidance.
  | "missing-ai-crawler-policy"
  | "ai-crawler-inherits-default"
  | "no-default-group"
  | "no-crawler-specific-groups"
  | "no-comments"
  | "sitemap-not-https"
  | "crawl-delay-ignored-by-google"
  // Security (info) — robots.txt is public; flag information disclosure.
  | "sensitive-path-disclosure";

/** A concrete, deterministic edit suggestion attached to an issue ("Fix This"). */
export interface SuggestedFix {
  /** Human-readable description of the fix (also the "Fix This" button hint). */
  readonly description: string;
  /** Concrete text edits to apply. When absent, the fix is advisory only. */
  readonly edits?: readonly TextEdit[];
  /**
   * True when the edit is deterministic AND intent-preserving, so it is eligible for
   * "Fix All Safe Issues" (e.g. removing a no-op `Crawl-delay: 0`). Fixes that change
   * crawler access or guess intent (e.g. removing one side of a conflict) are left
   * `false`/undefined — offered as a manual "Fix This" only.
   */
  readonly safe?: boolean;
}

/**
 * A single line-based text edit (1-based `line`):
 * - `replacement === ""` removes the line entirely,
 * - non-empty `replacement` replaces the line's content,
 * - `line` past EOF appends `replacement` as a new line.
 */
export interface TextEdit {
  readonly line: number;
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
