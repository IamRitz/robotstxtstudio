/**
 * Public Tester entry point: wraps {@link evaluateAccess} with a human-readable
 * reason and a step-by-step trace (which powers the UI's rule-tracing section).
 */
import type { CrawlRule, RobotsFile, TestTraceStep, UrlTestResult } from "@/types";
import { evaluateAccess, type AccessEvaluation } from "./evaluate";

const ruleLabel = (rule: CrawlRule): string =>
  `${rule.type === "allow" ? "Allow" : "Disallow"}: ${rule.path || "(empty)"}`;

function userAgentStep(evaluation: AccessEvaluation, crawler: string, step: number): TestTraceStep {
  if (evaluation.source === "none") {
    return {
      step,
      label: "Match user-agent",
      status: "info",
      detail: `No group matches "${crawler}", so it is allowed by default.`,
    };
  }
  if (evaluation.source === "default") {
    return {
      step,
      label: "Match user-agent",
      status: "info",
      detail: `No specific group for "${crawler}"; using the default "User-agent: *" group.`,
    };
  }
  return {
    step,
    label: "Match user-agent",
    status: "pass",
    detail: `Matched the most specific group, "User-agent: ${evaluation.matchedUserAgent}", for "${crawler}".`,
  };
}

function buildTrace(evaluation: AccessEvaluation, crawler: string): TestTraceStep[] {
  const steps: TestTraceStep[] = [userAgentStep(evaluation, crawler, 1)];

  steps.push({
    step: steps.length + 1,
    label: "Evaluate path rules",
    status: "info",
    detail:
      evaluation.candidates.length === 0
        ? `No rules match "${evaluation.path}".`
        : `${evaluation.candidates.length} rule(s) match "${evaluation.path}": ${evaluation.candidates
            .map(ruleLabel)
            .join("; ")}.`,
  });

  if (evaluation.matchedRule) {
    steps.push({
      step: steps.length + 1,
      label: "Apply precedence",
      status: "info",
      detail: `Longest match wins; Allow beats Disallow on ties. Winner: "${ruleLabel(
        evaluation.matchedRule,
      )}" (line ${evaluation.matchedRule.line}).`,
    });
  }

  steps.push({
    step: steps.length + 1,
    label: "Decision",
    status: evaluation.decision,
    detail:
      evaluation.decision === "blocked"
        ? `Blocked by "${ruleLabel(evaluation.matchedRule!)}".`
        : evaluation.matchedRule
          ? `Allowed by "${ruleLabel(evaluation.matchedRule)}".`
          : `Allowed — no rule blocks "${evaluation.path}".`,
  });

  return steps;
}

function buildReason(evaluation: AccessEvaluation, crawler: string): string {
  if (evaluation.decision === "blocked") {
    return `"${crawler}" is blocked from ${evaluation.path} by "${ruleLabel(evaluation.matchedRule!)}".`;
  }
  if (evaluation.matchedRule) {
    return `"${crawler}" is allowed to access ${evaluation.path} — "${ruleLabel(evaluation.matchedRule)}" wins over any Disallow.`;
  }
  return `"${crawler}" is allowed to access ${evaluation.path} — no rule disallows it.`;
}

/** Test whether `crawler` can access `url` per `file`, with a full explanation. */
export function testUrl(file: RobotsFile, url: string, crawler: string): UrlTestResult {
  const evaluation = evaluateAccess(file, url, crawler);
  return {
    url,
    userAgent: crawler,
    decision: evaluation.decision,
    ...(evaluation.matchedRule ? { matchedRule: evaluation.matchedRule } : {}),
    ...(evaluation.matchedUserAgent !== undefined
      ? { matchedUserAgent: evaluation.matchedUserAgent }
      : {}),
    reason: buildReason(evaluation, crawler),
    trace: buildTrace(evaluation, crawler),
  };
}
