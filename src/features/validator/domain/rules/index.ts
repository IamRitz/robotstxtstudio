/**
 * The validation rule registry. Order here is the natural authoring order; the
 * orchestrator re-sorts emitted issues by severity then line.
 */
import type { Rule } from "../context";
import * as syntax from "./syntax";
import * as best from "./best-practices";
import * as ai from "./ai";
import * as security from "./security";
import * as mistakes from "./mistakes";

export const ALL_RULES: readonly Rule[] = [
  // Critical (error)
  syntax.missingColon,
  syntax.directiveBeforeUserAgent,
  syntax.emptyUserAgent,
  syntax.invalidCrawlDelay,
  syntax.invalidSitemapUrl,
  syntax.conflictingRules,
  mistakes.quotedDirective,
  // Warning
  best.duplicateRules,
  best.missingSitemap,
  best.overlyBroadDisallow,
  best.excessiveRules,
  best.unsupportedDirective,
  best.crawlDelayZero,
  mistakes.pathMissingLeadingSlash,
  mistakes.redundantWildcard,
  mistakes.duplicateUserAgentGroup,
  mistakes.blocksRenderingAssets,
  mistakes.noindexUnsupported,
  // Recommendation (info)
  ai.missingAiCrawlerPolicy,
  ai.aiCrawlerInheritsDefault,
  best.noDefaultGroup,
  best.noCrawlerSpecificGroups,
  best.noComments,
  best.sitemapNotHttps,
  best.crawlDelayIgnoredByGoogle,
  // Security (info)
  security.sensitivePathDisclosure,
];
