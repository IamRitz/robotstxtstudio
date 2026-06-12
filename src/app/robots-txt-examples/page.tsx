import type { Metadata } from "next";
import Link from "next/link";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "robots.txt Examples (Blog, WordPress, Ecommerce, AI)",
  description:
    "Copy-paste robots.txt examples for blogs, WordPress, ecommerce, and blocking AI crawlers like GPTBot and ClaudeBot — with explanations.",
  alternates: { canonical: "/robots-txt-examples" },
};

const page: ContentPage = {
  slug: "robots-txt-examples",
  h1: "robots.txt Examples",
  description:
    "Copy-paste robots.txt examples for common cases: blogs, WordPress, ecommerce, and blocking AI crawlers.",
  lead: (
    <>
      Real, copy-paste robots.txt files for the most common situations. Adapt the domain and paths
      to your site, then validate before deploying. Every example explains what it does and why.
    </>
  ),
  cta: "generator",
  sections: [
    {
      id: "allow-all",
      heading: "Allow everything (safe default)",
      blocks: [
        {
          kind: "p",
          content: "The simplest useful file: let every crawler in and point to your sitemap.",
        },
        {
          kind: "snippet",
          code: "User-agent: *\nAllow: /\n\nSitemap: https://example.com/sitemap.xml",
        },
      ],
    },
    {
      id: "block-all",
      heading: "Block everything (staging sites)",
      blocks: [
        {
          kind: "p",
          content:
            "Useful on staging or pre-launch sites. Remove it before going live, or you'll stay out of search.",
        },
        { kind: "snippet", code: "User-agent: *\nDisallow: /" },
        {
          kind: "callout",
          status: "warning",
          title: "The most expensive typo in SEO",
          body: "A leftover Disallow: / from staging is the #1 cause of accidental deindexing. Double-check production never ships this.",
        },
      ],
    },
    {
      id: "blog",
      heading: "Blog",
      blocks: [
        {
          kind: "p",
          content:
            "Let crawlers index posts, but keep internal search results and tag/author archives out of the index path.",
        },
        {
          kind: "snippet",
          code: "User-agent: *\nAllow: /\nDisallow: /search\nDisallow: /*?s=\n\nSitemap: https://example.com/sitemap.xml",
          caption: "Blog robots.txt",
        },
      ],
    },
    {
      id: "wordpress",
      heading: "WordPress",
      blocks: [
        {
          kind: "p",
          content:
            "Block the admin area but allow admin-ajax.php (themes and plugins need it). Don't block /wp-content/ — Google needs CSS and JS to render pages.",
        },
        {
          kind: "snippet",
          code: "User-agent: *\nDisallow: /wp-admin/\nAllow: /wp-admin/admin-ajax.php\n\nSitemap: https://example.com/wp-sitemap.xml",
          caption: "WordPress robots.txt",
        },
      ],
    },
    {
      id: "ecommerce",
      heading: "Ecommerce",
      blocks: [
        {
          kind: "p",
          content:
            "Keep carts, checkout, accounts, and faceted filter URLs out of crawling to protect crawl budget and avoid duplicate content.",
        },
        {
          kind: "snippet",
          code: "User-agent: *\nAllow: /\nDisallow: /cart/\nDisallow: /checkout/\nDisallow: /account/\nDisallow: /*?sort=\nDisallow: /*?filter=\n\nSitemap: https://example.com/sitemap.xml",
          caption: "Ecommerce robots.txt",
        },
      ],
    },
    {
      id: "ai",
      heading: "Block AI crawlers",
      blocks: [
        {
          kind: "p",
          content:
            "Keep your content out of AI training datasets while staying fully visible in search. This blocks the major AI crawlers and leaves Googlebot/Bingbot untouched.",
        },
        {
          kind: "snippet",
          code: "User-agent: GPTBot\nUser-agent: ClaudeBot\nUser-agent: CCBot\nUser-agent: Google-Extended\nUser-agent: PerplexityBot\nDisallow: /\n\nUser-agent: *\nAllow: /\n\nSitemap: https://example.com/sitemap.xml",
          caption: "Block AI training crawlers",
        },
        {
          kind: "p",
          content: (
            <>
              Want per-crawler control with explanations of what each bot does? Use the{" "}
              <Link href="/ai-crawlers" className="text-brand hover:underline">
                AI Crawler Manager
              </Link>
              , or read the full guide:{" "}
              <Link href="/block-ai-crawlers" className="text-brand hover:underline">
                How to Block AI Crawlers
              </Link>
              .
            </>
          ),
        },
      ],
    },
    {
      id: "mistakes",
      heading: "Before you copy-paste",
      blocks: [
        {
          kind: "mistakes",
          items: [
            {
              title: "Forgetting to change the domain",
              body: "Update the Sitemap URL to your real domain — a placeholder sitemap helps no one.",
            },
            {
              title: "Blocking assets",
              body: "Never Disallow /wp-content/, CSS, or JS; it breaks Google's rendering.",
            },
            {
              title: "Shipping the staging file",
              body: "Confirm production doesn't contain Disallow: / from a staging template.",
            },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What is a good default robots.txt?",
      answer:
        "User-agent: * with Allow: / and a Sitemap line. It lets everything be crawled and tells search engines where your sitemap is — a safe baseline for most sites.",
    },
    {
      question: "How do I block all crawlers?",
      answer:
        "Use User-agent: * followed by Disallow: /. This is appropriate for staging sites but will remove a live site from search, so use it carefully.",
    },
    {
      question: "How do I allow everything?",
      answer:
        "Either omit robots.txt entirely, or use User-agent: * with Disallow: (empty) or Allow: /. All three mean “crawl anything.”",
    },
    {
      question: "How do I block AI crawlers like GPTBot?",
      answer:
        "Add a group listing the AI user-agents (GPTBot, ClaudeBot, CCBot, Google-Extended, PerplexityBot) with Disallow: /. This keeps them out without affecting search engines.",
    },
  ],
  related: [
    {
      title: "Robots.txt Generator",
      href: "/generate",
      description: "Build these files with toggles.",
    },
    {
      title: "AI Crawler Manager",
      href: "/ai-crawlers",
      description: "Block AI bots with one click.",
    },
    {
      title: "robots.txt syntax",
      href: "/robots-txt-syntax",
      description: "Understand each directive.",
    },
  ],
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
