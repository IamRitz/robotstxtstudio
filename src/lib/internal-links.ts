/**
 * Internal-linking engine (Phase 12D).
 *
 * Derives related links from the content registries so cross-links are computed and
 * stay consistent as pages are added — instead of being hand-curated on every page.
 * Used by the tool-page "Related guides" rail to give the otherwise dead-ending tool
 * screens contextual links into the educational + transactional clusters and to
 * sibling tools.
 */
import type { Route } from "next";
import { EDU_PAGES, eduPath, TOOLS, type ToolId } from "@/config/content";

export interface LinkItem {
  readonly title: string;
  readonly href: Route;
  readonly description?: string;
}

/** Guide slugs most relevant to each tool (educational + transactional clusters). */
const TOOL_GUIDE_LINKS: Record<ToolId, readonly LinkItem[]> = {
  generator: [
    {
      title: "robots.txt Examples",
      href: "/robots-txt-examples",
      description: "Copy-paste starting points.",
    },
    {
      title: "robots.txt Templates",
      href: "/robots-txt-templates",
      description: "Ready-made files by site type.",
    },
    {
      title: "robots.txt Syntax",
      href: "/robots-txt-syntax",
      description: "Every directive explained.",
    },
  ],
  validator: [
    {
      title: "robots.txt Checker",
      href: "/robots-txt-checker",
      description: "How to audit a robots.txt file.",
    },
    {
      title: "robots.txt Syntax",
      href: "/robots-txt-syntax",
      description: "Spot invalid directives.",
    },
    {
      title: "robots.txt Glossary",
      href: "/robots-txt-glossary",
      description: "Look up any term.",
    },
  ],
  analyzer: [
    {
      title: "How to Find robots.txt",
      href: "/how-to-find-robots-txt",
      description: "Locate any site's file.",
    },
    {
      title: "Why robots.txt Is Important",
      href: "/why-robots-txt-is-important",
      description: "What an audit protects.",
    },
    {
      title: "AI Crawler Directory",
      href: "/ai-crawlers-directory",
      description: "Who's crawling your site.",
    },
  ],
  tester: [
    {
      title: "How Does robots.txt Work?",
      href: "/how-does-robots-txt-work",
      description: "Group selection & precedence.",
    },
    {
      title: "How to Read robots.txt",
      href: "/how-to-read-robots-txt",
      description: "Read rules line by line.",
    },
    {
      title: "robots.txt Syntax",
      href: "/robots-txt-syntax",
      description: "Wildcards and anchors.",
    },
  ],
  "ai-manager": [
    {
      title: "AI Crawler Directory",
      href: "/ai-crawlers-directory",
      description: "Every AI crawler compared.",
    },
    {
      title: "How to Block AI Crawlers",
      href: "/block-ai-crawlers",
      description: "The complete blocking playbook.",
    },
    {
      title: "Block GPTBot",
      href: "/gptbot-robots-txt",
      description: "OpenAI's training crawler.",
    },
  ],
  explainer: [
    {
      title: "How to Read robots.txt",
      href: "/how-to-read-robots-txt",
      description: "Understand any file.",
    },
    {
      title: "robots.txt Syntax",
      href: "/robots-txt-syntax",
      description: "What each line means.",
    },
    {
      title: "robots.txt Glossary",
      href: "/robots-txt-glossary",
      description: "Definitions for every term.",
    },
  ],
};

/** Sibling tools (everything except the current tool), computed from the registry. */
export function siblingTools(current: ToolId, limit = 3): LinkItem[] {
  return (Object.keys(TOOLS) as ToolId[])
    .filter((id) => id !== current)
    .map((id) => ({
      title: TOOLS[id].title,
      href: TOOLS[id].href,
      description: TOOLS[id].description,
    }))
    .slice(0, limit);
}

/** Guides + cluster pages relevant to a tool. */
export function toolGuides(current: ToolId): readonly LinkItem[] {
  return TOOL_GUIDE_LINKS[current];
}

/** A small "learn the basics" set, used as a fallback / footer of rails. */
export function starterGuides(limit = 3): LinkItem[] {
  return EDU_PAGES.slice(0, limit).map((p) => ({
    title: p.title,
    href: eduPath(p.slug) as Route,
    description: p.description,
  }));
}
