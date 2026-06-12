/**
 * robots.txt template library (Phase 12D growth asset).
 *
 * Copy-paste starting points by site type. Data only — rendered by the
 * `/robots-txt-templates` gallery, which links each into the Generator. Keep every
 * template valid and minimal; the Generator is the place to customise further.
 */

export interface RobotsTemplate {
  /** Stable id, also the on-page anchor. */
  readonly id: string;
  readonly title: string;
  /** When to reach for this template. */
  readonly description: string;
  /** The complete robots.txt body. */
  readonly code: string;
}

const SITEMAP = "Sitemap: https://example.com/sitemap.xml";

export const TEMPLATES: readonly RobotsTemplate[] = [
  {
    id: "allow-all",
    title: "Allow everything",
    description:
      "The safe default for most sites — let every crawler access everything, and point them to your sitemap.",
    code: `User-agent: *\nDisallow:\n\n${SITEMAP}`,
  },
  {
    id: "blog",
    title: "Blog / personal site",
    description:
      "Open to search engines, with admin and search-result pages kept out of the crawl.",
    code: `User-agent: *\nAllow: /\nDisallow: /search\nDisallow: /*?s=\n\n${SITEMAP}`,
  },
  {
    id: "wordpress",
    title: "WordPress",
    description:
      "Recommended WordPress baseline: block wp-admin (except admin-ajax) and keep the rest crawlable.",
    code: `User-agent: *\nDisallow: /wp-admin/\nAllow: /wp-admin/admin-ajax.php\n\n${SITEMAP}`,
  },
  {
    id: "ecommerce",
    title: "E-commerce",
    description:
      "Keep cart, checkout, and account pages out of the index while products and categories stay crawlable.",
    code: `User-agent: *\nAllow: /\nDisallow: /cart\nDisallow: /checkout\nDisallow: /account\nDisallow: /*?sort=\nDisallow: /*?filter=\n\n${SITEMAP}`,
  },
  {
    id: "saas",
    title: "SaaS / web app",
    description:
      "Index the marketing site, but keep the authenticated app, API, and internal routes out of search.",
    code: `User-agent: *\nAllow: /\nDisallow: /app/\nDisallow: /api/\nDisallow: /dashboard/\nDisallow: /settings/\n\n${SITEMAP}`,
  },
  {
    id: "documentation",
    title: "Documentation site",
    description:
      "Fully open to crawlers — docs benefit from maximum discoverability — with the sitemap declared.",
    code: `User-agent: *\nAllow: /\n\n${SITEMAP}`,
  },
  {
    id: "block-ai-training",
    title: "Block AI training, keep search",
    description:
      "Stay fully visible in Google and Bing while opting out of the major AI training crawlers.",
    code: `User-agent: GPTBot\nUser-agent: ClaudeBot\nUser-agent: CCBot\nUser-agent: Google-Extended\nUser-agent: Bytespider\nDisallow: /\n\nUser-agent: *\nAllow: /\n\n${SITEMAP}`,
  },
  {
    id: "block-all",
    title: "Block everything (staging)",
    description:
      "For staging or maintenance only — blocks all crawlers from the whole site. Never ship this to production.",
    code: `User-agent: *\nDisallow: /`,
  },
];

const BY_ID = new Map(TEMPLATES.map((t) => [t.id, t]));
export function template(id: string): RobotsTemplate | undefined {
  return BY_ID.get(id);
}
