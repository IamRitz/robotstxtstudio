import type { Metadata } from "next";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "robots.txt vs noindex: Which to Use (and When)",
  description:
    "robots.txt Disallow vs the noindex tag: one controls crawling, the other controls indexing. Why combining them backfires, a decision table, and copy-paste examples.",
  alternates: { canonical: "/robots-txt-vs-noindex" },
};

const page: ContentPage = {
  slug: "robots-txt-vs-noindex",
  h1: "robots.txt vs noindex",
  description:
    "The difference between blocking crawling (robots.txt) and blocking indexing (noindex) — and when to use each.",
  heroCta: "tester",
  lead: (
    <>
      This is the single most consequential robots.txt distinction.{" "}
      <strong className="text-foreground">
        robots.txt controls crawling; noindex controls indexing.
      </strong>{" "}
      They solve different problems, and using the wrong one — or both together — is how pages end
      up stuck in Google with no description.
    </>
  ),
  cta: "analyzer",
  sections: [
    {
      id: "core",
      heading: "Crawling vs indexing",
      blocks: [
        {
          kind: "p",
          content:
            "Crawling is a bot fetching a URL. Indexing is a search engine storing that URL so it can appear in results. robots.txt Disallow stops the fetch. The noindex directive (a meta tag or X-Robots-Tag header) tells engines not to store the page even if they do fetch it. Because they act at different stages, they are not interchangeable.",
        },
        {
          kind: "table",
          head: ["", "robots.txt Disallow", "noindex"],
          rows: [
            ["Acts on", "Crawling (the fetch)", "Indexing (the storage)"],
            ["Where it lives", "/robots.txt", "Meta tag or HTTP header on the page"],
            ["Keeps a page out of Google?", "No — can still be indexed URL-only", "Yes"],
            ["Saves crawl budget?", "Yes", "No (page is still crawled)"],
            ["Right for AI crawlers?", "Yes", "Not respected by most AI bots"],
          ],
        },
      ],
    },
    {
      id: "trap",
      heading: "The trap: blocking and noindex together",
      blocks: [
        {
          kind: "callout",
          status: "blocked",
          title: "Disallow hides your noindex",
          body: "If you Disallow a URL in robots.txt, the crawler never fetches the page — so it never sees the noindex tag. The page can then linger in the index as a bare URL with no snippet. To deindex, you must allow crawling so the noindex can be read.",
        },
        {
          kind: "p",
          content:
            "This is the most common way teams accidentally keep unwanted pages in Google. The fix is counterintuitive: remove the Disallow, keep the noindex, let Google crawl the page once, see the noindex, and drop it.",
        },
        { kind: "cta", tool: "analyzer" },
      ],
    },
    {
      id: "when",
      heading: "Which one should you use?",
      blocks: [
        {
          kind: "list",
          items: [
            "Want a page out of search results → use noindex, and allow crawling so it's seen.",
            "Want to stop crawlers wasting budget on a section (internal search, filters) → use robots.txt Disallow.",
            "Want to keep content out of AI training → use robots.txt Disallow for the AI user-agents (noindex won't help).",
            "Want a page gone immediately and it's sensitive → use authentication or a removal request, not robots.txt.",
          ],
        },
      ],
    },
    {
      id: "examples",
      heading: "Examples",
      blocks: [
        { kind: "p", content: "Deindex a thank-you page (allow crawl, add noindex):" },
        {
          kind: "snippet",
          code: '<!-- In the page <head> -->\n<meta name="robots" content="noindex">',
          caption: "noindex meta tag",
        },
        { kind: "p", content: "Or via HTTP header (good for non-HTML like PDFs):" },
        { kind: "snippet", code: "X-Robots-Tag: noindex", caption: "noindex HTTP header" },
        {
          kind: "p",
          content: "Stop crawlers spending budget on internal search (crawl control, not deindex):",
        },
        {
          kind: "snippet",
          code: "User-agent: *\nDisallow: /search",
          caption: "robots.txt crawl control",
        },
      ],
    },
    {
      id: "mistakes",
      heading: "Common mistakes",
      blocks: [
        {
          kind: "mistakes",
          items: [
            {
              title: "Using Disallow to remove a page from Google",
              body: "It blocks crawling, not indexing. The URL can still appear. Use noindex.",
            },
            {
              title: "Disallowing a page that has noindex",
              body: "Google can't see the noindex if it can't crawl the page. Allow the crawl.",
            },
            {
              title: "Trusting noindex for AI bots",
              body: "Most AI crawlers act on robots.txt, not noindex. Use Disallow for them.",
            },
            {
              title: "Using robots.txt for private data",
              body: "Listed paths are public. Use authentication for anything sensitive.",
            },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What is the difference between robots.txt and noindex?",
      answer:
        "robots.txt Disallow controls crawling — whether a bot fetches a URL. noindex controls indexing — whether a search engine stores the page in its results. robots.txt does not remove pages from Google; noindex does.",
    },
    {
      question: "Should I use robots.txt or noindex to remove a page from Google?",
      answer:
        "Use noindex, and make sure the page is not blocked in robots.txt so Google can crawl it and see the tag. A robots.txt Disallow can actually keep a URL in the index without a description.",
    },
    {
      question: "Why is my noindex page still in Google?",
      answer:
        "Most often because the page is also blocked in robots.txt, so Google never crawls it and never sees the noindex. Remove the Disallow, keep the noindex, and let Google recrawl.",
    },
    {
      question: "Can I use robots.txt and noindex together?",
      answer:
        "Generally no — they conflict. Blocking a page in robots.txt prevents Google from reading its noindex. Use one or the other based on whether your goal is crawl control (robots.txt) or de-indexing (noindex).",
    },
  ],
  related: [
    {
      title: "robots.txt for SEO",
      href: "/robots-txt-seo-guide",
      description: "Best practices in depth.",
    },
    { title: "URL Tester", href: "/url-tester", description: "Check if a page is crawlable." },
    {
      title: "robots.txt and sitemaps",
      href: "/robots-txt-sitemap",
      description: "Restricting vs advertising URLs.",
    },
    {
      title: "Robots.txt Analyzer",
      href: "/analyze",
      description: "Audit crawl rules on a live site.",
    },
  ],
  nextReading: { title: "robots.txt and sitemaps", href: "/robots-txt-sitemap" },
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
