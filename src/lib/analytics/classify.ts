/**
 * Page classification (Phase 13B).
 *
 * Maps a pathname to a coarse `page_type` so every pageview is segmentable without
 * per-page instrumentation. This is what answers the SEO questions — top crawler /
 * glossary / template / guide / landing pages — straight from `$pageview` data, and
 * provides the `source_type` dimension for conversion funnels.
 */
import { SEO_PAGES } from "@/config/content";

export type PageType =
  | "home"
  | "tool"
  | "crawler"
  | "ai-hub"
  | "glossary"
  | "template"
  /** Retired 2026-10: the /robots-txt-* tool landings now redirect to the tools. Kept
   *  so historical events still type-check in dashboards/exports. */
  | "tool-landing"
  | "comparison"
  | "cms"
  | "guide"
  | "trust";

const TOOL_PATHS = new Set([
  "/analyze",
  "/generate",
  "/validate",
  "/url-tester",
  "/ai-crawlers",
  "/explain",
]);
const TRUST_PATHS = new Set(["/about", "/contact", "/privacy", "/terms", "/methodology"]);
const CMS_PATHS = new Set(SEO_PAGES.filter((p) => p.group === "cms").map((p) => `/${p.slug}`));
const COMPARISON_PATHS = new Set(
  SEO_PAGES.filter((p) => p.group === "comparison").map((p) => `/${p.slug}`),
);

/** Coarse page type for a pathname. Order matters (most specific first). */
export function classifyPath(path: string): PageType {
  if (path === "/") return "home";
  if (TOOL_PATHS.has(path)) return "tool";
  if (TRUST_PATHS.has(path)) return "trust";
  if (path === "/crawlers" || path.startsWith("/crawlers/")) return "crawler";
  if (path === "/ai-crawlers-directory") return "ai-hub";
  if (path === "/robots-txt-glossary") return "glossary";
  if (path === "/robots-txt-templates") return "template";
  if (COMPARISON_PATHS.has(path)) return "comparison";
  if (CMS_PATHS.has(path)) return "cms";
  // Remaining SEO_PAGES (crawler-specific transactional pages) + everything else → guide-ish.
  return "guide";
}
