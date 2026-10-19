/**
 * AI crawler directory data (Phase 12C.1).
 *
 * A richer, reference-grade dataset than the generator catalog (`@/config/crawlers`):
 * it carries the editorial fields the directory hub and crawler landing pages need —
 * purpose, training/search usage, robots.txt compliance, example configs, and a
 * recommended policy. Data only; rendered by the content pages.
 */

/** Yes / No / Partial answer for a capability column. */
export type Tri = "yes" | "no" | "partial";

export interface AiCrawlerEntry {
  /** Stable id (also used as the directory anchor). */
  readonly id: string;
  /** Display name = the literal User-agent token. */
  readonly name: string;
  readonly company: string;
  /** One-line purpose. */
  readonly purpose: string;
  /** Used to train models? */
  readonly training: Tri;
  /** Used to fetch pages for live AI search / answers? */
  readonly search: Tri;
  /** Honors robots.txt in practice? */
  readonly honors: Tri;
  /** Recommended default policy and the one-line reasoning. */
  readonly recommendation: "allow" | "block" | "depends";
  readonly recommendationWhy: string;
  /** Operator's official crawler documentation (E-E-A-T citation), if published. */
  readonly docsUrl?: string;
}

/**
 * The nine crawlers that matter most for AI access decisions, in directory order.
 * Compliance/usage reflects each operator's published documentation.
 */
export const AI_CRAWLERS: readonly AiCrawlerEntry[] = [
  {
    id: "gptbot",
    name: "GPTBot",
    company: "OpenAI",
    purpose: "Crawls the web to gather training data for OpenAI's foundation models.",
    training: "yes",
    search: "no",
    honors: "yes",
    recommendation: "block",
    recommendationWhy:
      "Pure training crawler — block it if you don't want your content training ChatGPT.",
    docsUrl: "https://platform.openai.com/docs/bots",
  },
  {
    id: "oai-searchbot",
    name: "OAI-SearchBot",
    company: "OpenAI",
    purpose: "Fetches and links pages to surface them in ChatGPT Search results.",
    training: "no",
    search: "yes",
    honors: "yes",
    recommendation: "depends",
    recommendationWhy:
      "Allow it for referral traffic from ChatGPT Search; block it to stay out of AI answers.",
    docsUrl: "https://platform.openai.com/docs/bots",
  },
  {
    id: "claudebot",
    name: "ClaudeBot",
    company: "Anthropic",
    purpose: "Crawls the web to gather training data for Anthropic's Claude models.",
    training: "yes",
    search: "no",
    honors: "yes",
    recommendation: "block",
    recommendationWhy:
      "Training crawler — block it to keep your content out of Claude's training set.",
    docsUrl:
      "https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler",
  },
  {
    id: "claude-searchbot",
    name: "Claude-SearchBot",
    company: "Anthropic",
    purpose: "Fetches pages so Claude can cite and answer with current web results.",
    training: "no",
    search: "yes",
    honors: "yes",
    recommendation: "depends",
    recommendationWhy:
      "Allow it to be cited in Claude's web answers; block it to opt out of AI search.",
    docsUrl:
      "https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler",
  },
  {
    id: "perplexitybot",
    name: "PerplexityBot",
    company: "Perplexity",
    purpose: "Indexes pages for Perplexity's AI answer engine and citations.",
    // Perplexity's docs: "It is not used to crawl content for AI foundation models."
    training: "no",
    search: "yes",
    honors: "partial",
    recommendation: "depends",
    recommendationWhy:
      "Drives referral traffic, but has been reported to fetch some pages without a declared agent — verify with the Analyzer.",
    docsUrl: "https://docs.perplexity.ai/guides/bots",
  },
  {
    id: "ccbot",
    name: "CCBot",
    company: "Common Crawl",
    purpose: "Builds the open Common Crawl dataset that seeds many third-party AI models.",
    training: "yes",
    search: "no",
    honors: "yes",
    recommendation: "block",
    recommendationWhy:
      "One block stops your content reaching dozens of downstream model trainers that use Common Crawl.",
    docsUrl: "https://commoncrawl.org/ccbot",
  },
  {
    id: "google-extended",
    name: "Google-Extended",
    company: "Google",
    purpose:
      "Opt-out token controlling whether Google uses your content for Gemini training and grounding.",
    training: "yes",
    search: "no",
    honors: "yes",
    recommendation: "block",
    recommendationWhy:
      "Blocking it has zero effect on Google Search ranking — Googlebot is separate — so you can opt out of AI training safely.",
    docsUrl: "https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers",
  },
  {
    id: "bytespider",
    name: "Bytespider",
    company: "ByteDance",
    purpose: "Aggressively crawls the web for ByteDance/TikTok AI training.",
    training: "yes",
    search: "no",
    honors: "partial",
    recommendation: "block",
    recommendationWhy:
      "High-volume training crawler with a patchy compliance record — most sites block it to save bandwidth.",
  },
  {
    id: "amazonbot",
    name: "Amazonbot",
    company: "Amazon",
    purpose: "Crawls pages for Amazon products including Alexa answers and AI features.",
    training: "yes",
    search: "partial",
    honors: "yes",
    recommendation: "depends",
    recommendationWhy:
      "Block to opt out of Amazon AI; allow if you want Alexa to answer from your content.",
    docsUrl: "https://developer.amazon.com/amazonbot",
  },
];

const TRI_LABEL: Record<Tri, string> = { yes: "Yes", no: "No", partial: "Partial" };
export function triLabel(t: Tri): string {
  return TRI_LABEL[t];
}

const BY_ID = new Map(AI_CRAWLERS.map((c) => [c.id, c]));
export function aiCrawler(id: string): AiCrawlerEntry | undefined {
  return BY_ID.get(id);
}
