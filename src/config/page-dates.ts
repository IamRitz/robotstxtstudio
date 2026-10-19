/**
 * Per-page publish / last-substantive-change dates (SEO recovery, 2026-10).
 *
 * Replaces the build-time `new Date()` sitemap lastmod and the single site-wide
 * CONTENT_UPDATED constant, which told search engines every page changed on every
 * deploy. Google uses <lastmod> only when it is consistently accurate, so these are
 * real dates:
 *
 * - `published` — the commit that first added the page (git log --diff-filter=A).
 * - `modified`  — the last commit that changed the page's visible content.
 *
 * Bump `modified` ONLY when the main content changes (not for link tweaks, refactors,
 * or styling). `scripts/check-page-dates.mjs` lists pages whose source changed in git
 * after the recorded date so you can decide whether a bump is warranted. Paths
 * missing from this map simply omit <lastmod>/dateModified rather than inventing one.
 */

export interface PageDates {
  /** YYYY-MM-DD */
  readonly published: string;
  /** YYYY-MM-DD */
  readonly modified: string;
}

/** The 2026-10 recovery sprint, for pages whose content it rewrote. */
const RECOVERY = "2026-10-19";

export const PAGE_DATES: Readonly<Record<string, PageDates>> = {
  "/": { published: "2026-06-08", modified: RECOVERY },
  // Tools
  "/analyze": { published: "2026-06-08", modified: RECOVERY },
  "/generate": { published: "2026-06-08", modified: RECOVERY },
  "/validate": { published: "2026-06-08", modified: RECOVERY },
  "/url-tester": { published: "2026-06-08", modified: RECOVERY },
  "/ai-crawlers": { published: "2026-06-08", modified: RECOVERY },
  "/explain": { published: "2026-06-08", modified: "2026-06-11" },
  "/compare": { published: "2026-06-11", modified: "2026-06-13" },
  // Educational guides
  "/what-is-robots-txt": { published: "2026-06-10", modified: RECOVERY },
  "/how-does-robots-txt-work": { published: "2026-06-10", modified: "2026-06-11" },
  "/robots-txt-syntax": { published: "2026-06-10", modified: RECOVERY },
  "/how-to-find-robots-txt": { published: "2026-06-10", modified: "2026-06-11" },
  "/how-to-read-robots-txt": { published: "2026-06-10", modified: "2026-06-11" },
  "/robots-txt-examples": { published: "2026-06-10", modified: "2026-06-13" },
  "/robots-txt-sitemap": { published: "2026-06-10", modified: RECOVERY },
  "/robots-txt-seo-guide": { published: "2026-06-10", modified: RECOVERY },
  // AI cluster
  "/ai-crawlers-directory": { published: "2026-06-10", modified: RECOVERY },
  "/block-ai-crawlers": { published: "2026-06-13", modified: RECOVERY },
  "/gptbot-robots-txt": { published: "2026-06-10", modified: "2026-06-13" },
  "/claudebot-robots-txt": { published: "2026-06-10", modified: "2026-06-13" },
  "/perplexitybot-robots-txt": { published: "2026-06-10", modified: "2026-06-13" },
  "/google-extended-robots-txt": { published: "2026-06-10", modified: "2026-06-13" },
  "/ccbot-robots-txt": { published: "2026-06-10", modified: "2026-06-13" },
  "/oai-searchbot-robots-txt": { published: "2026-06-13", modified: "2026-06-13" },
  "/claude-searchbot-robots-txt": { published: "2026-06-13", modified: "2026-06-13" },
  // Platform guides + comparison
  "/wordpress-robots-txt": { published: "2026-06-10", modified: "2026-06-11" },
  "/shopify-robots-txt": { published: "2026-06-10", modified: "2026-06-11" },
  "/magento-robots-txt": { published: "2026-06-10", modified: "2026-06-11" },
  "/nextjs-robots-txt": { published: "2026-06-10", modified: "2026-06-11" },
  "/robots-txt-vs-noindex": { published: "2026-06-10", modified: "2026-06-11" },
  // Hubs
  "/crawlers": { published: "2026-06-10", modified: RECOVERY },
  "/robots-txt-templates": { published: "2026-06-10", modified: "2026-06-18" },
  "/robots-txt-glossary": { published: "2026-06-10", modified: "2026-06-11" },
  // Crawler profiles (content lives in src/config/crawler-directory.ts)
  "/crawlers/googlebot": { published: "2026-06-10", modified: "2026-06-13" },
  "/crawlers/bingbot": { published: "2026-06-10", modified: "2026-06-13" },
  "/crawlers/slurp": { published: "2026-06-10", modified: "2026-06-13" },
  "/crawlers/ahrefsbot": { published: "2026-06-10", modified: "2026-06-13" },
  "/crawlers/semrushbot": { published: "2026-06-10", modified: "2026-06-13" },
  "/crawlers/bytespider": { published: "2026-06-10", modified: "2026-06-13" },
  "/crawlers/amazonbot": { published: "2026-06-10", modified: "2026-06-13" },
  // Category relabelled from "AI search" to "AI usage controls" in the recovery sprint.
  "/crawlers/applebot-extended": { published: "2026-06-10", modified: RECOVERY },
  "/crawlers/meta-externalagent": { published: "2026-06-10", modified: "2026-06-13" },
  "/crawlers/facebookexternalhit": { published: "2026-06-10", modified: "2026-06-13" },
  // Trust / legal
  "/about": { published: "2026-06-10", modified: "2026-06-11" },
  "/methodology": { published: "2026-06-10", modified: RECOVERY },
  "/contact": { published: "2026-06-10", modified: "2026-06-11" },
  "/privacy": { published: "2026-06-10", modified: "2026-06-10" },
  "/terms": { published: "2026-06-10", modified: "2026-06-10" },
};

export function pageDates(path: string): PageDates | undefined {
  return PAGE_DATES[path];
}
