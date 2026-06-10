import type { Metadata } from "next";
import Link from "next/link";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "Why robots.txt Is Important (and When to Use It)",
  description:
    "Why robots.txt matters for SEO, crawl budget, and AI access — what it protects, the risks of getting it wrong, and when you actually need one.",
  alternates: { canonical: "/why-robots-txt-is-important" },
};

const page: ContentPage = {
  slug: "why-robots-txt-is-important",
  h1: "Why robots.txt Is Important",
  description:
    "Why robots.txt matters for crawl budget, SEO, and AI access — and the risks of getting it wrong.",
  lead: (
    <>
      robots.txt is a tiny file with outsized impact. Done well, it focuses crawlers on what matters
      and keeps your content out of AI datasets. Done badly, it can quietly remove your entire site
      from search. Here's why it deserves attention.
    </>
  ),
  cta: "generator",
  sections: [
    {
      id: "crawl-budget",
      heading: "It protects your crawl budget",
      blocks: [
        {
          kind: "p",
          content:
            "Search engines allocate a finite amount of crawling to each site. On large sites, letting crawlers waste that budget on internal search results, faceted filters, and infinite calendars means your important pages get crawled less often.",
        },
        {
          kind: "list",
          items: [
            "Block low-value, near-infinite URL spaces (e.g. /*?sort=, /search).",
            "Keep crawlers focused on canonical, indexable content.",
            "Smaller sites rarely hit crawl-budget limits — this matters most at scale.",
          ],
        },
      ],
    },
    {
      id: "ai",
      heading: "It controls AI access to your content",
      blocks: [
        {
          kind: "p",
          content:
            "The fastest-growing reason to maintain robots.txt is AI. GPTBot, ClaudeBot, CCBot, Google-Extended, and PerplexityBot all check robots.txt. It's currently the primary lever for deciding whether your content trains models or appears in AI answers — without touching your search visibility.",
        },
        {
          kind: "p",
          content: (
            <>
              The{" "}
              <Link href="/ai-crawlers" className="text-brand hover:underline">
                AI Crawler Manager
              </Link>{" "}
              makes this a one-click decision per crawler, with an explanation of what each bot does.
            </>
          ),
        },
      ],
    },
    {
      id: "risk",
      heading: "The risk of getting it wrong",
      blocks: [
        {
          kind: "callout",
          status: "blocked",
          title: "One line can deindex a site",
          body: "A stray Disallow: / — often left over from a staging environment — tells every crawler to skip your entire site. It's the single most common catastrophic SEO mistake.",
        },
        {
          kind: "p",
          content:
            "Because robots.txt failures are silent (nothing errors; traffic just drops), they often go unnoticed for weeks. That's why validating and testing before deploy is non-negotiable.",
        },
        {
          kind: "p",
          content: (
            <>
              Audit any live site in seconds with the{" "}
              <Link href="/analyze" className="text-brand hover:underline">
                Analyzer
              </Link>
              , and confirm a critical URL behaves as expected in the{" "}
              <Link href="/url-tester" className="text-brand hover:underline">
                URL Tester
              </Link>
              .
            </>
          ),
        },
      ],
    },
    {
      id: "when",
      heading: "When you actually need one",
      blocks: [
        {
          kind: "list",
          items: [
            "You want to keep AI crawlers out of your content.",
            "You have sections worth excluding from crawling (admin, internal search, faceted URLs).",
            "You want to advertise your sitemap location to crawlers.",
            "You run a large site where crawl budget matters.",
          ],
        },
        {
          kind: "callout",
          status: "info",
          title: "When you can skip it",
          body: "A small brochure site that wants everything crawled doesn't strictly need robots.txt — but adding one with just a sitemap line is still good practice.",
        },
      ],
    },
    {
      id: "mistakes",
      heading: "High-stakes mistakes",
      blocks: [
        {
          kind: "mistakes",
          items: [
            { title: "Using it for privacy", body: "Listed paths are public. Protect sensitive URLs with authentication, not Disallow." },
            { title: "Blocking to deindex", body: "Disallow doesn't remove indexed pages. Use noindex for that." },
            { title: "Never re-checking", body: "Re-audit after migrations, replatforming, or CMS updates that can regenerate robots.txt." },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: "When should you use a robots.txt file?",
      answer:
        "Use one when you want to block AI crawlers, exclude low-value sections from crawling, declare your sitemap, or manage crawl budget on a large site. If you want everything crawled and have no sitemap to advertise, it's optional.",
    },
    {
      question: "Can robots.txt improve SEO?",
      answer:
        "Indirectly. It doesn't boost rankings, but it focuses crawl budget on valuable pages and prevents crawlers wasting time on duplicate or infinite URLs, which helps important pages get crawled and refreshed.",
    },
    {
      question: "Can a bad robots.txt hurt my rankings?",
      answer:
        "Yes — significantly. An over-broad Disallow can stop your pages from being crawled and refreshed, and a leftover Disallow: / can remove the whole site from search. Always validate and test before deploying.",
    },
    {
      question: "Does robots.txt affect crawl budget?",
      answer:
        "Yes. Disallowing low-value URL patterns stops crawlers spending budget on them, leaving more for your important pages. This matters most on large sites with many parameterized URLs.",
    },
  ],
  related: [
    { title: "robots.txt for SEO", href: "/robots-txt-seo-guide", description: "Best practices in depth." },
    { title: "AI Crawler Manager", href: "/ai-crawlers", description: "Control AI access." },
    { title: "Robots.txt Analyzer", href: "/analyze", description: "Audit a live site." },
  ],
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
