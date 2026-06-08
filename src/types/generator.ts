/**
 * Generator model (Screen 3).
 *
 * {@link GeneratorConfig} is the Generator's boundary input (from the UI form).
 * The Generator's domain logic turns it into a {@link RobotsFile}, which is then
 * serialized to text. Because the output is a `RobotsFile`, the generated file can
 * be validated, tested, and explained with no extra plumbing.
 *
 * `GeneratorConfig` is validated at the boundary by a Zod schema in `src/schemas`.
 */
import type { CrawlerPolicyMap } from "./crawler";

/**
 * Starter templates offered in the Generator (Screen 3).
 *
 * LOCKED to the approved screen designs: Blog, SaaS, E-commerce, Publisher,
 * Documentation. Earlier references to `news`/`portfolio` (from the original brief)
 * are superseded and must not be reintroduced — the approved designs are the source
 * of truth (PRD §11 S3).
 */
export const STARTER_TEMPLATES = [
  "blog",
  "saas",
  "ecommerce",
  "publisher",
  "documentation",
] as const;

export type WebsiteType = (typeof STARTER_TEMPLATES)[number];

/** The Generator's full input configuration. */
export interface GeneratorConfig {
  /** Selected starter template, if any (seeds default policies/paths). */
  readonly template?: WebsiteType;
  /** Per-crawler allow/block decisions, keyed by crawler id. */
  readonly crawlerPolicies: CrawlerPolicyMap;
  /** Additional paths to disallow for all user-agents. */
  readonly disallowPaths: readonly string[];
  /** Absolute sitemap URL to declare, if any. */
  readonly sitemapUrl?: string;
  /** Optional `Crawl-delay` in seconds. */
  readonly crawlDelay?: number;
}
