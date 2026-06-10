import type { Metadata } from "next";
import Link from "next/link";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "robots.txt Syntax: Every Directive Explained",
  description:
    "A complete robots.txt syntax reference: User-agent, Allow, Disallow, Sitemap, Crawl-delay, wildcards (*), and the $ anchor — with examples.",
  alternates: { canonical: "/robots-txt-syntax" },
};

const page: ContentPage = {
  slug: "robots-txt-syntax",
  h1: "robots.txt Syntax",
  description:
    "A complete reference for robots.txt directives: User-agent, Allow, Disallow, Sitemap, Crawl-delay, and pattern matching.",
  lead: (
    <>
      robots.txt has a small vocabulary: a handful of directives, two wildcard characters, and a
      grouping rule. This page is a precise reference for each one, with the gotchas that cause real
      outages.
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
            [<code key="a" className="font-mono">User-agent</code>, "Starts a group; names the crawler the following rules apply to (* = all)."],
            [<code key="b" className="font-mono">Disallow</code>, "A path prefix the crawler must not request. Empty value = allow everything."],
            [<code key="c" className="font-mono">Allow</code>, "A path prefix that overrides a broader Disallow (used for exceptions)."],
            [<code key="d" className="font-mono">Sitemap</code>, "Absolute URL of an XML sitemap. File-level, not tied to a group."],
            [<code key="e" className="font-mono">Crawl-delay</code>, "Seconds between requests. Honored by Bing/Yandex; ignored by Google."],
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
      id: "mistakes",
      heading: "Syntax mistakes that break files",
      blocks: [
        {
          kind: "mistakes",
          items: [
            { title: "Missing the colon", body: "Disallow /admin (no colon) is not a valid directive and is ignored." },
            { title: "Relative sitemap URL", body: "Sitemap: /sitemap.xml is invalid — it must be a full absolute URL." },
            { title: "Crawl-delay: 0", body: "Has no effect and Google ignores Crawl-delay entirely. Use Search Console crawl settings instead." },
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
      answer: "It blocks the entire site for the matching crawler — every path. Use it deliberately (for example, to block an AI crawler).",
    },
    {
      question: "What does the * wildcard do in robots.txt?",
      answer:
        "It matches any run of characters within a path, so /*.pdf matches any URL containing a .pdf segment. It's supported by major crawlers but is technically an extension to the original standard.",
    },
    {
      question: "What is the $ symbol in robots.txt?",
      answer: "It anchors a pattern to the end of the URL. /page$ matches /page exactly but not /page/sub or /page2.",
    },
  ],
  related: [
    { title: "robots.txt format", href: "/robots-txt-format", description: "Structure and encoding." },
    { title: "How robots.txt works", href: "/how-does-robots-txt-work", description: "Precedence and matching." },
    { title: "robots.txt examples", href: "/robots-txt-examples", description: "See the syntax in context." },
  ],
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
