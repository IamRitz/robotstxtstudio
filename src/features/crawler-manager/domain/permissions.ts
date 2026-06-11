/**
 * PolicySet construction and immutable updates. The crawler catalog is the source
 * of truth for ids/categories; presets reuse the Generator's `applyPreset`.
 */
import { crawlersByCategory } from "@/config/crawlers";
import { applyPreset } from "@/features/generator";
import type { CrawlerCategory, WebsiteType } from "@/types";
import type { PermissionState, PolicySet } from "./types";

/** An empty policy set — every crawler inherits the default. */
export function emptyPolicySet(): PolicySet {
  return { permissions: {}, disallowPaths: [] };
}

/** The intended permission for a crawler (defaults to `inherit`). */
export function getPermission(set: PolicySet, crawlerId: string): PermissionState {
  return set.permissions[crawlerId] ?? "inherit";
}

/** Set one crawler's permission (immutable). */
export function setPermission(
  set: PolicySet,
  crawlerId: string,
  state: PermissionState,
): PolicySet {
  return { ...set, permissions: { ...set.permissions, [crawlerId]: state } };
}

/** Set the permission for every crawler in a category (immutable). */
export function setCategoryPermission(
  set: PolicySet,
  category: CrawlerCategory,
  state: PermissionState,
): PolicySet {
  const permissions = { ...set.permissions };
  for (const crawler of crawlersByCategory(category)) permissions[crawler.id] = state;
  return { ...set, permissions };
}

/** Block every AI crawler (training + search) — the "Block all AI" preset. */
export function blockAllAiCrawlers(set: PolicySet): PolicySet {
  return setCategoryPermission(
    setCategoryPermission(set, "ai-training", "block"),
    "ai-search",
    "block",
  );
}

/** Allow every AI crawler (training + search) — the "Open/Research" preset. */
export function allowAllAiCrawlers(set: PolicySet): PolicySet {
  return setCategoryPermission(
    setCategoryPermission(set, "ai-training", "allow"),
    "ai-search",
    "allow",
  );
}

/** Seed a policy set from a website preset (maps allow/block intent). */
export function fromWebsitePreset(template: WebsiteType): PolicySet {
  const config = applyPreset(template);
  const permissions: Record<string, PermissionState> = {};
  for (const [id, policy] of Object.entries(config.crawlerPolicies)) permissions[id] = policy;
  return {
    template,
    permissions,
    disallowPaths: [...config.disallowPaths],
    ...(config.sitemapUrl ? { sitemapUrl: config.sitemapUrl } : {}),
    ...(config.crawlDelay !== undefined ? { crawlDelay: config.crawlDelay } : {}),
  };
}

/** Set the baseline disallow paths (immutable). */
export function setDisallowPaths(set: PolicySet, paths: readonly string[]): PolicySet {
  return { ...set, disallowPaths: [...paths] };
}

/** Set (or clear) the sitemap URL (immutable). */
export function setSitemapUrl(set: PolicySet, url: string | undefined): PolicySet {
  const { sitemapUrl: _omit, ...rest } = set;
  return url ? { ...rest, sitemapUrl: url } : rest;
}
