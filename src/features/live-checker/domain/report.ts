/**
 * The pure analysis pipeline: a {@link FetchResult} → {@link AnalysisReport}.
 *
 * Reuses the existing engines (Parser → Validator → Explainer → Tester) and adds no
 * new robots.txt logic. A missing/failed fetch is analyzed as an empty (allow-all)
 * file, with the real `fetch.status` recorded and a recommendation attached — so the
 * report is always well-formed. No IO here.
 */
import { parseRobots } from "@/parser";
import { validateRobots } from "@/features/validator";
import { explainRobots } from "@/features/explainer";
import type { AnalysisReport, FetchResult, ValidationIssue } from "@/types";
import { computeBreakdown } from "./breakdown";
import { buildRecommendations } from "./recommendations";
import { computeVisibility } from "./visibility";

/** Build the canonical analysis report from a fetch result. Pure. */
export function buildAnalysisReport(
  fetch: FetchResult,
  domain: string,
  fetchedAt: string,
): AnalysisReport {
  const file = parseRobots(fetch.body ?? "");
  const validation = validateRobots(file);
  const explanation = explainRobots(file, { validation });

  const breakdown = computeBreakdown(file);
  const visibility = computeVisibility(breakdown, validation.health);
  const findings: ValidationIssue[] = validation.issues.filter(
    (issue) => issue.severity === "error" || issue.severity === "warning",
  );
  const recommendations = buildRecommendations(validation, fetch);

  return {
    domain,
    fetchedAt,
    fetch,
    file,
    validation,
    visibility,
    breakdown,
    findings,
    recommendations,
    explanation,
  };
}
