import type { Metadata } from "next";
import Link from "next/link";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "robots.txt for SEO: Best Practices",
  description:
    "How to use robots.txt in technical SEO without hurting indexing: robots.txt vs noindex, crawl budget, assets, and a pre-deploy checklist.",
  alternates: { canonical: "/robots-txt-seo-guide" },
};

const page: ContentPage = {
  slug: "robots-txt-seo-guide",
  h1: "robots.txt for SEO: Best Practices",
  description: "Best practices for using robots.txt in technical SEO without hurting indexing.",
  lead: (
    <>
      robots.txt is a precision instrument in technical SEO — powerful for crawl control, dangerous
      when misused for indexing. This guide covers the practices that help, the traps that hurt, and
      a checklist to run before every deploy.
    </>
  ),
  cta: "analyzer",
  sections: [
    {
      id: "crawl-vs-index",
      heading: "Crawling vs indexing — the core distinction",
      blocks: [
        {
          kind: "p",
          content:
            "This is the most important concept in robots.txt SEO. robots.txt controls crawling (whether a bot fetches a URL). It does not control indexing (whether a URL appears in results).",
        },
        {
          kind: "callout",
          status: "warning",
          title: "Disallow does not equal noindex",
          body: "A disallowed URL can still rank — as a bare link with no description — if other pages point to it. Worse, because Google can't crawl it, it can't see a noindex tag on that page.",
        },
        {
          kind: "table",
          head: ["Goal", "Use"],
          rows: [
            ["Stop a page appearing in Google", <span key="a">noindex meta tag / X-Robots-Tag (allow crawling)</span>],
            ["Stop crawlers fetching a section", <span key="b">robots.txt Disallow</span>],
            ["Keep content out of AI datasets", <span key="c">robots.txt Disallow for AI user-agents</span>],
          ],
        },
      ],
    },
    {
      id: "best-practices",
      heading: "Best practices that help SEO",
      blocks: [
        {
          kind: "list",
          items: [
            "Disallow infinite/low-value URL spaces: internal search, faceted filters, session parameters.",
            "Always declare your sitemap with an absolute https URL.",
            "Keep crawler-specific groups (e.g. AI bots) explicit so policy is intentional, not inherited.",
            "Re-audit after migrations and CMS changes — replatforming often regenerates robots.txt.",
            "Prefer canonical tags and parameter handling for duplicate content; use robots.txt for crawl-budget control.",
          ],
        },
      ],
    },
    {
      id: "antipatterns",
      heading: "Anti-patterns that hurt SEO",
      blocks: [
        {
          kind: "mistakes",
          items: [
            { title: "Blocking CSS and JavaScript", body: "Google renders pages to evaluate them. Disallowing assets produces broken renders and can lower rankings." },
            { title: "Using Disallow to remove pages", body: "It prevents crawling, not indexing — and blocks Google from seeing your noindex. Allow crawling + noindex instead." },
            { title: "Blocking pages that have inbound links", body: "They can still appear as URL-only results. Use noindex." },
            { title: "Leaving Disallow: / in production", body: "The classic staging leak that deindexes a whole site." },
          ],
        },
      ],
    },
    {
      id: "ai-seo",
      heading: "AI crawlers and SEO are separate decisions",
      blocks: [
        {
          kind: "p",
          content:
            "Blocking GPTBot or Google-Extended has no effect on your Google Search ranking — those are distinct from Googlebot. You can fully opt out of AI training while remaining 100% visible in search.",
        },
        {
          kind: "p",
          content: (
            <>
              See{" "}
              <Link href="/why-robots-txt-is-important" className="text-brand hover:underline">
                why robots.txt is important
              </Link>{" "}
              for the strategic view, and manage it in the{" "}
              <Link href="/ai-crawlers" className="text-brand hover:underline">
                AI Crawler Manager
              </Link>
              .
            </>
          ),
        },
      ],
    },
    {
      id: "checklist",
      heading: "Pre-deploy checklist",
      blocks: [
        {
          kind: "list",
          ordered: true,
          items: [
            "No accidental Disallow: / in the production file.",
            "CSS/JS and image directories are crawlable.",
            "Sitemap line present, absolute, https, and resolves.",
            "AI crawler policy is intentional (explicit allow or block).",
            "Validated for syntax, then spot-tested on 2–3 real URLs.",
          ],
        },
        {
          kind: "p",
          content: (
            <>
              Run the live file through the{" "}
              <Link href="/analyze" className="text-brand hover:underline">
                Analyzer
              </Link>{" "}
              for a health score and findings, and verify key URLs in the{" "}
              <Link href="/url-tester" className="text-brand hover:underline">
                URL Tester
              </Link>
              .
            </>
          ),
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Should I block a page with robots.txt or noindex?",
      answer:
        "If you want it out of Google, use noindex and let Google crawl the page so it can see the tag. Use robots.txt Disallow only when you want to prevent crawling (e.g. crawl-budget control or AI bots), not to control indexing.",
    },
    {
      question: "Does Disallow remove a page from Google?",
      answer:
        "No. It stops crawling, but the URL can still be indexed without content if it's linked elsewhere. To remove it, allow crawling and add noindex, or use a removal request.",
    },
    {
      question: "Should I disallow CSS and JavaScript?",
      answer: "No. Google needs to render pages with their CSS and JS. Blocking assets leads to incomplete rendering and can harm rankings.",
    },
    {
      question: "Is robots.txt good or bad for SEO?",
      answer:
        "It's good when used for crawl control and neutral-to-helpful for rankings. It becomes bad only when misused — for example, blocking assets or using Disallow where noindex is needed.",
    },
  ],
  related: [
    { title: "Why robots.txt is important", href: "/why-robots-txt-is-important", description: "The strategic case." },
    { title: "Robots.txt Analyzer", href: "/analyze", description: "Score and audit a live file." },
    { title: "robots.txt checker", href: "/robots-txt-checker", description: "Validate before you ship." },
  ],
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
