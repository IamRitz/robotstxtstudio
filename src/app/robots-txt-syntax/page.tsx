import type { Metadata } from "next";
import Link from "next/link";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "robots.txt Syntax and Format: Every Directive Explained",
  description:
    "A complete robots.txt syntax and format reference: User-agent, Allow, Disallow, Sitemap, Crawl-delay, wildcards (*), the $ anchor, file structure, encoding, and size limits — with examples.",
  alternates: { canonical: "/robots-txt-syntax" },
};

const page: ContentPage = {
  slug: "robots-txt-syntax",
  h1: "robots.txt Syntax",
  description:
    "A complete reference for robots.txt directives, pattern matching, and file format: structure, encoding, and delivery.",
  lead: (
    <>
      robots.txt has a small vocabulary: a handful of directives, two wildcard characters, and a
      grouping rule. This page is a precise reference for each one, plus the file-format rules
      (encoding, size, content type) and the gotchas that cause real outages.
    </>
  ),
  cta: "validator",
  sections: [
    {
      id: "directives",
      heading: "The directives",
      blocks: [
        {
          kind: "table",
          head: ["Directive", "Purpose"],
          rows: [
            [
              <code key="a" className="font-mono">
                User-agent
              </code>,
              "Starts a group; names the crawler the following rules apply to (* = all).",
            ],
            [
              <code key="b" className="font-mono">
                Disallow
              </code>,
              "A path prefix the crawler must not request. Empty value = allow everything.",
            ],
            [
              <code key="c" className="font-mono">
                Allow
              </code>,
              "A path prefix that overrides a broader Disallow (used for exceptions).",
            ],
            [
              <code key="d" className="font-mono">
                Sitemap
              </code>,
              "Absolute URL of an XML sitemap. File-level, not tied to a group.",
            ],
            [
              <code key="e" className="font-mono">
                Crawl-delay
              </code>,
              "Seconds between requests. Honored by Bing/Yandex; ignored by Google.",
            ],
          ],
        },
      ],
    },
    {
      id: "groups",
      heading: "Groups and User-agent",
      blocks: [
        {
          kind: "p",
          content:
            "Rules are organized into groups. A group is one or more User-agent lines followed by Allow/Disallow rules. Consecutive User-agent lines share the same rule block.",
        },
        {
          kind: "snippet",
          code: "User-agent: GPTBot\nUser-agent: CCBot\nDisallow: /",
          caption: "Both crawlers share one rule: block everything",
        },
      ],
    },
    {
      id: "paths",
      heading: "Path rules: Allow and Disallow",
      blocks: [
        {
          kind: "p",
          content:
            "Paths are matched as prefixes from the start of the URL path. A trailing slash matters: /admin matches /administrator, while /admin/ matches only things inside that directory.",
        },
        {
          kind: "snippet",
          code: "User-agent: *\nDisallow: /tmp/\nDisallow: /*.json$\nAllow: /tmp/public/",
          caption: "Block /tmp/ and any .json file, but allow /tmp/public/",
        },
        {
          kind: "callout",
          status: "info",
          title: "Empty Disallow means allow-all",
          body: "Disallow: (with no value) places no restriction. Disallow: / blocks the whole site. The single missing slash is the difference between “everything” and “nothing.”",
        },
      ],
    },
    {
      id: "wildcards",
      heading: "Wildcards: * and $",
      blocks: [
        {
          kind: "list",
          items: [
            "* matches any sequence of characters, including none. /private*/ matches /private/ and /private-data/.",
            "$ anchors to the end of the path. /*.pdf$ matches URLs that end in .pdf.",
            "These are the only two special characters. Everything else is literal.",
          ],
        },
      ],
    },
    {
      id: "comments",
      heading: "Comments and Sitemap",
      blocks: [
        {
          kind: "p",
          content:
            "Anything after a # is a comment (whole-line or inline). The Sitemap directive takes a full absolute URL and can appear multiple times.",
        },
        {
          kind: "snippet",
          code: "# Block faceted navigation\nUser-agent: *\nDisallow: /*?color=  # query-parameter facets\n\nSitemap: https://example.com/sitemap.xml",
        },
        {
          kind: "p",
          content: (
            <>
              For where the Sitemap line should go and how to list several, see{" "}
              <Link href="/robots-txt-sitemap" className="text-brand hover:underline">
                robots.txt sitemap
              </Link>
              .
            </>
          ),
        },
      ],
    },
    {
      id: "format",
      heading: "File format, encoding, and delivery",
      blocks: [
        {
          kind: "list",
          items: [
            "One directive per line, written Field: value. Field names are case-insensitive.",
            "Group order doesn't change behavior — each crawler uses the one group that best matches it, wherever it appears.",
            "Rule order inside a group doesn't matter either: the longest matching path wins.",
            "Sitemap lines and # comments can go anywhere; Sitemap is not part of any group.",
            "Save as UTF-8 plain text. LF or CRLF line endings both work.",
            "Serve it at /robots.txt with status 200 and Content-Type: text/plain.",
            "Google reads the first 500 KiB and ignores the rest.",
          ],
        },
        {
          kind: "snippet",
          code: "# file-level comment\nUser-agent: *          # default group\nDisallow: /admin/\n\nUser-agent: GPTBot     # crawler-specific group\nDisallow: /\n\nSitemap: https://example.com/sitemap.xml",
          caption: "A well-formatted file",
        },
        {
          kind: "mistakes",
          items: [
            {
              title: "Two directives on one line",
              body: "User-agent: * Disallow: / is one malformed line, not two rules. Give each directive its own line.",
            },
            {
              title: "Copying from a word processor",
              body: "Curly quotes and rich-text characters break directives. Edit robots.txt as plain text.",
            },
            {
              title: "An HTML page at /robots.txt",
              body: "A 200 HTML page (soft 404 or app shell) contains no valid rules, so crawlers treat the site as unrestricted.",
            },
          ],
        },
      ],
    },
    {
      id: "mistakes",
      heading: "Syntax mistakes that break files",
      blocks: [
        {
          kind: "mistakes",
          items: [
            {
              title: "Missing the colon",
              body: "Disallow /admin (no colon) is not a valid directive and is ignored.",
            },
            {
              title: "Relative sitemap URL",
              body: "Sitemap: /sitemap.xml is invalid — it must be a full absolute URL.",
            },
            {
              title: "Crawl-delay: 0",
              body: "Has no effect and Google ignores Crawl-delay entirely. Use Search Console crawl settings instead.",
            },
          ],
        },
        {
          kind: "p",
          content: (
            <>
              Catch all of these automatically with the{" "}
              <Link href="/validate" className="text-brand hover:underline">
                Validator
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
      question: "Is robots.txt case sensitive?",
      answer:
        "User-agent names are matched case-insensitively. Directive names are case-insensitive too. But URL paths in Allow/Disallow are case-sensitive: /Admin and /admin are different paths.",
    },
    {
      question: "What does Disallow: / mean?",
      answer:
        "It blocks the entire site for the matching crawler — every path. Use it deliberately (for example, to block an AI crawler).",
    },
    {
      question: "What does the * wildcard do in robots.txt?",
      answer:
        "It matches any run of characters within a path, so /*.pdf matches any URL containing .pdf. It was an informal extension for years and is now part of the standard (RFC 9309); Google and Bing support it.",
    },
    {
      question: "Does the order of rules matter in robots.txt?",
      answer:
        "No. A crawler picks the most specific user-agent group, then applies the longest matching path rule. Neither depends on line order.",
    },
    {
      question: "What is the $ symbol in robots.txt?",
      answer:
        "It anchors a pattern to the end of the URL. /page$ matches /page but not /page/sub, /page2, or /page?ref=1 — the query string counts as part of the URL.",
    },
  ],
  related: [
    {
      title: "Robots.txt Validator",
      href: "/validate",
      description: "Check a file against these rules.",
    },
    {
      title: "How robots.txt works",
      href: "/how-does-robots-txt-work",
      description: "Precedence and matching.",
    },
    {
      title: "robots.txt examples",
      href: "/robots-txt-examples",
      description: "See the syntax in context.",
    },
  ],
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
