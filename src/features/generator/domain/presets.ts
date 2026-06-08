/**
 * Starter presets. LOCKED to the approved set — Blog, SaaS, E-commerce, Publisher,
 * Documentation (PRD §11 S3). `news`/`portfolio` are intentionally absent.
 *
 * A preset expresses policy by crawler *category* plus default disallow paths;
 * `applyPreset` expands it into a full {@link GeneratorConfig} the UI can tweak.
 */
import { ALL_CRAWLERS } from "@/config/crawlers";
import type { CrawlPolicy, CrawlerCategory, GeneratorConfig, WebsiteType } from "@/types";

export const TEMPLATE_LABELS: Record<WebsiteType, string> = {
  blog: "Blog",
  saas: "SaaS",
  ecommerce: "E-commerce",
  publisher: "Publisher",
  documentation: "Documentation",
};

interface PresetDefinition {
  readonly policyByCategory: Record<CrawlerCategory, CrawlPolicy>;
  readonly disallowPaths: readonly string[];
}

const allowSearchSeoSocial = {
  "search-engine": "allow",
  seo: "allow",
  social: "allow",
} as const;

export const PRESETS: Record<WebsiteType, PresetDefinition> = {
  blog: {
    policyByCategory: { ...allowSearchSeoSocial, "ai-training": "block", "ai-search": "block", data: "block" },
    disallowPaths: ["/wp-admin/"],
  },
  saas: {
    policyByCategory: { ...allowSearchSeoSocial, "ai-training": "block", "ai-search": "block", data: "block" },
    disallowPaths: ["/app/", "/dashboard/", "/api/", "/admin/"],
  },
  ecommerce: {
    policyByCategory: { ...allowSearchSeoSocial, "ai-training": "block", "ai-search": "allow", data: "block" },
    disallowPaths: ["/cart/", "/checkout/", "/account/", "/admin/"],
  },
  publisher: {
    policyByCategory: { ...allowSearchSeoSocial, "ai-training": "block", "ai-search": "allow", data: "block" },
    disallowPaths: ["/wp-admin/", "/drafts/"],
  },
  documentation: {
    policyByCategory: { ...allowSearchSeoSocial, "ai-training": "block", "ai-search": "allow", data: "block" },
    disallowPaths: [],
  },
};

/** Expand a preset into a full GeneratorConfig (policy for every catalog crawler). */
export function applyPreset(template: WebsiteType): GeneratorConfig {
  const preset = PRESETS[template];
  const crawlerPolicies: Record<string, CrawlPolicy> = {};
  for (const crawler of ALL_CRAWLERS) {
    crawlerPolicies[crawler.id] = preset.policyByCategory[crawler.category];
  }
  return { template, crawlerPolicies, disallowPaths: [...preset.disallowPaths] };
}
