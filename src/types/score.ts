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

/**
 * Standardized health band (Phase 15B — Validator 2.0). Used consistently across the
 * audit dashboard's overall score and all five category scores. Distinct from the
 * legacy 3-band {@link ScoreBand} (kept for the Analyzer's gauges).
 */
export type HealthBand = "excellent" | "good" | "needs-attention" | "poor";

/** Lower bounds (inclusive) for each health band. */
export const HEALTH_THRESHOLDS = {
  /** 95–100. */
  excellent: 95,
  /** 85–94. */
  good: 85,
  /** 70–84. */
  "needs-attention": 70,
  /** 0–69. */
  poor: 0,
} as const;

/** Human-readable band labels (single source for UI). */
export const HEALTH_BAND_LABEL: Record<HealthBand, string> = {
  excellent: "Excellent",
  good: "Good",
  "needs-attention": "Needs Attention",
  poor: "Poor",
};

/** Map a 0–100 score to its standardized health band. */
export function healthBand(value: number): HealthBand {
  if (value >= HEALTH_THRESHOLDS.excellent) return "excellent";
  if (value >= HEALTH_THRESHOLDS.good) return "good";
  if (value >= HEALTH_THRESHOLDS["needs-attention"]) return "needs-attention";
  return "poor";
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
