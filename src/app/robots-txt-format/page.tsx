import type { Metadata } from "next";
import Link from "next/link";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "robots.txt Format: What a Correct File Looks Like",
  description:
    "The correct robots.txt format — file structure, group ordering, encoding, line endings, and what a valid file looks like.",
  alternates: { canonical: "/robots-txt-format" },
};

const page: ContentPage = {
  slug: "robots-txt-format",
  h1: "robots.txt Format",
  description: "The correct robots.txt file format: structure, ordering, encoding, and a valid template.",
  lead: (
    <>
      “Format” is about the shape of the file rather than the meaning of each rule: how groups are
      structured, what encoding to use, and what a clean, valid robots.txt looks like end to end.
    </>
  ),
  cta: "validator",
  sections: [
    {
      id: "shape",
      heading: "The overall shape",
      blocks: [
        {
          kind: "p",
          content:
            "A robots.txt file is a sequence of groups plus some file-level directives (Sitemap, comments). Each group is a block of one-directive-per-line text. Blank lines separate groups for readability but aren't required.",
        },
        {
          kind: "snippet",
          code: "# 1. file-level comment\nUser-agent: *          # start of the default group\nAllow: /\nDisallow: /admin/\n\nUser-agent: GPTBot     # a crawler-specific group\nDisallow: /\n\nSitemap: https://example.com/sitemap.xml",
          caption: "A well-formatted file",
        },
      ],
    },
    {
      id: "rules",
      heading: "Formatting rules that matter",
      blocks: [
        {
          kind: "list",
          items: [
            "One directive per line, in the form Field: value.",
            "Field names are case-insensitive (User-agent, user-agent, USER-AGENT all work).",
            "Group order doesn't change behavior — each crawler picks its most specific group regardless of position.",
            "Rule order within a group doesn't matter either; precedence is by match length, not line order.",
            "Sitemap and comments can appear anywhere; Sitemap is always file-level.",
          ],
        },
      ],
    },
    {
      id: "encoding",
      heading: "Encoding and delivery",
      blocks: [
        {
          kind: "list",
          items: [
            "Encode as UTF-8. Avoid a leading byte-order mark (BOM).",
            "Serve with Content-Type: text/plain and a 200 status.",
            "Either LF or CRLF line endings are fine.",
            "Keep it under 500 KiB — Google ignores anything past that limit.",
          ],
        },
        {
          kind: "callout",
          status: "warning",
          title: "Beware the HTML error page",
          body: "If /robots.txt returns your site's HTML 404 page with a 200 status, crawlers see invalid content and may ignore your rules. The Analyzer flags this as an invalid content type.",
        },
      ],
    },
    {
      id: "template",
      heading: "A safe default template",
      blocks: [
        {
          kind: "snippet",
          code: "User-agent: *\nAllow: /\n\nSitemap: https://example.com/sitemap.xml",
          caption: "Allow everything + declare a sitemap",
        },
        {
          kind: "p",
          content: (
            <>
              That's the safest starting point for most sites. Build a tailored one — with the right
              disallows and AI-crawler rules — in the{" "}
              <Link href="/generate" className="text-brand hover:underline">
                Generator
              </Link>
              , then confirm it parses cleanly in the{" "}
              <Link href="/validate" className="text-brand hover:underline">
                Validator
              </Link>
              .
            </>
          ),
        },
      ],
    },
    {
      id: "mistakes",
      heading: "Formatting mistakes",
      blocks: [
        {
          kind: "mistakes",
          items: [
            { title: "Multiple directives on one line", body: "User-agent: * Disallow: / is invalid; each directive needs its own line." },
            { title: "Indented directives", body: "Leading whitespace can confuse some parsers; keep directives flush-left." },
            { title: "Smart quotes / rich text", body: "Save as plain text, not from a word processor that inserts curly quotes." },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What should a robots.txt file look like?",
      answer:
        "A series of groups, each beginning with one or more User-agent lines followed by Allow/Disallow rules, plus a Sitemap line. One directive per line, plain UTF-8 text. See the template above for a safe default.",
    },
    {
      question: "Does the order of rules matter in robots.txt?",
      answer:
        "No. Crawlers select the most specific user-agent group and then apply the longest-matching path rule — neither depends on the order lines appear in the file.",
    },
    {
      question: "Can robots.txt have comments?",
      answer: "Yes. Anything after a # is a comment, on its own line or after a directive. Comments are ignored by crawlers but help maintainers.",
    },
    {
      question: "Where does the Sitemap line go?",
      answer: "Anywhere in the file — it's file-level, not part of any group. Putting it at the top or bottom is purely a style choice.",
    },
  ],
  related: [
    { title: "robots.txt syntax", href: "/robots-txt-syntax", description: "Directive-level reference." },
    { title: "The robots.txt file", href: "/robots-txt-file", description: "Where it lives and how to create it." },
    { title: "robots.txt examples", href: "/robots-txt-examples", description: "Complete files to copy." },
  ],
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
