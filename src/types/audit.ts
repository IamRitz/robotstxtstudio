/**
 * Audit scoring model (Phase 15B — Validator 2.0).
 *
 * A transparent, deduction-based score: each dimension starts at 100 and every
 * validation issue subtracts a fixed, documented number of points traceable to its
 * rule (no opaque "magic numbers"). The overall score is a fixed weighted average of
 * the five dimensions. See `features/validator/domain/audit.ts` and
 * docs/VALIDATOR.md for the methodology.
 */
import type { HealthBand } from "./score";
import type { Severity, ValidationCode } from "./validation";

/** The five scored dimensions. */
export type ScoreDimension = "syntax" | "seo" | "ai" | "maintainability" | "security";

/** Points lost in one dimension, aggregated by rule code (one row per code). */
export interface DimensionDeduction {
  readonly code: ValidationCode;
  /** Short human label, e.g. "Missing sitemap". */
  readonly label: string;
  /** Points deducted per occurrence. */
  readonly perOccurrence: number;
  /** How many issues of this code hit this dimension. */
  readonly count: number;
  /** Total points lost (`perOccurrence * count`). */
  readonly points: number;
  /** True when at least one of these issues has an applicable in-app fix. */
  readonly recoverable: boolean;
}

/** One dimension's score, band, breakdown, and recoverable potential. */
export interface DimensionScore {
  readonly dimension: ScoreDimension;
  /** Display label, e.g. "SEO". */
  readonly label: string;
  /** One-line, plain-English explanation of what the score measures. */
  readonly explanation: string;
  readonly value: number;
  readonly band: HealthBand;
  /** Why points were lost, aggregated by rule. Empty when the score is 100. */
  readonly deductions: readonly DimensionDeduction[];
  /** Score achievable in this dimension after applying every in-app fix. */
  readonly potential: number;
}

/** A high-priority fix recommendation (the biggest point recoveries first). */
export interface AuditPriority {
  readonly code: ValidationCode;
  readonly title: string;
  readonly dimension: ScoreDimension;
  readonly severity: Severity;
  /** Points recovered in its dimension by resolving it (per occurrence). */
  readonly points: number;
  /** Whether the tool can apply this fix in one click. */
  readonly recoverable: boolean;
}

/** Executive summary of the audit. */
export interface AuditSummary {
  /** One- or two-sentence plain-English verdict. */
  readonly headline: string;
  readonly strengths: readonly string[];
  readonly weaknesses: readonly string[];
  readonly priorities: readonly AuditPriority[];
  /** Overall score projected after applying all *safe* fixes. */
  readonly estimatedAfterSafeFixes: number;
}

/** The full multi-dimensional audit. */
export interface AuditReport {
  readonly overall: {
    readonly value: number;
    readonly band: HealthBand;
    /** Overall projected after applying every in-app fix. */
    readonly potential: number;
  };
  /** Always the five dimensions, in display order. */
  readonly dimensions: readonly DimensionScore[];
  readonly summary: AuditSummary;
}
