import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

/** Indexable routes. SEO/content routes are appended as later 12 sub-phases land. */
const ROUTES: ReadonlyArray<{ path: string; priority: number }> = [
  { path: "/", priority: 1 },
  { path: "/analyze", priority: 0.9 },
  { path: "/generate", priority: 0.9 },
  { path: "/validate", priority: 0.8 },
  { path: "/url-tester", priority: 0.8 },
  { path: "/ai-crawlers", priority: 0.9 },
  { path: "/explain", priority: 0.8 },
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
