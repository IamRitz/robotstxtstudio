/**
 * Validator orchestrator: RobotsFile in → ValidationResult out.
 *
 * Runs every rule against a shared context, sorts the issues (severity, then line),
 * tallies counts, and computes the health score. Pure — the single entry point
 * reused by the Validator screen, the Analyzer, and future Monitoring.
 */
import { compareSeverity } from "@/types";
import type { RobotsFile, Severity, ValidationIssue, ValidationResult } from "@/types";
import { getAiCrawlerStatuses } from "./ai-crawlers";
import type { ValidationContext } from "./context";
import { ALL_RULES } from "./rules";
import { computeHealth } from "./scoring";

/** Sort by severity (error → warning → info), then by line (no-line issues last). */
function bySeverityThenLine(a: ValidationIssue, b: ValidationIssue): number {
  const bySeverity = compareSeverity(a.severity, b.severity);
  if (bySeverity !== 0) return bySeverity;
  return (a.line ?? Number.MAX_SAFE_INTEGER) - (b.line ?? Number.MAX_SAFE_INTEGER);
}

function countBySeverity(issues: readonly ValidationIssue[]): Record<Severity, number> {
  const counts: Record<Severity, number> = { error: 0, warning: 0, info: 0 };
  for (const issue of issues) counts[issue.severity] += 1;
  return counts;
}

/** Validate a parsed robots.txt file. */
export function validateRobots(file: RobotsFile): ValidationResult {
  const ctx: ValidationContext = { file, aiStatuses: getAiCrawlerStatuses(file) };

  const issues = ALL_RULES.flatMap((rule) => rule(ctx)).sort(bySeverityThenLine);
  const counts = countBySeverity(issues);
  const health = computeHealth(issues, ctx.aiStatuses);

  return { isValid: counts.error === 0, issues, health, counts };
}
