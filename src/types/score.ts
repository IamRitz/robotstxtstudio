/**
 * Scoring primitives shared by the Validator (health score) and the Analyzer
 * (visibility score). One banding rule, matching the design's gauge thresholds
 * (DESIGN_SYSTEM §2: 80–100 green, 60–79 amber, 0–59 red).
 */

/** Qualitative band derived from a 0–100 score. */
export type ScoreBand = "good" | "moderate" | "poor";

/** Lower bounds (inclusive) for each band. */
export const SCORE_THRESHOLDS = {
  /** 80–100 → good (green). */
  good: 80,
  /** 60–79 → moderate (amber). */
  moderate: 60,
  /** 0–59 → poor (red). */
  poor: 0,
} as const;

/**
 * Map a 0–100 score to its band. Pure, total over all finite numbers; values
 * outside 0–100 clamp to the nearest band. This is the single source of truth
 * for gauge coloring across features.
 */
export function scoreBand(value: number): ScoreBand {
  if (value >= SCORE_THRESHOLDS.good) return "good";
  if (value >= SCORE_THRESHOLDS.moderate) return "moderate";
  return "poor";
}

/** A 0–100 score paired with its derived band. */
export interface Score {
  /** Integer 0–100. */
  readonly value: number;
  readonly band: ScoreBand;
}

/** The Validator's health score with its three sub-scores (Screen 6). */
export interface HealthScore extends Score {
  readonly subscores: {
    /** Syntax correctness. */
    readonly syntax: number;
    /** AI crawler configuration completeness. */
    readonly aiCrawlerConfig: number;
    /** Best-practice adherence. */
    readonly bestPractices: number;
  };
}

/** The Analyzer's visibility score with access breakdown (Screen 2). */
export interface VisibilityScore extends Score {
  /** % of search-engine crawlers allowed. */
  readonly searchEngineAccess: number;
  /** % of AI crawlers allowed. */
  readonly aiCrawlerAccess: number;
  /** % of rules/lines with detected problems. */
  readonly errorRate: number;
}
