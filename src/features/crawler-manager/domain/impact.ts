/**
 * The impact engine: analyze a {@link PolicySet} by composing the completed engines.
 *
 * Generator → robots.txt AST + text (+ Validator + Explainer via generatePreview),
 * Tester → per-crawler effective access. Produces a {@link PolicyImpact}. Introduces
 * NO new robots.txt logic.
 */
import { ALL_CRAWLERS, isAiCategory } from "@/config/crawlers";
import { generatePreview } from "@/features/generator";
import { testUrl } from "@/features/tester";
import type { ValidationCode, ValidationResult } from "@/types";
import { getPermission } from "./permissions";
import { categorySummaries, summarizeCrawler } from "./summaries";
import { toGeneratorConfig } from "./to-config";
import type { CrawlerImpact, PolicyImpact, PolicyRecommendation, PolicySet } from "./types";

/** AI-status codes the manager covers via intent (avoid duplicate recommendations). */
const AI_STATUS_CODES: ReadonlySet<ValidationCode> = new Set<ValidationCode>([
  "missing-ai-crawler-policy",
  "ai-crawler-inherits-default",
]);

function buildRecommendations(
  validation: ValidationResult,
  impacts: readonly CrawlerImpact[],
): PolicyRecommendation[] {
  const recommendations: PolicyRecommendation[] = [];

  // Intent-driven: undecided AI crawlers should get an explicit policy.
  for (const { crawler, state } of impacts) {
    const isAi = isAiCategory(crawler.category);
    if (isAi && state === "inherit") {
      recommendations.push({
        severity: "info",
        crawlerId: crawler.id,
        message: `${crawler.name} has no explicit policy. Set Allow or Block to control AI access deliberately.`,
      });
    }
  }

  // Pass through non-AI advisories from the Validator (e.g. missing sitemap).
  for (const issue of validation.issues) {
    if (issue.severity !== "error" && !AI_STATUS_CODES.has(issue.code)) {
      recommendations.push({ severity: issue.severity, message: issue.message });
    }
  }

  return recommendations;
}

/** Analyze the full impact of a policy set. */
export function analyzePolicySet(set: PolicySet): PolicyImpact {
  const config = toGeneratorConfig(set);
  const preview = generatePreview(config);

  const crawlers: CrawlerImpact[] = ALL_CRAWLERS.map((crawler) => {
    const state = getPermission(set, crawler.id);
    const access = testUrl(preview.file, "/", crawler.userAgent).decision;
    return { crawler, state, access, summary: summarizeCrawler(crawler, state, access) };
  });

  return {
    config,
    file: preview.file,
    text: preview.text,
    validation: preview.validation,
    explanation: preview.explanation,
    crawlers,
    categories: categorySummaries(set),
    recommendations: buildRecommendations(preview.validation, crawlers),
  };
}
