/**
 * The pure analysis pipeline: a {@link FetchResult} → {@link AnalysisReport}.
 *
 * Reuses the existing engines (Parser → Validator → Explainer → Tester) and adds no
 * new robots.txt logic. A missing/failed fetch is analyzed as an empty file so the
 * report stays well-formed, but `policyStatus` records what we actually know:
 * `absent` (genuinely allow-all) vs `unverified` (unknown — never show as allow-all).
 * No IO here.
 */
import { parseRobots } from "@/parser";
import { validateRobots } from "@/features/validator";
import { explainRobots } from "@/features/explainer";
import type { AnalysisReport, FetchResult, ValidationIssue } from "@/types";
import { computeBreakdown } from "./breakdown";
import { buildRecommendations } from "./recommendations";
import { computeVisibility } from "./visibility";
import { policyStatusOf } from "./policy-status";

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
    policyStatus: policyStatusOf(fetch),
    file,
    validation,
    visibility,
    breakdown,
    findings,
    recommendations,
    explanation,
  };
}
