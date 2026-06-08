/**
 * Health scoring — reusable by the Validator screen, the Analyzer, and Dashboard
 * summaries. Deterministic and explainable: three sub-scores combined by fixed
 * weights, then banded via the shared {@link scoreBand} (80/60 thresholds).
 */
import { scoreBand } from "@/types";
import type { HealthScore, ValidationCode, ValidationIssue } from "@/types";
import type { AiCrawlerStatus } from "./ai-crawlers";

/** Sub-score weights for the overall value. Documented in docs/VALIDATOR.md. */
export const SCORE_WEIGHTS = {
  syntax: 0.45,
  aiCrawlerConfig: 0.25,
  bestPractices: 0.3,
} as const;

/** Per-issue penalties applied to the relevant sub-score. */
export const PENALTIES = {
  /** Each error drops the syntax sub-score. */
  error: 20,
  /** Each warning drops the best-practices sub-score. */
  warning: 12,
  /** Each non-AI info recommendation drops the best-practices sub-score. */
  info: 5,
} as const;

const AI_CODES: ReadonlySet<ValidationCode> = new Set<ValidationCode>([
  "missing-ai-crawler-policy",
  "ai-crawler-inherits-default",
]);

const clamp = (n: number): number => Math.max(0, Math.min(100, Math.round(n)));

/** AI sub-score: explicit = full credit, inherited = half, missing = none. */
export function aiConfigScore(statuses: readonly AiCrawlerStatus[]): number {
  if (statuses.length === 0) return 100;
  const credit = statuses.reduce(
    (sum, { status }) => sum + (status === "explicit" ? 1 : status === "inherited" ? 0.5 : 0),
    0,
  );
  return clamp((credit / statuses.length) * 100);
}

/** Compute the full {@link HealthScore} from issues + AI statuses. */
export function computeHealth(
  issues: readonly ValidationIssue[],
  aiStatuses: readonly AiCrawlerStatus[],
): HealthScore {
  let errors = 0;
  let warnings = 0;
  let nonAiInfos = 0;
  for (const issue of issues) {
    if (issue.severity === "error") errors += 1;
    else if (issue.severity === "warning") warnings += 1;
    else if (!AI_CODES.has(issue.code)) nonAiInfos += 1;
  }

  const syntax = clamp(100 - PENALTIES.error * errors);
  const bestPractices = clamp(100 - PENALTIES.warning * warnings - PENALTIES.info * nonAiInfos);
  const aiCrawlerConfig = aiConfigScore(aiStatuses);

  const value = clamp(
    syntax * SCORE_WEIGHTS.syntax +
      aiCrawlerConfig * SCORE_WEIGHTS.aiCrawlerConfig +
      bestPractices * SCORE_WEIGHTS.bestPractices,
  );

  return { value, band: scoreBand(value), subscores: { syntax, aiCrawlerConfig, bestPractices } };
}
