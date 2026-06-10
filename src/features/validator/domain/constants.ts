/**
 * Validator constants: the AI crawlers we check for, thresholds, and reference
 * links. Kept as data so the rule set stays declarative and easy to extend.
 */
import type { ValidationCode } from "@/types";

/** A major AI crawler the validator reports an explicit-policy status for. */
export interface MajorAiCrawler {
  readonly id: string;
  readonly name: string;
  readonly owner: string;
  /** The `User-agent` token to match (case-insensitive). */
  readonly userAgent: string;
}

/**
 * The AI crawlers that are a product differentiator to surface (PRD §6, §12).
 * Extend this list to cover more crawlers — the rules and scoring adapt.
 */
export const MAJOR_AI_CRAWLERS: readonly MajorAiCrawler[] = [
  { id: "gptbot", name: "GPTBot", owner: "OpenAI", userAgent: "GPTBot" },
  { id: "claudebot", name: "ClaudeBot", owner: "Anthropic", userAgent: "ClaudeBot" },
  { id: "perplexitybot", name: "PerplexityBot", owner: "Perplexity", userAgent: "PerplexityBot" },
  { id: "ccbot", name: "CCBot", owner: "Common Crawl", userAgent: "CCBot" },
  { id: "google-extended", name: "Google-Extended", owner: "Google", userAgent: "Google-Extended" },
];

/** Above this many rules in a single group, we warn about excessive complexity. */
export const EXCESSIVE_RULES_PER_GROUP = 50;

/** Crawlers known to ignore `Crawl-delay` (used by the advisory rule). */
export const CRAWL_DELAY_IGNORERS = ["Googlebot", "*"];

/**
 * User-agents for which `Disallow: /` is dangerous (de-indexing). Blocking a named
 * AI crawler with `Disallow: /` is intentional and is NOT flagged; blocking the
 * wildcard or a search engine usually is not.
 */
export const BROAD_DISALLOW_SENSITIVE_UAS = [
  "*",
  "Googlebot",
  "Bingbot",
  "Slurp",
  "DuckDuckBot",
  "Baiduspider",
  "YandexBot",
];

/**
 * Path fragments that signal an administrative / secret resource. robots.txt is
 * public, so `Disallow`-ing these advertises their existence to anyone (and to
 * attackers) without actually protecting them — an information-disclosure smell that
 * drives the Security score. Matched case-insensitively as substrings of the path.
 */
export const SENSITIVE_PATH_PATTERNS: readonly string[] = [
  "admin",
  "login",
  "signin",
  "wp-admin",
  "wp-config",
  "phpmyadmin",
  "cgi-bin",
  "backup",
  "config",
  "secret",
  "private",
  "password",
  ".git",
  ".env",
  ".htaccess",
  ".sql",
  "database",
];

/** Optional "Learn more" links per code. */
export const LEARN_MORE: Partial<Record<ValidationCode, string>> = {
  "missing-ai-crawler-policy": "https://platform.openai.com/docs/gptbot",
  "ai-crawler-inherits-default": "https://platform.openai.com/docs/gptbot",
  "crawl-delay-ignored-by-google":
    "https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt",
  "invalid-sitemap-url": "https://www.sitemaps.org/protocol.html",
};
