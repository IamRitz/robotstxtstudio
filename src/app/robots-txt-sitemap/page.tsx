import type { Metadata } from "next";
import Link from "next/link";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "How to Add a Sitemap to robots.txt",
  description:
    "How to reference your XML sitemap from robots.txt correctly — absolute URLs, multiple sitemaps, sitemap index files, and common mistakes.",
  alternates: { canonical: "/robots-txt-sitemap" },
};

const page: ContentPage = {
  slug: "robots-txt-sitemap",
  h1: "robots.txt Sitemap",
  description: "How to reference your XML sitemap from robots.txt the right way.",
  lead: (
    <>
      The <code className="font-mono text-foreground">Sitemap</code> directive tells crawlers where
      your XML sitemap lives. It's the easiest win in a robots.txt file — and one of the most common
      to get slightly wrong with a relative URL.
    </>
  ),
  cta: "generator",
  sections: [
    {
      id: "basics",
      heading: "The Sitemap directive",
      blocks: [
        {
          kind: "p",
          content:
            "Sitemap is a file-level directive: it isn't tied to any User-agent group and can appear anywhere in the file. It must be a full, absolute URL.",
        },
        { kind: "snippet", code: "Sitemap: https://example.com/sitemap.xml", caption: "Correct: absolute URL" },
        {
          kind: "callout",
          status: "blocked",
          title: "Relative URLs are invalid",
          body: "Sitemap: /sitemap.xml is ignored. The directive requires the full https://... URL, including the protocol and host.",
        },
      ],
    },
    {
      id: "multiple",
      heading: "Multiple sitemaps",
      blocks: [
        {
          kind: "p",
          content:
            "You can list as many sitemaps as you like — one per line. Large sites often split sitemaps by section or content type.",
        },
        { kind: "snippet", code: "Sitemap: https://example.com/sitemap-pages.xml\nSitemap: https://example.com/sitemap-products.xml\nSitemap: https://example.com/sitemap-blog.xml" },
      ],
    },
    {
      id: "index",
      heading: "Sitemap index files",
      blocks: [
        {
          kind: "p",
          content:
            "If you have many sitemaps, reference a single sitemap index instead — it links to the individual sitemaps, keeping robots.txt clean.",
        },
        { kind: "snippet", code: "Sitemap: https://example.com/sitemap_index.xml" },
      ],
    },
    {
      id: "placement",
      heading: "Where to put it",
      blocks: [
        {
          kind: "p",
          content:
            "Anywhere works, but most teams put Sitemap lines at the very top or very bottom of the file for readability. Order has no effect on behavior.",
        },
        {
          kind: "snippet",
          code: "User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: https://example.com/sitemap.xml",
        },
        {
          kind: "p",
          content: (
            <>
              The{" "}
              <Link href="/generate" className="text-brand hover:underline">
                Generator
              </Link>{" "}
              adds and positions the Sitemap line for you, and the{" "}
              <Link href="/validate" className="text-brand hover:underline">
                Validator
              </Link>{" "}
              warns if it's missing or uses http instead of https.
            </>
          ),
        },
      ],
    },
    {
      id: "mistakes",
      heading: "Common sitemap mistakes",
      blocks: [
        {
          kind: "mistakes",
          items: [
            { title: "Relative path", body: "Use the absolute URL, not /sitemap.xml." },
            { title: "http on an https site", body: "Match your canonical protocol — declare the https:// sitemap URL." },
            { title: "Sitemap as the only submission method", body: "robots.txt discovery is passive; also submit your sitemap in Google Search Console for reporting." },
            { title: "Pointing to a 404", body: "Make sure the sitemap URL actually resolves before referencing it." },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Can I list multiple sitemaps in robots.txt?",
      answer: "Yes. Add one Sitemap line per sitemap. For many sitemaps, reference a single sitemap index file that links to the rest.",
    },
    {
      question: "Does the Sitemap line need to be a full URL?",
      answer: "Yes. It must be an absolute URL including protocol and host (https://example.com/sitemap.xml). Relative paths are ignored.",
    },
    {
      question: "Where should the Sitemap line go in robots.txt?",
      answer: "Anywhere — it's file-level and not part of any group. Top or bottom of the file is conventional for readability.",
    },
    {
      question: "Is robots.txt the only way to submit a sitemap?",
      answer: "No. The Sitemap directive helps crawlers discover it passively, but you should also submit your sitemap directly in Google Search Console and Bing Webmaster Tools.",
    },
  ],
  related: [
    { title: "Robots.txt Generator", href: "/generate", description: "Add a sitemap automatically." },
    { title: "robots.txt format", href: "/robots-txt-format", description: "Where file-level directives go." },
    { title: "robots.txt for SEO", href: "/robots-txt-seo-guide", description: "Sitemaps in your SEO workflow." },
  ],
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
