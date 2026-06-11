/**
 * "Why this matters" — the plain-English consequence of each finding (Phase 2A).
 *
 * The issue `message` says what's wrong; this table says what it costs you and, where
 * the in-app fix isn't the whole story, what to do instead. One entry per
 * {@link ValidationCode} — the Record type makes coverage a compile-time guarantee.
 * Pure data; rendered by the Validator's issue panel and reusable by the Analyzer.
 */
import type { ValidationCode } from "@/types";

export const WHY_IT_MATTERS: Record<ValidationCode, string> = {
  "missing-colon":
    "Crawlers silently skip lines they can't parse, so the rule you intended simply never applies — and no crawler will ever warn you about it.",
  "empty-user-agent":
    "A group that names no crawler applies to nothing: every rule inside it is dead weight, ignored by every crawler that reads the file.",
  "directive-before-user-agent":
    "Rules only take effect inside a User-agent group. Placed before one, this rule belongs to no group and is silently ignored by all crawlers.",
  "invalid-crawl-delay":
    "Crawlers ignore a Crawl-delay they can't parse, so the throttling you intended doesn't happen — bots keep crawling at full speed.",
  "conflicting-rules":
    "When the same path is both allowed and disallowed, crawlers break the tie differently (Google prefers Allow; others vary) — access to that path becomes unpredictable.",
  "invalid-sitemap-url":
    "Sitemap discovery only works with a full absolute URL. Crawlers can't use this one, so new or weakly-linked pages may be indexed late or not at all.",
  "quoted-directive":
    "robots.txt has no quoting — the quote characters are matched literally, so this rule targets a path that doesn't exist and never fires.",
  "duplicate-rule":
    "Harmless to crawlers, but a maintenance trap: when someone edits one copy and not the other, the file quietly stops meaning what it says.",
  "missing-sitemap":
    "robots.txt is the first file crawlers read. Declaring your sitemap here is the cheapest way to make every page discoverable — especially pages with few internal links.",
  "overly-broad-disallow":
    "Disallow: / for a search engine removes your entire site from its results over time. It is the single most destructive robots.txt mistake.",
  "excessive-rules":
    "Very large groups are hard to reason about and can run into crawler parsing limits, at which point later rules are silently dropped.",
  "unsupported-directive":
    "Most crawlers skip directives they don't recognize, so whatever this line was meant to do isn't happening.",
  "crawl-delay-zero":
    "A delay of zero requests no throttling at all — the line does nothing except suggest to future maintainers that it does.",
  "path-missing-leading-slash":
    "Paths are matched from the site root. Without a leading slash, this pattern almost certainly doesn't match the URLs you meant.",
  "redundant-wildcard":
    "** matches exactly what * matches; the extra wildcard only obscures the rule's intent.",
  "duplicate-user-agent-group":
    "Crawlers pick ONE group per user agent — they don't merge duplicates. Whichever group loses, its rules are silently inactive.",
  "blocks-rendering-assets":
    "Google renders pages like a browser. Blocking CSS/JS or core asset folders breaks that rendering, which can hurt indexing and rankings even when the HTML itself is crawlable.",
  "noindex-unsupported":
    "Google stopped honoring Noindex in robots.txt in 2019, so the page can still be indexed. Use a meta robots tag or X-Robots-Tag header instead.",
  "missing-ai-crawler-policy":
    "This AI crawler can use your content for training or answers, and no rule — not even a default group — applies to it. The access decision is being made for you, not by you.",
  "ai-crawler-inherits-default":
    "This AI crawler currently follows your catch-all rules, so its access is incidental rather than chosen. If AI use of your content deserves a different policy than search, it needs its own group.",
  "no-default-group":
    "Without a User-agent: * group, any crawler you haven't named has no rules at all — unlisted bots crawl everything by default.",
  "no-crawler-specific-groups":
    "One-size-fits-all rules can't express different policies for search engines vs AI crawlers — you give up per-crawler control.",
  "no-comments":
    "Future maintainers (including you in six months) can't tell why a rule exists. Comments make the file's intent auditable.",
  "sitemap-not-https":
    "An http:// sitemap URL usually redirects (or mismatches your canonical origin), adding friction to discovery. Point crawlers straight at the https:// version.",
  "crawl-delay-ignored-by-google":
    "Google ignores Crawl-delay entirely — for Googlebot, crawl rate is controlled in Search Console. The directive only affects some other engines, so don't rely on it.",
  "sensitive-path-disclosure":
    "robots.txt is public and routinely scraped by attackers looking for exactly this. Disallowing a sensitive path advertises it without protecting it — secure the path itself and remove it from here.",
};

/** The consequence text for one finding code. */
export function whyItMatters(code: ValidationCode): string {
  return WHY_IT_MATTERS[code];
}
