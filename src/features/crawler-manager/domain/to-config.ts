/**
 * The PolicyGenerator: convert intent (a {@link PolicySet}) into a
 * {@link GeneratorConfig}. The Generator then renders robots.txt — the manager
 * never builds robots.txt strings.
 *
 * `block` → an explicit Disallow group; `allow` → the wildcard baseline (kept in the
 * config to document intent); `inherit` → omitted (also the baseline).
 */
import type { CrawlPolicy, GeneratorConfig } from "@/types";
import type { PolicySet } from "./types";

export function toGeneratorConfig(set: PolicySet): GeneratorConfig {
  const crawlerPolicies: Record<string, CrawlPolicy> = {};
  for (const [id, state] of Object.entries(set.permissions)) {
    if (state === "block") crawlerPolicies[id] = "block";
    else if (state === "allow") crawlerPolicies[id] = "allow";
    // "inherit" is omitted — it follows the default baseline.
  }
  return {
    ...(set.template ? { template: set.template } : {}),
    crawlerPolicies,
    disallowPaths: [...set.disallowPaths],
    ...(set.sitemapUrl ? { sitemapUrl: set.sitemapUrl } : {}),
    ...(set.crawlDelay !== undefined ? { crawlDelay: set.crawlDelay } : {}),
  };
}
