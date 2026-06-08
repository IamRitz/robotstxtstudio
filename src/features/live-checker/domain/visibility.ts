/**
 * Visibility score — how accessible the site is to crawlers. Composes the category
 * breakdown (access %) with the Validator's health score. Pure.
 *
 * value = 0.5·searchEngineAccess + 0.2·aiCrawlerAccess + 0.3·health
 * errorRate = 100 − health   (reuses health; no new judgement)
 */
import { scoreBand } from "@/types";
import type { CategoryBreakdown, HealthScore, VisibilityScore } from "@/types";

const clamp = (n: number): number => Math.max(0, Math.min(100, Math.round(n)));
const pct = (part: number, total: number): number => (total === 0 ? 0 : clamp((part / total) * 100));

export function computeVisibility(
  breakdown: readonly CategoryBreakdown[],
  health: HealthScore,
): VisibilityScore {
  const search = breakdown.find((b) => b.category === "search-engine");
  const searchEngineAccess = pct(search?.allowed ?? 0, search?.total ?? 0);

  const aiCategories = breakdown.filter(
    (b) => b.category === "ai-training" || b.category === "ai-search",
  );
  const aiAllowed = aiCategories.reduce((sum, b) => sum + b.allowed, 0);
  const aiTotal = aiCategories.reduce((sum, b) => sum + b.total, 0);
  const aiCrawlerAccess = pct(aiAllowed, aiTotal);

  const errorRate = clamp(100 - health.value);
  const value = clamp(0.5 * searchEngineAccess + 0.2 * aiCrawlerAccess + 0.3 * health.value);

  return { value, band: scoreBand(value), searchEngineAccess, aiCrawlerAccess, errorRate };
}
