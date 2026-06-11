/**
 * Plain-English per-crawler impact summaries and per-category tallies.
 */
import { CATEGORY_LABELS, CATEGORY_ORDER, crawlersByCategory } from "@/config/crawlers";
import type { Crawler, CrawlDecision } from "@/types";
import { getPermission } from "./permissions";
import type { CategorySummary, PermissionState, PolicySet } from "./types";

/** Impact sentence for a single crawler under its state + effective access. */
export function summarizeCrawler(
  crawler: Crawler,
  state: PermissionState,
  access: CrawlDecision,
): string {
  const name = crawler.name;
  if (state === "block") {
    return `${name} will be blocked from accessing your entire site.`;
  }
  if (state === "allow") {
    return access === "allowed"
      ? `${name} will be allowed to access your site (it follows the default policy).`
      : `${name} is set to Allow, but the default policy currently blocks it.`;
  }
  return access === "allowed"
    ? `${name} has no explicit rule and will inherit the default policy (currently allowed).`
    : `${name} has no explicit rule and will inherit the default policy (currently blocked).`;
}

/** Tally permission states per category, in catalog order. */
export function categorySummaries(set: PolicySet): CategorySummary[] {
  return CATEGORY_ORDER.map((category) => {
    const crawlers = crawlersByCategory(category);
    let allowed = 0;
    let blocked = 0;
    let inherited = 0;
    for (const crawler of crawlers) {
      const state = getPermission(set, crawler.id);
      if (state === "allow") allowed += 1;
      else if (state === "block") blocked += 1;
      else inherited += 1;
    }
    return {
      category,
      label: CATEGORY_LABELS[category],
      allowed,
      blocked,
      inherited,
      total: crawlers.length,
    };
  });
}
