/**
 * AI Crawler Manager — model crawler-access *intent* and analyze its impact by
 * orchestrating the completed engines (Generator, Tester, Validator, Explainer).
 *
 * Operates above raw robots.txt: users set Allow/Block/Inherit per crawler or
 * category; the manager converts intent to a `GeneratorConfig` and renders via the
 * Generator. NO robots.txt strings are built here. Pure domain: no React/Next.
 *
 * @example
 * import { fromWebsitePreset, blockAllAiCrawlers, analyzePolicySet } from "@/features/crawler-manager";
 * const impact = analyzePolicySet(blockAllAiCrawlers(fromWebsitePreset("blog")));
 * impact.text; // robots.txt   impact.crawlers; // per-crawler effect
 */
export type {
  PermissionState,
  PolicySet,
  PolicyImpact,
  CrawlerImpact,
  CategorySummary,
  PolicyRecommendation,
} from "./domain/types";
export {
  emptyPolicySet,
  fromWebsitePreset,
  getPermission,
  setPermission,
  setCategoryPermission,
  blockAllAiCrawlers,
  allowAllAiCrawlers,
  setDisallowPaths,
  setSitemapUrl,
} from "./domain/permissions";
export { toGeneratorConfig } from "./domain/to-config";
export { analyzePolicySet } from "./domain/impact";
export { categorySummaries, summarizeCrawler } from "./domain/summaries";
