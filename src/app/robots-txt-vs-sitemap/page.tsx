import type { Metadata } from "next";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "robots.txt vs sitemap: What's the Difference?",
  description:
    "robots.txt restricts crawling; an XML sitemap suggests what to crawl. How they work together, why you need both, where the Sitemap directive fits, and examples.",
  alternates: { canonical: "/robots-txt-vs-sitemap" },
};

const page: ContentPage = {
  slug: "robots-txt-vs-sitemap",
  h1: "robots.txt vs sitemap",
  description:
    "How robots.txt and XML sitemaps differ, why you need both, and how they reference each other.",
  heroCta: "generator",
  lead: (
    <>
      They&apos;re often mentioned together, but they do opposite jobs.{" "}
      <strong className="text-foreground">
        robots.txt restricts what crawlers may fetch; a sitemap suggests what they should fetch.
      </strong>{" "}
      One is a gate, the other is a map — and they work best together.
    </>
  ),
  cta: "validator",
  sections: [
    {
      id: "core",
      heading: "Restriction vs suggestion",
      blocks: [
        {
          kind: "p",
          content:
            "robots.txt is a set of rules at /robots.txt telling crawlers which paths they may or may not request. An XML sitemap is a list of URLs you want crawled and indexed, with optional metadata like last-modified dates. robots.txt removes URLs from consideration; a sitemap adds them. They aren't alternatives — most sites need both.",
        },
        {
          kind: "table",
          head: ["", "robots.txt", "XML sitemap"],
          rows: [
            ["Purpose", "Restrict crawling", "Advertise URLs to crawl"],
            ["Format", "Plain text directives", "XML list of URLs"],
            ["Location", "/robots.txt (fixed)", "Any URL, e.g. /sitemap.xml"],
            ["Effect", "Blocks/allows fetching", "Hints at discovery & freshness"],
            ["Guarantees indexing?", "No", "No — it's a suggestion"],
          ],
        },
      ],
    },
    {
      id: "together",
      heading: "How they work together",
      blocks: [
        {
          kind: "p",
          content:
            "robots.txt can advertise your sitemap with a Sitemap directive, so crawlers discover it without you submitting anything. This is the one place the two files directly connect.",
        },
        {
          kind: "snippet",
          code: "User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: https://example.com/sitemap.xml",
          caption: "robots.txt that points to the sitemap",
        },
        {
          kind: "callout",
          status: "warning",
          title: "Don't contradict yourself",
          body: "Don't list a URL in your sitemap that your robots.txt blocks. It sends a mixed signal — 'crawl this' and 'don't crawl this' — and wastes crawler trust. Keep them consistent.",
        },
        { kind: "cta", tool: "analyzer" },
      ],
    },
    {
      id: "need-both",
      heading: "Why you usually need both",
      blocks: [
        {
          kind: "list",
          items: [
            "robots.txt alone tells crawlers what to avoid, but not what's important — large or new sites get discovered slowly without a sitemap.",
            "A sitemap alone can't stop crawlers wasting budget on internal search, filters, or admin URLs.",
            "Together: the sitemap focuses crawlers on your best URLs; robots.txt keeps them off the noise.",
          ],
        },
      ],
    },
    {
      id: "examples",
      heading: "Examples",
      blocks: [
        {
          kind: "p",
          content: "The Sitemap directive must be an absolute URL — relative paths are ignored:",
        },
        {
          kind: "snippet",
          code: "Sitemap: https://example.com/sitemap.xml",
          caption: "Correct: absolute URL",
        },
        { kind: "p", content: "Multiple sitemaps (or a sitemap index) are fine — one per line:" },
        {
          kind: "snippet",
          code: "Sitemap: https://example.com/sitemap-pages.xml\nSitemap: https://example.com/sitemap-blog.xml",
          caption: "Multiple sitemaps",
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
              title: "Thinking you must choose one",
              body: "They're complementary. Most sites benefit from both a robots.txt and a sitemap.",
            },
            {
              title: "Listing blocked URLs in the sitemap",
              body: "Don't include URLs your robots.txt disallows — it's contradictory.",
            },
            {
              title: "A relative Sitemap directive",
              body: "Sitemap: /sitemap.xml is invalid. Use the full https URL.",
            },
            {
              title: "Sitemap-only submission",
              body: "The directive aids discovery, but also submit your sitemap in Search Console for reporting.",
            },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What is the difference between robots.txt and a sitemap?",
      answer:
        "robots.txt restricts which URLs crawlers may fetch; an XML sitemap lists the URLs you want them to fetch and index. robots.txt is a gate, a sitemap is a map. They serve opposite but complementary roles.",
    },
    {
      question: "Do I need both robots.txt and a sitemap?",
      answer:
        "Usually yes. A sitemap helps crawlers discover and prioritize your important pages, while robots.txt keeps them off low-value or private sections. Together they make crawling efficient.",
    },
    {
      question: "Should the sitemap go in robots.txt?",
      answer:
        "Adding a Sitemap directive to robots.txt is recommended — it lets crawlers discover your sitemap automatically. It must be an absolute https URL, and you can list more than one.",
    },
    {
      question: "Can robots.txt and the sitemap conflict?",
      answer:
        "Yes. If your sitemap lists URLs that robots.txt blocks, you send crawlers a contradictory signal. Keep them consistent: don't advertise URLs you've disallowed.",
    },
  ],
  related: [
    {
      title: "robots.txt sitemap directive",
      href: "/robots-txt-sitemap",
      description: "How to reference a sitemap.",
    },
    {
      title: "robots.txt vs noindex",
      href: "/robots-txt-vs-noindex",
      description: "Crawling vs indexing.",
    },
    {
      title: "Robots.txt Generator",
      href: "/generate",
      description: "Add a sitemap line automatically.",
    },
    {
      title: "Robots.txt Validator",
      href: "/validate",
      description: "Check the Sitemap line is valid.",
    },
  ],
  nextReading: { title: "Robots.txt Generator", href: "/robots-txt-generator" },
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
