/**
 * Permanent redirects for consolidated URLs (SEO recovery, 2026-10 — see
 * docs/SEO_RECOVERY_2026-10.md for the per-URL rationale).
 *
 * Each source duplicated the intent of a stronger page, so its useful content was
 * merged into the destination and the source now 308s there (Google treats 308 like
 * 301). Rules: the destination must be a live, indexable page in the sitemap; no
 * source may appear in the sitemap or in internal links (enforced by
 * `seo-inventory.test.ts`); no chains.
 *
 * Rollback: delete an entry and restore its page from git — nothing else depends on it.
 *
 * Imported by next.config.ts, so keep this file dependency-free.
 */
export interface ConsolidatedRedirect {
  readonly source: string;
  readonly destination: string;
  readonly reason: string;
}

export const CONSOLIDATED_REDIRECTS: readonly ConsolidatedRedirect[] = [
  // Tool landing pages → the tool itself (same query intent; the tool URL holds the signal).
  {
    source: "/robots-txt-validator",
    destination: "/validate",
    reason: "Same 'robots.txt validator' intent; /validate already earns the impressions.",
  },
  {
    source: "/robots-txt-checker",
    destination: "/validate",
    reason: "'Checker' and 'validator' are one intent; the validator also fetches live files.",
  },
  {
    source: "/robots-txt-analyzer",
    destination: "/analyze",
    reason: "Marketing copy for the analyzer; now rendered on the tool page.",
  },
  {
    source: "/robots-txt-generator",
    destination: "/generate",
    reason: "Marketing copy for the generator; now rendered on the tool page.",
  },
  {
    source: "/robots-txt-tester",
    destination: "/url-tester",
    reason: "Marketing copy for the URL tester; now rendered on the tool page.",
  },
  // Overlapping guides → the stronger guide on the same topic.
  {
    source: "/robots-txt-format",
    destination: "/robots-txt-syntax",
    reason: "Format and syntax are one topic; merged as a 'File format' section.",
  },
  {
    source: "/robots-txt-file",
    destination: "/what-is-robots-txt",
    reason: "Location, contents, and creation merged into the indexed definition guide.",
  },
  {
    source: "/why-robots-txt-is-important",
    destination: "/robots-txt-seo-guide",
    reason: "Crawl budget, risk, and 'when you need one' merged into the SEO guide.",
  },
  {
    source: "/robots-txt-vs-sitemap",
    destination: "/robots-txt-sitemap",
    reason: "Both pages explained robots.txt + sitemaps; merged into one.",
  },
];

/** Redirect sources (for sitemap/link checks). */
export const REDIRECTED_PATHS: ReadonlySet<string> = new Set(
  CONSOLIDATED_REDIRECTS.map((r) => r.source),
);
