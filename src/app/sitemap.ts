import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";
import { EDU_PAGES, eduPath } from "@/config/content";

/** Tool + marketing routes. Educational cluster routes are appended from the registry. */
const ROUTES: ReadonlyArray<{ path: string; priority: number }> = [
  { path: "/", priority: 1 },
  { path: "/analyze", priority: 0.9 },
  { path: "/generate", priority: 0.9 },
  { path: "/validate", priority: 0.8 },
  { path: "/url-tester", priority: 0.8 },
  { path: "/ai-crawlers", priority: 0.9 },
  { path: "/explain", priority: 0.8 },
  // Educational SEO cluster (Phase 12B) — kept in sync with the content registry.
  ...EDU_PAGES.map((p) => ({ path: eduPath(p.slug), priority: 0.7 })),
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
