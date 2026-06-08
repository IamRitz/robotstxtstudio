/**
 * Explainer copy: friendly crawler labels and AI crawler purposes.
 *
 * Data, not logic — extend these maps to improve phrasing or cover more crawlers.
 * (Later this can be sourced from the config-layer crawler DB; kept local for now.)
 */

/** Friendly label for a user-agent token, keyed by lowercased token. */
export const CRAWLER_LABELS: Readonly<Record<string, string>> = {
  googlebot: "Google's Googlebot",
  bingbot: "Microsoft's Bingbot",
  slurp: "Yahoo's Slurp",
  duckduckbot: "DuckDuckGo's bot",
  baiduspider: "Baidu's spider",
  yandexbot: "Yandex's bot",
  gptbot: "OpenAI's GPTBot",
  claudebot: "Anthropic's ClaudeBot",
  perplexitybot: "Perplexity's PerplexityBot",
  ccbot: "Common Crawl's CCBot",
  "google-extended": "Google-Extended (Google's AI training)",
  ahrefsbot: "Ahrefs' crawler",
  semrushbot: "Semrush's crawler",
  twitterbot: "Twitter's bot",
  facebookexternalhit: "Facebook's crawler",
};

/** What each major AI crawler does, keyed by crawler id (from MAJOR_AI_CRAWLERS). */
export const AI_PURPOSES: Readonly<Record<string, string>> = {
  gptbot: "trains OpenAI's models (such as ChatGPT) on your content",
  claudebot: "trains Anthropic's Claude models on your content",
  perplexitybot: "fetches your pages for Perplexity's AI answer engine",
  ccbot: "collects data for Common Crawl, a public dataset used to train many AI models",
  "google-extended": "controls whether Google can use your content to train Gemini and other AI models",
};
