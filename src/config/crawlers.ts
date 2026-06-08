/**
 * The crawler catalog (config-layer data).
 *
 * Single source of truth for crawler identities used by the Generator and the AI
 * Manager. Data only — extend by adding entries. Shape matches the domain
 * {@link Crawler} type and is validated by `crawlerCatalogSchema` (see test).
 */
import type { Crawler, CrawlerCategory } from "@/types";

export const ALL_CRAWLERS: readonly Crawler[] = [
  // Search engines
  { id: "googlebot", name: "Googlebot", owner: "Google", userAgent: "Googlebot", category: "search-engine", description: "Google Search's crawler — controls your visibility in Google.", defaultRecommendation: "allow" },
  { id: "bingbot", name: "Bingbot", owner: "Microsoft", userAgent: "Bingbot", category: "search-engine", description: "Microsoft Bing's crawler — controls visibility in Bing.", defaultRecommendation: "allow" },
  { id: "slurp", name: "Slurp", owner: "Yahoo", userAgent: "Slurp", category: "search-engine", description: "Yahoo Search's crawler.", defaultRecommendation: "allow" },

  // AI training crawlers
  { id: "gptbot", name: "GPTBot", owner: "OpenAI", userAgent: "GPTBot", category: "ai-training", description: "Collects content to train OpenAI's models (e.g. ChatGPT).", defaultRecommendation: "block" },
  { id: "claudebot", name: "ClaudeBot", owner: "Anthropic", userAgent: "ClaudeBot", category: "ai-training", description: "Collects content to train Anthropic's Claude models.", defaultRecommendation: "block" },
  { id: "ccbot", name: "CCBot", owner: "Common Crawl", userAgent: "CCBot", category: "ai-training", description: "Builds the Common Crawl public dataset used to train many AI models.", defaultRecommendation: "block" },
  { id: "bytespider", name: "Bytespider", owner: "ByteDance", userAgent: "Bytespider", category: "ai-training", description: "ByteDance's crawler, used for AI training.", defaultRecommendation: "block" },
  { id: "meta-externalagent", name: "Meta-ExternalAgent", owner: "Meta", userAgent: "meta-externalagent", category: "ai-training", description: "Meta's crawler used for AI training.", defaultRecommendation: "block" },

  // AI search / answer engines
  { id: "perplexitybot", name: "PerplexityBot", owner: "Perplexity", userAgent: "PerplexityBot", category: "ai-search", description: "Fetches pages for Perplexity's AI answer engine.", defaultRecommendation: "block" },
  { id: "google-extended", name: "Google-Extended", owner: "Google", userAgent: "Google-Extended", category: "ai-search", description: "Controls Google using your content to train Gemini and other AI models.", defaultRecommendation: "block" },
  { id: "applebot-extended", name: "Applebot-Extended", owner: "Apple", userAgent: "Applebot-Extended", category: "ai-search", description: "Controls Apple using your content for AI training.", defaultRecommendation: "block" },

  // SEO tools
  { id: "ahrefsbot", name: "AhrefsBot", owner: "Ahrefs", userAgent: "AhrefsBot", category: "seo", description: "Ahrefs' SEO backlink crawler.", defaultRecommendation: "allow" },
  { id: "semrushbot", name: "SemrushBot", owner: "Semrush", userAgent: "SemrushBot", category: "seo", description: "Semrush's SEO analytics crawler.", defaultRecommendation: "allow" },
  { id: "mj12bot", name: "MJ12bot", owner: "Majestic", userAgent: "MJ12bot", category: "seo", description: "Majestic's backlink crawler.", defaultRecommendation: "allow" },

  // Social
  { id: "twitterbot", name: "Twitterbot", owner: "X (Twitter)", userAgent: "Twitterbot", category: "social", description: "Generates link previews for X/Twitter.", defaultRecommendation: "allow" },
  { id: "facebookexternalhit", name: "facebookexternalhit", owner: "Meta", userAgent: "facebookexternalhit", category: "social", description: "Generates link previews for Facebook.", defaultRecommendation: "allow" },

  // Other / data crawlers
  { id: "amazonbot", name: "Amazonbot", owner: "Amazon", userAgent: "Amazonbot", category: "data", description: "Amazon's crawler (used by Alexa and AI products).", defaultRecommendation: "block" },
  { id: "cohere-ai", name: "cohere-ai", owner: "Cohere", userAgent: "cohere-ai", category: "data", description: "Cohere's crawler for AI products.", defaultRecommendation: "block" },
  { id: "diffbot", name: "Diffbot", owner: "Diffbot", userAgent: "Diffbot", category: "data", description: "Diffbot's structured-data crawler.", defaultRecommendation: "block" },
  { id: "imagesiftbot", name: "ImagesiftBot", owner: "ImageSift", userAgent: "ImagesiftBot", category: "data", description: "ImageSift's image crawler.", defaultRecommendation: "block" },
];

const BY_ID = new Map(ALL_CRAWLERS.map((c) => [c.id, c]));

/** Look up a crawler by id. */
export function getCrawler(id: string): Crawler | undefined {
  return BY_ID.get(id);
}

/** Crawlers in a category. */
export function crawlersByCategory(category: CrawlerCategory): Crawler[] {
  return ALL_CRAWLERS.filter((c) => c.category === category);
}

/** Display order and labels for crawler categories (used in generated output + UI). */
export const CATEGORY_ORDER: readonly CrawlerCategory[] = [
  "search-engine",
  "ai-training",
  "ai-search",
  "seo",
  "social",
  "data",
];

export const CATEGORY_LABELS: Record<CrawlerCategory, string> = {
  "search-engine": "Search engines",
  "ai-training": "AI training crawlers",
  "ai-search": "AI search crawlers",
  seo: "SEO crawlers",
  social: "Social crawlers",
  data: "Other / data crawlers",
};
