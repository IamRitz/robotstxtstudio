/**
 * robots.txt glossary (Phase 12D growth asset).
 *
 * Definition-query capture + a dense internal-link source. Data only — rendered by
 * `/robots-txt-glossary` and emitted as DefinedTermSet schema. Grouped for a readable
 * page; each term has a stable anchor slug.
 */

export type GlossaryGroup = "directives" | "matching" | "concepts" | "crawlers";

export interface GlossaryTerm {
  /** Stable anchor slug. */
  readonly slug: string;
  readonly term: string;
  readonly group: GlossaryGroup;
  readonly definition: string;
}

export const GLOSSARY_GROUPS: Record<GlossaryGroup, string> = {
  directives: "Directives",
  matching: "Matching & precedence",
  concepts: "Core concepts",
  crawlers: "Crawler types",
};

export const GROUP_ORDER: readonly GlossaryGroup[] = [
  "directives",
  "matching",
  "concepts",
  "crawlers",
];

export const GLOSSARY: readonly GlossaryTerm[] = [
  // Directives
  {
    slug: "user-agent",
    term: "User-agent",
    group: "directives",
    definition:
      "The robots.txt line that names which crawler a group of rules applies to. User-agent: * matches every crawler not named more specifically; User-agent: Googlebot targets just Googlebot.",
  },
  {
    slug: "disallow",
    term: "Disallow",
    group: "directives",
    definition:
      "Tells the named crawler not to fetch URLs matching a path. Disallow: / blocks the whole site; Disallow: /admin blocks anything starting with /admin; an empty Disallow: allows everything.",
  },
  {
    slug: "allow",
    term: "Allow",
    group: "directives",
    definition:
      "Explicitly permits a path, used to carve exceptions out of a broader Disallow. For example, disallow /wp-admin/ but Allow: /wp-admin/admin-ajax.php.",
  },
  {
    slug: "sitemap",
    term: "Sitemap",
    group: "directives",
    definition:
      "Declares the absolute URL of your XML sitemap so crawlers can find it. It is independent of any User-agent group and can appear anywhere in the file.",
  },
  {
    slug: "crawl-delay",
    term: "Crawl-delay",
    group: "directives",
    definition:
      "Requests a minimum number of seconds between requests from a crawler. Bing and several others honor it; Googlebot ignores it (set the rate in Search Console instead).",
  },
  {
    slug: "host",
    term: "Host",
    group: "directives",
    definition:
      "A non-standard directive once used by Yandex to indicate a preferred domain. It is not part of the official standard and is ignored by Google and Bing.",
  },

  // Matching & precedence
  {
    slug: "group",
    term: "Group",
    group: "matching",
    definition:
      "A block of one or more User-agent lines followed by the Allow/Disallow rules that apply to them. A crawler obeys exactly one group — the most specific one matching its name.",
  },
  {
    slug: "wildcard",
    term: "Wildcard (*)",
    group: "matching",
    definition:
      "Inside a path, * matches any sequence of characters. Disallow: /*.pdf blocks every URL ending in .pdf after any prefix. (As a User-agent value, * means 'all crawlers'.)",
  },
  {
    slug: "end-anchor",
    term: "End anchor ($)",
    group: "matching",
    definition:
      "The $ character anchors a path match to the end of the URL. Disallow: /*.php$ blocks URLs ending in .php but not /file.php?id=1.",
  },
  {
    slug: "longest-match",
    term: "Longest-match precedence",
    group: "matching",
    definition:
      "When both an Allow and a Disallow rule match a URL, the more specific (longer path) rule wins. If they are the same length, Allow wins. This is how exceptions work.",
  },
  {
    slug: "specificity",
    term: "User-agent specificity",
    group: "matching",
    definition:
      "A crawler uses the group whose User-agent most specifically names it, not the * group, if a specific group exists — even if the * group has more rules. Only one group ever applies.",
  },

  // Core concepts
  {
    slug: "robots-txt",
    term: "robots.txt",
    group: "concepts",
    definition:
      "A plain-text file at the root of a domain (/robots.txt) that tells crawlers which parts of the site they may request. It controls crawling, not indexing, and is a voluntary standard.",
  },
  {
    slug: "rep",
    term: "Robots Exclusion Protocol (REP)",
    group: "concepts",
    definition:
      "The convention, dating to 1994, by which sites use robots.txt to communicate crawl preferences to bots. It was formalised as RFC 9309 in 2022.",
  },
  {
    slug: "rfc-9309",
    term: "RFC 9309",
    group: "concepts",
    definition:
      "The 2022 IETF standard that formally specifies robots.txt parsing and matching. Google, Bing, and other major crawlers implement it.",
  },
  {
    slug: "crawl-budget",
    term: "Crawl budget",
    group: "concepts",
    definition:
      "The number of URLs a search engine will crawl on your site in a given period. Disallowing low-value paths can steer that budget toward pages you want indexed.",
  },
  {
    slug: "noindex",
    term: "noindex",
    group: "concepts",
    definition:
      "A meta tag or X-Robots-Tag header that tells search engines not to index a page. Unlike robots.txt, it removes a page from results — but the crawler must be allowed to fetch the page to see it.",
  },
  {
    slug: "x-robots-tag",
    term: "X-Robots-Tag",
    group: "concepts",
    definition:
      "An HTTP response header that applies indexing directives (like noindex or nofollow) to any file type, including PDFs and images, where a meta tag isn't possible.",
  },
  {
    slug: "indexing",
    term: "Indexing vs crawling",
    group: "concepts",
    definition:
      "Crawling is fetching a page; indexing is storing it for search results. robots.txt governs crawling. A page blocked by robots.txt can still be indexed (without a snippet) if other sites link to it.",
  },

  // Crawler types
  {
    slug: "crawler",
    term: "Crawler (spider/bot)",
    group: "crawlers",
    definition:
      "An automated program that fetches web pages. Each identifies itself with a User-agent string, which robots.txt rules target — though strings can be spoofed, so verify major bots by IP.",
  },
  {
    slug: "ai-crawler",
    term: "AI crawler",
    group: "crawlers",
    definition:
      "A bot that fetches pages to train an AI model (GPTBot, ClaudeBot, CCBot) or to answer questions in an AI product (PerplexityBot, OAI-SearchBot). Separate from search-engine crawlers.",
  },
  {
    slug: "search-crawler",
    term: "Search-engine crawler",
    group: "crawlers",
    definition:
      "A bot that builds a search index, such as Googlebot or Bingbot. These are the only crawlers whose access affects your search rankings.",
  },
];

const BY_SLUG = new Map(GLOSSARY.map((t) => [t.slug, t]));
export function glossaryTerm(slug: string): GlossaryTerm | undefined {
  return BY_SLUG.get(slug);
}

export function termsInGroup(group: GlossaryGroup): GlossaryTerm[] {
  return GLOSSARY.filter((t) => t.group === group);
}
