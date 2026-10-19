/**
 * Search visibility score + AI policy readouts. Pure.
 *
 * value = 0.7·searchEngineAccess + 0.3·health
 *
 * AI access is deliberately NOT part of the score: blocking GPTBot or opting out
 * via Google-Extended is a policy choice, not a defect, and must not lower a
 * site's number. AI search and AI training/control access are reported as separate
 * percentages so the UI can state them as facts.
 *
 * errorRate = 100 − health   (reuses health; no new judgement)
 */
import { scoreBand } from "@/types";
import type { CategoryBreakdown, CrawlerCategory, HealthScore, VisibilityScore } from "@/types";

const clamp = (n: number): number => Math.max(0, Math.min(100, Math.round(n)));
const pct = (part: number, total: number): number =>
  total === 0 ? 0 : clamp((part / total) * 100);

function access(breakdown: readonly CategoryBreakdown[], categories: readonly CrawlerCategory[]) {
  const rows = breakdown.filter((b) => categories.includes(b.category));
  const allowed = rows.reduce((sum, b) => sum + b.allowed, 0);
  const total = rows.reduce((sum, b) => sum + b.total, 0);
  return pct(allowed, total);
}

export function computeVisibility(
  breakdown: readonly CategoryBreakdown[],
  health: HealthScore,
): VisibilityScore {
  const searchEngineAccess = access(breakdown, ["search-engine"]);
  const aiSearchAccess = access(breakdown, ["ai-search"]);
  const aiTrainingAccess = access(breakdown, ["ai-training", "ai-control"]);

  const errorRate = clamp(100 - health.value);
  const value = clamp(0.7 * searchEngineAccess + 0.3 * health.value);

  return {
    value,
    band: scoreBand(value),
    searchEngineAccess,
    aiSearchAccess,
    aiTrainingAccess,
    errorRate,
  };
}
