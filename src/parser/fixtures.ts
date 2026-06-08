/**
 * Representative real-world robots.txt samples used by the compatibility tests.
 * Not part of the public API — exported only for tests.
 */

/** Google-style: wildcard group, specific bot, path wildcards, sitemap. */
export const GOOGLE_STYLE = `# robots.txt for example.com
User-agent: *
Disallow: /search
Disallow: /*?*
Allow: /search/about

User-agent: Googlebot
Disallow: /nogoogle/
Allow: /nogoogle/public/

Sitemap: https://example.com/sitemap.xml
`;

/** Publisher-style: allow search engines, block AI training, crawl-delay, sitemap. */
export const PUBLISHER_STYLE = `User-agent: *
Allow: /
Disallow: /wp-admin/
Disallow: /drafts/
Crawl-delay: 5

User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

Sitemap: https://news.example.com/sitemap_index.xml
Host: news.example.com
`;

/** AI-crawler-focused: a long block of AI user-agents each fully disallowed. */
export const AI_CRAWLER_STYLE = `# Opt out of AI crawling
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: PerplexityBot
User-agent: CCBot
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: Bytespider
Disallow: /

User-agent: *
Allow: /
`;

/** Large multi-group file with mixed casing, vendor directives, and comments. */
export const LARGE_MULTI_GROUP = `# Generated robots.txt
USER-AGENT: Googlebot
Disallow: /admin/
Disallow: /private/
Allow: /private/public/
crawl-delay: 2

User-Agent: Bingbot
Disallow: /admin/
Clean-param: sessionid /

user-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: *
Disallow: /tmp/
Disallow: /*.json$

Sitemap: https://shop.example.com/sitemap-products.xml
Sitemap: https://shop.example.com/sitemap-pages.xml
`;
