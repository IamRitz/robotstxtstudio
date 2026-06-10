import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";
import { EDU_PAGES, eduPath, SEO_PAGES, seoPath } from "@/config/content";
import { crawlerPagePaths } from "@/config/crawler-directory";

/** Tool + marketing routes. Cluster routes are appended from the content registries. */
const ROUTES: ReadonlyArray<{ path: string; priority: number }> = [
  { path: "/", priority: 1 },
  { path: "/analyze", priority: 0.9 },
  { path: "/generate", priority: 0.9 },
  { path: "/validate", priority: 0.8 },
  { path: "/url-tester", priority: 0.8 },
  { path: "/ai-crawlers", priority: 0.9 },
  { path: "/explain", priority: 0.8 },
  { path: "/compare", priority: 0.7 },
  // Educational SEO cluster (Phase 12B) — kept in sync with the content registry.
  ...EDU_PAGES.map((p) => ({ path: eduPath(p.slug), priority: 0.7 })),
  // Transactional / programmatic SEO cluster (Phase 12C). The AI hub ranks highest.
  ...SEO_PAGES.map((p) => ({ path: seoPath(p.slug), priority: p.group === "hub" ? 0.8 : 0.7 })),
  // Growth assets & Crawler Directory (Phase 12D).
  { path: "/crawlers", priority: 0.8 },
  { path: "/robots-txt-templates", priority: 0.7 },
  { path: "/robots-txt-glossary", priority: 0.7 },
  ...crawlerPagePaths().map((path) => ({ path, priority: 0.6 })),
  // Trust / EEAT + legal pages (Phase 12H-Lite).
  { path: "/about", priority: 0.5 },
  { path: "/methodology", priority: 0.5 },
  { path: "/contact", priority: 0.4 },
  { path: "/privacy", priority: 0.3 },
  { path: "/terms", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map(({ path, priority }) => ({
    url: new URL(path, SITE.url).toString(),
    lastModified,
    changeFrequency: "weekly",
    priority,
  }));
}
