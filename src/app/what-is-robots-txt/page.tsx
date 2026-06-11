import type { Metadata } from "next";
import Link from "next/link";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "What Is robots.txt? A Plain-English Guide",
  description:
    "What a robots.txt file is, what it does (and doesn't do), and how it controls which crawlers can access your website — with examples.",
  alternates: { canonical: "/what-is-robots-txt" },
};

const page: ContentPage = {
  slug: "what-is-robots-txt",
  h1: "What Is robots.txt?",
  description:
    "What a robots.txt file is, what it does, and what it doesn't do — explained for developers, marketers, and site owners.",
  lead: (
    <>
      <code className="font-mono text-foreground">robots.txt</code> is a plain-text file at the root
      of your domain that tells web crawlers which parts of your site they may request. It is the
      first thing search engines and AI bots look for before crawling — and one of the easiest files
      to get subtly wrong.
    </>
  ),
  cta: "generator",
  sections: [
    {
      id: "definition",
      heading: "The short definition",
      blocks: [
        {
          kind: "p",
          content:
            "A robots.txt file is a set of instructions for automated clients (crawlers, bots, spiders). It lives at one fixed location — the root of your domain — and uses a simple, line-based format defined by the Robots Exclusion Protocol (standardized in 2022 as RFC 9309).",
        },
        {
          kind: "snippet",
          code: "User-agent: *\nDisallow: /admin/\nAllow: /\n\nSitemap: https://example.com/sitemap.xml",
          caption: "A minimal robots.txt",
        },
        {
          kind: "p",
          content:
            "In plain English, that file says: “every crawler may access the whole site, except anything under /admin/, and the sitemap is over here.”",
        },
      ],
    },
    {
      id: "what-it-does",
      heading: "What robots.txt actually controls",
      blocks: [
        {
          kind: "p",
          content:
            "robots.txt controls crawling — whether a well-behaved bot will request a URL. That's it. It is an access-management file, not a security or privacy mechanism.",
        },
        {
          kind: "list",
          items: [
            "Tell search engines which directories to skip (e.g. internal search, faceted filters, admin areas).",
            "Point crawlers to your XML sitemap.",
            "Allow or block AI crawlers like GPTBot, ClaudeBot, and PerplexityBot.",
            "Reduce wasted crawling on low-value URLs (helping crawl budget on large sites).",
          ],
        },
      ],
    },
    {
      id: "what-it-doesnt",
      heading: "What robots.txt does NOT do",
      blocks: [
        {
          kind: "callout",
          status: "warning",
          title: "robots.txt is not a security control",
          body: "Anyone can read your robots.txt, and listing a path there advertises it. Never use Disallow to “hide” private URLs — protect them with authentication instead.",
        },
        {
          kind: "list",
          items: [
            "It does not guarantee a page stays out of Google. A disallowed URL can still be indexed (without its content) if other pages link to it. Use a noindex meta tag or header to keep pages out of the index.",
            "It does not stop malicious bots. Disreputable scrapers simply ignore it.",
            "It does not remove already-indexed pages by itself.",
          ],
        },
        {
          kind: "p",
          content: (
            <>
              This distinction trips up almost everyone. If your goal is to keep a page out of
              search results, see our{" "}
              <Link href="/robots-txt-seo-guide" className="text-brand hover:underline">
                robots.txt for SEO guide
              </Link>
              , which covers when to use robots.txt versus{" "}
              <code className="font-mono">noindex</code>.
            </>
          ),
        },
      ],
    },
    {
      id: "anatomy",
      heading: "The anatomy of a rule",
      blocks: [
        {
          kind: "p",
          content:
            "robots.txt is organized into groups. Each group starts with one or more User-agent lines (which crawler the rules apply to) followed by Allow and Disallow rules (which paths).",
        },
        {
          kind: "snippet",
          code: "User-agent: Googlebot\nDisallow: /private/\n\nUser-agent: GPTBot\nDisallow: /",
          caption: "Two groups: one for Googlebot, one for GPTBot",
        },
        {
          kind: "p",
          content: (
            <>
              For a directive-by-directive reference, read{" "}
              <Link href="/robots-txt-syntax" className="text-brand hover:underline">
                robots.txt syntax
              </Link>
              . To see exactly how a crawler chooses which group applies, read{" "}
              <Link href="/how-does-robots-txt-work" className="text-brand hover:underline">
                how robots.txt works
              </Link>
              .
            </>
          ),
        },
      ],
    },
    {
      id: "mistakes",
      heading: "Common misconceptions",
      blocks: [
        {
          kind: "mistakes",
          items: [
            {
              title: "“Disallow hides my page from Google.”",
              body: "It blocks crawling, not indexing. Use noindex to remove a page from results.",
            },
            {
              title: "“I need robots.txt for security.”",
              body: "It's public and advisory. Use authentication for anything sensitive.",
            },
            {
              title: "“Blocking CSS/JS speeds up my site.”",
              body: "Disallowing assets stops Google from rendering your pages correctly and can hurt rankings.",
            },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Does every website need a robots.txt file?",
      answer:
        "No. If you're happy for crawlers to access everything, you can omit it — a missing robots.txt is treated as “allow all.” But most sites benefit from one to declare a sitemap and control AI crawlers.",
    },
    {
      question: "What happens if I don't have a robots.txt file?",
      answer:
        "Crawlers receive a 404 and assume they may crawl the entire site. Nothing breaks, but you lose the chance to point them to your sitemap or restrict low-value paths.",
    },
    {
      question: "Is robots.txt the same as a robots meta tag?",
      answer:
        "No. robots.txt controls crawling at the site level (in a file). The robots meta tag (and X-Robots-Tag header) controls indexing at the page level. To keep a page out of Google, use the meta tag, not robots.txt.",
    },
    {
      question: "Where is the robots.txt file located?",
      answer:
        "Always at the root of the host: https://example.com/robots.txt. A robots.txt in a subdirectory is ignored. Each subdomain needs its own.",
    },
  ],
  related: [
    {
      title: "The robots.txt file",
      href: "/robots-txt-file",
      description: "Where it lives and what goes in it.",
    },
    {
      title: "How robots.txt works",
      href: "/how-does-robots-txt-work",
      description: "Group selection and rule precedence.",
    },
    {
      title: "All robots.txt tools",
      href: "/",
      description: "Generate, validate, test, and explain.",
    },
  ],
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
