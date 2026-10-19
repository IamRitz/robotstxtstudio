import type { Metadata } from "next";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "Next.js robots.txt: app/robots.ts vs static File",
  description:
    "Add robots.txt to a Next.js app: the App Router robots.ts metadata route vs a static public/robots.txt, dynamic sitemaps, blocking AI crawlers, and common mistakes.",
  alternates: { canonical: "/nextjs-robots-txt" },
};

const page: ContentPage = {
  slug: "nextjs-robots-txt",
  h1: "Next.js robots.txt",
  description:
    "How to add robots.txt to a Next.js app — the robots.ts metadata route vs a static file.",
  heroCta: "validator",
  lead: (
    <>
      Next.js gives you two clean ways to ship robots.txt: a static file in{" "}
      <code className="font-mono text-foreground">public/</code>, or a typed{" "}
      <code className="font-mono text-foreground">app/robots.ts</code> metadata route that generates
      it programmatically. Here&apos;s when to use each, with working code.
    </>
  ),
  cta: "analyzer",
  sections: [
    {
      id: "two-ways",
      heading: "Two ways to serve robots.txt",
      blocks: [
        {
          kind: "p",
          content:
            "A static public/robots.txt is simplest and best when your rules never change. The App Router's app/robots.ts (a MetadataRoute.Robots export) is better when rules depend on the environment, a CMS, or your base URL — it's typed, testable, and keeps the sitemap URL in sync with the rest of your metadata.",
        },
        {
          kind: "table",
          head: ["Approach", "Use when"],
          rows: [
            [
              <code key="a" className="font-mono">
                public/robots.txt
              </code>,
              "Rules are static and simple",
            ],
            [
              <code key="b" className="font-mono">
                app/robots.ts
              </code>,
              "Rules are dynamic, env-aware, or generated",
            ],
          ],
        },
      ],
    },
    {
      id: "robots-ts",
      heading: "The app/robots.ts metadata route",
      blocks: [
        {
          kind: "p",
          content:
            "Export a default function returning a MetadataRoute.Robots object. Next.js serves it at /robots.txt automatically. This is the approach this very site uses.",
        },
        {
          kind: "snippet",
          code: "import type { MetadataRoute } from 'next'\n\nexport default function robots(): MetadataRoute.Robots {\n  return {\n    rules: [\n      { userAgent: '*', allow: '/', disallow: ['/dev', '/api/'] },\n      { userAgent: ['GPTBot', 'CCBot', 'Google-Extended'], disallow: '/' },\n    ],\n    sitemap: 'https://example.com/sitemap.xml',\n    host: 'https://example.com',\n  }\n}",
          caption: "app/robots.ts",
        },
        { kind: "cta", tool: "validator" },
      ],
    },
    {
      id: "static",
      heading: "The static public/robots.txt",
      blocks: [
        {
          kind: "p",
          content:
            "Drop a plain file at public/robots.txt and Next.js serves it verbatim at /robots.txt:",
        },
        {
          kind: "snippet",
          code: "User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: https://example.com/sitemap.xml",
          caption: "public/robots.txt",
        },
        {
          kind: "callout",
          status: "warning",
          title: "Don't do both",
          body: "If both public/robots.txt and app/robots.ts exist, the static file wins and your route is ignored. Pick one.",
        },
      ],
    },
    {
      id: "env",
      heading: "Block crawlers on preview/staging deploys",
      blocks: [
        {
          kind: "p",
          content:
            "A major advantage of app/robots.ts: you can return Disallow: / on preview deployments and the real rules in production, so staging never gets indexed.",
        },
        {
          kind: "snippet",
          code: "export default function robots(): MetadataRoute.Robots {\n  const isProd = process.env.VERCEL_ENV === 'production'\n  return isProd\n    ? { rules: [{ userAgent: '*', allow: '/' }], sitemap: 'https://example.com/sitemap.xml' }\n    : { rules: [{ userAgent: '*', disallow: '/' }] }\n}",
          caption: "Keep preview deploys out of search",
        },
      ],
    },
    {
      id: "mistakes",
      heading: "Common Next.js mistakes",
      blocks: [
        {
          kind: "mistakes",
          items: [
            {
              title: "Shipping a dev Disallow: / to production",
              body: "If you env-gate robots.txt, double-check the production branch returns the allow rules.",
            },
            {
              title: "Having both a static file and robots.ts",
              body: "The static public file silently overrides the route. Keep only one.",
            },
            {
              title: "Hardcoding the wrong host",
              body: "Use an absolute https sitemap URL that matches your canonical domain.",
            },
            {
              title: "Blocking /_next/static",
              body: "That holds your JS and CSS chunks. Blocking it breaks rendering for crawlers.",
            },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: "How do I add robots.txt to a Next.js app?",
      answer:
        "Either place a static file at public/robots.txt, or add app/robots.ts exporting a default function that returns a MetadataRoute.Robots object. Next.js serves either at /robots.txt. Use robots.ts when the rules need to be dynamic.",
    },
    {
      question: "Should I use app/robots.ts or a static file?",
      answer:
        "Use a static public/robots.txt for simple, unchanging rules. Use app/robots.ts when rules depend on the environment (e.g. blocking preview deploys), a CMS, or your base URL — it's typed and generated at build time.",
    },
    {
      question: "Why is my Next.js robots.txt not updating?",
      answer:
        "A static public/robots.txt overrides app/robots.ts. If you have both, the route is ignored. Remove the static file, or edit the file that's actually being served — confirm with the Analyzer.",
    },
    {
      question: "How do I block AI crawlers in Next.js?",
      answer:
        "In app/robots.ts, add a rule with userAgent set to an array like ['GPTBot', 'CCBot', 'Google-Extended'] and disallow '/'. In a static file, add the equivalent User-agent groups.",
    },
  ],
  related: [
    {
      title: "Robots.txt Validator",
      href: "/validate",
      description: "Validate your generated output.",
    },
    {
      title: "robots.txt syntax and format",
      href: "/robots-txt-syntax",
      description: "What correct output looks like.",
    },
    {
      title: "WordPress robots.txt",
      href: "/wordpress-robots-txt",
      description: "The CMS equivalent.",
    },
    {
      title: "AI Crawler Directory",
      href: "/ai-crawlers-directory",
      description: "Which AI bots to block.",
    },
  ],
  nextReading: { title: "robots.txt vs noindex", href: "/robots-txt-vs-noindex" },
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
