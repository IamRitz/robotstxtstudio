import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";
import { EDU_PAGES, eduPath, SEO_PAGES, seoPath } from "@/config/content";
import { crawlerPagePaths } from "@/config/crawler-directory";
import { pageDates } from "@/config/page-dates";

/**
 * Every canonical, indexable 200 URL — and nothing else. Redirect sources
 * (src/config/redirects.ts), /dev, and /api are never listed; `seo-inventory.test.ts`
 * enforces that against the route tree.
 *
 * No changefreq/priority (Google ignores both). lastmod is the page's real
 * last-content-change date from src/config/page-dates.ts, omitted when unknown.
 */
export function sitemapPaths(): string[] {
  return [
    "/",
    // Tools
    "/analyze",
    "/generate",
    "/validate",
    "/url-tester",
    "/ai-crawlers",
    "/explain",
    "/compare",
    // Educational + transactional clusters (registries)
    ...EDU_PAGES.map((p) => eduPath(p.slug)),
    ...SEO_PAGES.map((p) => seoPath(p.slug)),
    // Hubs + crawler profiles
    "/crawlers",
    "/robots-txt-templates",
    "/robots-txt-glossary",
    ...crawlerPagePaths(),
    // Trust / legal
    "/about",
    "/methodology",
    "/contact",
    "/privacy",
    "/terms",
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapPaths().map((path) => {
    const dates = pageDates(path);
    return {
      url: new URL(path, SITE.url).toString(),
      ...(dates ? { lastModified: dates.modified } : {}),
    };
  });
}
