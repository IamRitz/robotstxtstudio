import type { Metadata } from "next";
import Link from "next/link";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "robots.txt Checker: Validate & Audit Your File",
  description:
    "How to check a robots.txt file: validate syntax, test whether URLs are blocked, audit a live site, and fix the issues a checker finds.",
  alternates: { canonical: "/robots-txt-checker" },
};

const page: ContentPage = {
  slug: "robots-txt-checker",
  h1: "robots.txt Checker",
  description: "How to check, validate, and audit a robots.txt file — and the tools to do it.",
  lead: (
    <>
      A robots.txt checker answers two questions: is my file valid, and does it actually block what I
      think it blocks? This guide covers both — syntax checking and URL testing — plus how to audit a
      live site and act on what you find.
    </>
  ),
  cta: "validator",
  sections: [
    {
      id: "two-checks",
      heading: "Two kinds of checking",
      blocks: [
        {
          kind: "p",
          content:
            "“Checking” robots.txt means two different things, and you usually want both. Validating confirms the file is well-formed and follows best practices. Testing confirms a specific URL is allowed or blocked for a given crawler.",
        },
        {
          kind: "list",
          items: [
            "Validate → catches syntax errors, conflicts, missing sitemaps, and risky rules.",
            "Test → answers “is /admin/login blocked for GPTBot?” with the matched rule.",
            "Analyze → fetches a live site's file and combines validation, AI-crawler status, and a health score.",
          ],
        },
      ],
    },
    {
      id: "validate",
      heading: "Validate the syntax",
      blocks: [
        {
          kind: "p",
          content:
            "Start by checking the file is valid. A good validator flags errors (missing colons, conflicting rules, malformed sitemaps) and warnings (duplicate rules, Crawl-delay: 0, missing sitemap), and scores overall health.",
        },
        {
          kind: "p",
          content: (
            <>
              Paste your file into the{" "}
              <Link href="/validate" className="text-brand hover:underline">
                Validator
              </Link>{" "}
              to see issues by severity, each with the line number and a fix.
            </>
          ),
        },
      ],
    },
    {
      id: "test",
      heading: "Test specific URLs",
      blocks: [
        {
          kind: "p",
          content:
            "Validation tells you the file is well-formed; it doesn't tell you whether your important pages are reachable. For that, test real URLs against real crawlers.",
        },
        {
          kind: "snippet",
          code: "robots.txt:\nUser-agent: *\nDisallow: /admin/\n\nURL: /admin/login\nCrawler: Googlebot\n→ BLOCKED by Disallow: /admin/",
          caption: "A URL test result",
        },
        {
          kind: "p",
          content: (
            <>
              The{" "}
              <Link href="/url-tester" className="text-brand hover:underline">
                URL Tester
              </Link>{" "}
              shows the verdict, the matched rule, and a step-by-step trace so the result is never a
              black box.
            </>
          ),
        },
      ],
    },
    {
      id: "audit-live",
      heading: "Audit a live site",
      blocks: [
        {
          kind: "p",
          content:
            "To check a site that's already deployed (yours or a competitor's), fetch the live file and audit it in one step — including whether AI crawlers are blocked and whether a sitemap is declared.",
        },
        {
          kind: "p",
          content: (
            <>
              Enter any domain in the{" "}
              <Link href="/analyze" className="text-brand hover:underline">
                Analyzer
              </Link>
              . It handles redirects, missing files, and wrong content types gracefully, then returns
              a visibility score and prioritized findings.
            </>
          ),
        },
      ],
    },
    {
      id: "fix",
      heading: "Acting on what a checker finds",
      blocks: [
        {
          kind: "mistakes",
          items: [
            { title: "Error: conflicting rules", body: "A path is both allowed and disallowed — decide which you want and remove the other." },
            { title: "Warning: missing sitemap", body: "Add a Sitemap line with the absolute https URL." },
            { title: "Info: AI crawler inherits default", body: "Set an explicit policy for major AI bots so it's intentional." },
          ],
        },
        {
          kind: "p",
          content: (
            <>
              Once you know what to change, rebuild the file safely in the{" "}
              <Link href="/generate" className="text-brand hover:underline">
                Generator
              </Link>{" "}
              and re-validate before deploying.
            </>
          ),
        },
      ],
    },
  ],
  faqs: [
    {
      question: "How do I check if my robots.txt is valid?",
      answer: "Paste it into a validator. It parses the file, flags syntax errors and best-practice issues by severity with line numbers, and gives a health score.",
    },
    {
      question: "How do I test if a URL is blocked by robots.txt?",
      answer: "Use a URL tester: provide the robots.txt, the URL, and a crawler. It applies the real matching rules and returns allowed or blocked along with the rule that decided it.",
    },
    {
      question: "How do I check a competitor's robots.txt?",
      answer: "Enter their domain into the Analyzer. It fetches the live file and breaks down which crawlers are blocked, how AI bots are handled, and any issues.",
    },
    {
      question: "What's the difference between a robots.txt checker and a validator?",
      answer:
        "A validator focuses on whether the file is well-formed and follows best practices. A checker is broader — it usually also tests specific URLs and may fetch and audit a live site. Robots.txt Studio does all three.",
    },
  ],
  related: [
    { title: "Robots.txt Validator", href: "/validate", description: "Syntax and health checking." },
    { title: "Robots.txt Analyzer", href: "/analyze", description: "Audit a live site." },
    { title: "URL Tester", href: "/url-tester", description: "Test if a URL is blocked." },
  ],
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
