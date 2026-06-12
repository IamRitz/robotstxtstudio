/**
 * Content cluster registry — the source of truth for educational pages, the author
 * (EEAT), and tool CTAs. Used by the content layout, related-resources blocks, the
 * sitemap, and the footer so no page is orphaned.
 */
import type { Route } from "next";
import {
  Bot,
  FileText,
  Megaphone,
  ScanSearch,
  ShieldCheck,
  TestTube,
  type LucideIcon,
} from "lucide-react";

/** Editorial byline + review note for EEAT. */
export const AUTHOR = {
  name: "Robots.txt Studio Editorial",
  role: "Technical SEO & crawling",
  bio: "We build robots.txt tooling and parse thousands of real-world files. Guides are written by practitioners and reviewed against the Google and RFC 9309 specifications.",
  reviewedBy: "Reviewed against Google Search Central and RFC 9309",
} as const;

/** Content last-reviewed date (single source so updates are consistent). */
export const CONTENT_UPDATED = "2026-06-08";
export const CONTENT_PUBLISHED = "2026-06-08";

export type ToolId = "generator" | "validator" | "analyzer" | "tester" | "ai-manager" | "explainer";

export interface ToolMeta {
  readonly id: ToolId;
  readonly title: string;
  readonly description: string;
  readonly href: Route;
  readonly icon: LucideIcon;
  readonly cta: string;
}

export const TOOLS: Record<ToolId, ToolMeta> = {
  generator: {
    id: "generator",
    title: "Robots.txt Generator",
    description: "Build a valid robots.txt from presets and crawler toggles — no syntax required.",
    href: "/generate",
    icon: FileText,
    cta: "Open the Generator",
  },
  validator: {
    id: "validator",
    title: "Robots.txt Validator",
    description: "Catch syntax errors and best-practice issues, with a health score.",
    href: "/validate",
    icon: ShieldCheck,
    cta: "Validate your file",
  },
  analyzer: {
    id: "analyzer",
    title: "Robots.txt Analyzer",
    description: "Fetch and audit any site's live robots.txt in one report.",
    href: "/analyze",
    icon: ScanSearch,
    cta: "Analyze a site",
  },
  tester: {
    id: "tester",
    title: "URL Tester",
    description: "See whether a URL is blocked or allowed for any crawler, with a rule trace.",
    href: "/url-tester",
    icon: TestTube,
    cta: "Test a URL",
  },
  "ai-manager": {
    id: "ai-manager",
    title: "AI Crawler Manager",
    description: "Allow or block GPTBot, ClaudeBot, PerplexityBot and more in one place.",
    href: "/ai-crawlers",
    icon: Bot,
    cta: "Manage AI crawlers",
  },
  explainer: {
    id: "explainer",
    title: "Robots.txt Explainer",
    description: "Read any robots.txt in plain English, including AI crawler impact.",
    href: "/explain",
    icon: Megaphone,
    cta: "Explain a file",
  },
};

/** An educational cluster page (registry entry). */
export interface EduPageMeta {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
}

/**
 * The educational cluster. Order is the recommended reading flow. Registry powers the
 * sitemap, related-resources, footer, and "next reading" links.
 */
export const EDU_PAGES: readonly EduPageMeta[] = [
  {
    slug: "what-is-robots-txt",
    title: "What Is robots.txt?",
    description:
      "A plain-English guide to what a robots.txt file is, what it does, and what it doesn't.",
  },
  {
    slug: "robots-txt-file",
    title: "The robots.txt File",
    description: "Where the robots.txt file lives, what goes in it, and how to create one.",
  },
  {
    slug: "how-does-robots-txt-work",
    title: "How Does robots.txt Work?",
    description:
      "How crawlers fetch, match, and apply robots.txt rules — group selection and precedence.",
  },
  {
    slug: "robots-txt-syntax",
    title: "robots.txt Syntax",
    description:
      "Every directive explained: User-agent, Allow, Disallow, Sitemap, Crawl-delay, wildcards.",
  },
  {
    slug: "robots-txt-format",
    title: "robots.txt Format",
    description:
      "What a correct robots.txt file looks like: structure, encoding, and formatting rules.",
  },
  {
    slug: "how-to-find-robots-txt",
    title: "How to Find robots.txt",
    description: "How to locate the robots.txt file on any website — yours or a competitor's.",
  },
  {
    slug: "how-to-read-robots-txt",
    title: "How to Read robots.txt",
    description: "Read any robots.txt line by line and know exactly what it allows and blocks.",
  },
  {
    slug: "robots-txt-examples",
    title: "robots.txt Examples",
    description:
      "Copy-paste robots.txt examples for blogs, WordPress, ecommerce, and blocking AI crawlers.",
  },
  {
    slug: "robots-txt-sitemap",
    title: "robots.txt Sitemap",
    description: "How to reference your XML sitemap from robots.txt the right way.",
  },
  {
    slug: "why-robots-txt-is-important",
    title: "Why robots.txt Is Important",
    description:
      "What robots.txt does for crawl budget, SEO, and AI access — and the risks of getting it wrong.",
  },
  {
    slug: "robots-txt-seo-guide",
    title: "robots.txt for SEO",
    description: "Best practices for using robots.txt in technical SEO without hurting indexing.",
  },
  {
    slug: "robots-txt-checker",
    title: "robots.txt Checker",
    description: "How to check, validate, and audit a robots.txt file — and the tools to do it.",
  },
];

const BY_SLUG = new Map(EDU_PAGES.map((p) => [p.slug, p]));

export function eduPage(slug: string): EduPageMeta | undefined {
  return BY_SLUG.get(slug);
}

export function eduPath(slug: string): string {
  return `/${slug}`;
}

/** Transactional / programmatic SEO pages (Phase 12C), grouped for the footer + sitemap. */
export type SeoPageGroup = "crawler" | "cms" | "comparison" | "landing" | "hub";

export interface SeoPageMeta {
  readonly slug: string;
  readonly title: string;
  readonly group: SeoPageGroup;
}

/**
 * The transactional SEO cluster. Powers the sitemap and footer so no page is
 * orphaned. Page content lives in each route; this registry is link/index metadata.
 */
export const SEO_PAGES: readonly SeoPageMeta[] = [
  { slug: "ai-crawlers-directory", title: "AI Crawler Directory", group: "hub" },
  // The AI-cluster head guide (Phase 18) — hub priority: it routes to every crawler page.
  { slug: "block-ai-crawlers", title: "How to Block AI Crawlers", group: "hub" },
  // Crawler-specific
  { slug: "gptbot-robots-txt", title: "Block GPTBot in robots.txt", group: "crawler" },
  { slug: "claudebot-robots-txt", title: "Block ClaudeBot in robots.txt", group: "crawler" },
  { slug: "perplexitybot-robots-txt", title: "PerplexityBot in robots.txt", group: "crawler" },
  { slug: "google-extended-robots-txt", title: "Google-Extended in robots.txt", group: "crawler" },
  { slug: "ccbot-robots-txt", title: "Block CCBot in robots.txt", group: "crawler" },
  { slug: "oai-searchbot-robots-txt", title: "OAI-SearchBot in robots.txt", group: "crawler" },
  {
    slug: "claude-searchbot-robots-txt",
    title: "Claude-SearchBot in robots.txt",
    group: "crawler",
  },
  // CMS-specific
  { slug: "wordpress-robots-txt", title: "WordPress robots.txt", group: "cms" },
  { slug: "shopify-robots-txt", title: "Shopify robots.txt", group: "cms" },
  { slug: "magento-robots-txt", title: "Magento robots.txt", group: "cms" },
  { slug: "nextjs-robots-txt", title: "Next.js robots.txt", group: "cms" },
  // Comparisons
  { slug: "robots-txt-vs-noindex", title: "robots.txt vs noindex", group: "comparison" },
  { slug: "robots-txt-vs-sitemap", title: "robots.txt vs sitemap", group: "comparison" },
  // Tool landing pages
  { slug: "robots-txt-generator", title: "Robots.txt Generator", group: "landing" },
  { slug: "robots-txt-validator", title: "Robots.txt Validator", group: "landing" },
  { slug: "robots-txt-analyzer", title: "Robots.txt Analyzer", group: "landing" },
  { slug: "robots-txt-tester", title: "Robots.txt Tester", group: "landing" },
];

export function seoPath(slug: string): string {
  return `/${slug}`;
}
