/**
 * Crawler database vocabulary.
 *
 * The crawler catalog itself (data) lives in the config layer (`src/config`,
 * Phase 8). These types define the shared shape consumed by the Crawler Manager,
 * the Generator, and the Analyzer's category breakdown.
 */

/**
 * Crawler categories, matching the design's grouping (DESIGN_SYSTEM §6, Screen 5).
 * Declared as a `const` tuple so the union and a runtime list share one source.
 *
 * `ai-control` holds robots.txt *product tokens* (Google-Extended,
 * Applebot-Extended) that never fetch pages themselves: they only tell an operator
 * whether content its regular crawler already fetched may be used for AI. They are
 * neither search crawlers nor training crawlers, so they get their own category.
 */
export const CRAWLER_CATEGORIES = [
  "search-engine",
  "ai-training",
  "ai-search",
  "ai-control",
  "seo",
  "social",
  "data",
] as const;

export type CrawlerCategory = (typeof CRAWLER_CATEGORIES)[number];

/**
 * A user's intent for a crawler: allow it or block it. Distinct from
 * {@link CrawlRuleType} (`allow`/`disallow`), which is the robots.txt mechanism
 * used to express that intent.
 */
export type CrawlPolicy = "allow" | "block";

/**
 * A single crawler definition from the catalog. Designed for easy extension —
 * adding a crawler is a data change, not a code change (PRD §12).
 */
export interface Crawler {
  /** Stable identifier, e.g. `gptbot`. */
  readonly id: string;
  /** Display name, e.g. `GPTBot`. */
  readonly name: string;
  /** Operating organization, e.g. `OpenAI`. */
  readonly owner: string;
  /** The `User-agent` token to match in robots.txt, e.g. `GPTBot`. */
  readonly userAgent: string;
  readonly category: CrawlerCategory;
  /** Plain-English "what this means" copy shown in the Crawler Manager. */
  readonly description: string;
  /** The recommended default policy for this crawler. */
  readonly defaultRecommendation: CrawlPolicy;
  /** Link to the crawler operator's documentation, when available. */
  readonly docsUrl?: string;
}

/** A crawler's current policy state, keyed by {@link Crawler.id}. */
export type CrawlerPolicyMap = Readonly<Record<string, CrawlPolicy>>;
