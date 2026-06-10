/**
 * Validator feature — consumes a {@link RobotsFile} and produces a
 * {@link ValidationResult} (errors / warnings / recommendations + health score).
 *
 * Pure domain logic: NO React, NO `next/*`. Reused by the Validator screen, the
 * Analyzer, and future Monitoring. Import only via this barrel.
 *
 * @example
 * import { parseRobots } from "@/parser";
 * import { validateRobots } from "@/features/validator";
 * const result = validateRobots(parseRobots(text));
 */
export { validateRobots } from "./domain/validate";
export {
  applyTextEdits,
  fixableIssues,
  safelyFixableIssues,
  collectSafeEdits,
} from "./domain/apply-fix";
export { computeHealth, aiConfigScore, SCORE_WEIGHTS, PENALTIES } from "./domain/scoring";
export { buildAudit, fixImpact, DEDUCTIONS, DIMENSIONS } from "./domain/audit";
export { getAiCrawlerStatuses } from "./domain/ai-crawlers";
export type { AiCrawlerStatus, AiPolicyStatus } from "./domain/ai-crawlers";
export { MAJOR_AI_CRAWLERS, type MajorAiCrawler } from "./domain/constants";
