/**
 * AI Crawler Manager vocabulary — the intent layer above robots.txt.
 *
 * Users think "Allow Claude", not "User-agent: ClaudeBot". A {@link PolicySet}
 * models that intent; it is later converted to a `GeneratorConfig` and rendered by
 * the Generator. No robots.txt strings are built here.
 */
import type {
  Crawler,
  CrawlerCategory,
  CrawlDecision,
  ExplanationResult,
  GeneratorConfig,
  RobotsFile,
  Severity,
  ValidationResult,
  WebsiteType,
} from "@/types";

/** A crawler's intended permission, independent of robots.txt syntax. */
export type PermissionState = "allow" | "block" | "inherit";

/** The canonical AI-Manager state: per-crawler intent plus baseline settings. */
export interface PolicySet {
  /** Provenance when seeded from a website preset. */
  readonly template?: WebsiteType;
  /** crawlerId → intended permission (absent ⇒ `inherit`). */
  readonly permissions: Readonly<Record<string, PermissionState>>;
  /** Paths disallowed for the default (`*`) baseline. */
  readonly disallowPaths: readonly string[];
  readonly sitemapUrl?: string;
  readonly crawlDelay?: number;
}

/** What happens to one crawler under a policy set. */
export interface CrawlerImpact {
  readonly crawler: Crawler;
  readonly state: PermissionState;
  /** Effective access to the site root under the generated file. */
  readonly access: CrawlDecision;
  /** Plain-English impact summary. */
  readonly summary: string;
}

/** Per-category tally of permission states. */
export interface CategorySummary {
  readonly category: CrawlerCategory;
  readonly label: string;
  readonly allowed: number;
  readonly blocked: number;
  readonly inherited: number;
  readonly total: number;
}

/** An actionable recommendation surfaced by the manager. */
export interface PolicyRecommendation {
  readonly severity: Severity;
  readonly message: string;
  readonly crawlerId?: string;
}

/** The full impact analysis of a policy set (composes all engines). */
export interface PolicyImpact {
  readonly config: GeneratorConfig;
  readonly file: RobotsFile;
  readonly text: string;
  readonly validation: ValidationResult;
  readonly explanation: ExplanationResult;
  readonly crawlers: readonly CrawlerImpact[];
  readonly categories: readonly CategorySummary[];
  readonly recommendations: readonly PolicyRecommendation[];
}
