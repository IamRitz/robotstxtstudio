/**
 * AI crawler policy detection — the product differentiator.
 *
 * For each major AI crawler, determine whether the file configures it:
 * - `explicit`  — a group targets the crawler by name.
 * - `inherited` — no explicit group, but a default (`*`) group applies.
 * - `missing`   — no explicit group and no default group.
 *
 * Pure and reused by the Analyzer and future Monitoring.
 */
import type { RobotsFile } from "@/types";
import { MAJOR_AI_CRAWLERS, type MajorAiCrawler } from "./constants";
import { groupTargets, hasWildcardGroup } from "./helpers";

export type AiPolicyStatus = "explicit" | "inherited" | "missing";

export interface AiCrawlerStatus {
  readonly crawler: MajorAiCrawler;
  readonly status: AiPolicyStatus;
}

/** Classify every major AI crawler's policy status for the given file. */
export function getAiCrawlerStatuses(file: RobotsFile): AiCrawlerStatus[] {
  const hasDefault = hasWildcardGroup(file);
  return MAJOR_AI_CRAWLERS.map((crawler) => {
    const explicit = file.groups.some((group) => groupTargets(group, crawler.userAgent));
    const status: AiPolicyStatus = explicit ? "explicit" : hasDefault ? "inherited" : "missing";
    return { crawler, status };
  });
}
