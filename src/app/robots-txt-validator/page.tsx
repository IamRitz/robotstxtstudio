import type { Metadata } from "next";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "Robots.txt Validator — Check Syntax & Errors Free",
  description:
    "Validate robots.txt for syntax errors and best-practice issues. Paste your file or fetch it live, see issues by severity with line numbers and fixes, plus a health score. Free.",
  alternates: { canonical: "/robots-txt-validator" },
};

const page: ContentPage = {
  slug: "robots-txt-validator",
  h1: "Robots.txt Validator",
  description:
    "Check your robots.txt for syntax errors and best-practice issues, with severity, line numbers, and a health score.",
  heroCta: "validator",
  lead: (
    <>
      A single malformed line can silently break crawling. This validator parses your robots.txt the
      way crawlers do, flags errors and warnings by severity with exact line numbers and fixes, and
      scores the file&apos;s overall health. Paste it or fetch it live.
    </>
  ),
  cta: "validator",
  sections: [
    {
      id: "what-it-checks",
      heading: "What it checks",
      blocks: [
        {
          kind: "list",
          items: [
            "Syntax errors — missing colons, malformed directives, invalid Sitemap URLs.",
            "Conflicts — a path that is both allowed and disallowed for the same agent.",
            "Best-practice warnings — missing sitemap, Crawl-delay: 0, duplicate rules.",
            "Risk flags — an accidental Disallow: / that would block your whole site.",
          ],
        },
        { kind: "cta", tool: "validator" },
      ],
    },
    {
      id: "severity",
      heading: "Issues by severity",
      blocks: [
        {
          kind: "p",
          content:
            "Not every issue is equal. The validator separates blocking errors from advisory warnings so you know what to fix now versus what's optional, and it gives every finding a line number and a recommended fix.",
        },
        {
          kind: "table",
          head: ["Severity", "Meaning", "Example"],
          rows: [
            ["Error", "Breaks parsing or behavior", "Disallow without a colon"],
            ["Warning", "Works, but risky or suboptimal", "No Sitemap declared"],
            ["Info", "Worth knowing", "AI crawler inherits the default"],
          ],
        },
      ],
    },
    {
      id: "how",
      heading: "How to validate your file",
      blocks: [
        {
          kind: "list",
          ordered: true,
          items: [
            "Paste your robots.txt, or fetch it directly from your live domain.",
            "Review the issues grouped by severity, each with its line number.",
            "Apply the suggested fix, or rebuild cleanly in the Generator.",
            "Re-validate, then deploy with confidence.",
          ],
        },
        {
          kind: "callout",
          status: "info",
          title: "Validation isn't testing",
          body: "A valid file can still block the wrong URL. After validating, confirm specific pages with the URL Tester.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "How do I check if my robots.txt is valid?",
      answer:
        "Paste your file into the validator or fetch it from your live site. It parses the file, flags syntax errors and best-practice issues by severity with line numbers, and gives an overall health score.",
    },
    {
      question: "What does the validator catch?",
      answer:
        "Syntax errors (like missing colons or malformed sitemaps), conflicting allow/disallow rules, best-practice warnings (missing sitemap, Crawl-delay: 0, duplicates), and risky patterns such as an accidental Disallow: /.",
    },
    {
      question: "Is the robots.txt validator free?",
      answer:
        "Yes. Validation is free and requires no sign-up. You can paste a file or fetch it live from any domain.",
    },
    {
      question: "Does a valid robots.txt mean my URLs are crawlable?",
      answer:
        "Not necessarily. Validation confirms the file is well-formed and follows best practices, but a valid file can still block important URLs. Use the URL Tester to confirm specific pages are allowed.",
    },
  ],
  related: [
    { title: "URL Tester", href: "/url-tester", description: "Test if a specific URL is blocked." },
    { title: "Robots.txt Generator", href: "/generate", description: "Rebuild a clean file." },
    {
      title: "robots.txt checker",
      href: "/robots-txt-checker",
      description: "Validate, test, and audit.",
    },
    {
      title: "robots.txt syntax",
      href: "/robots-txt-syntax",
      description: "Understand each directive.",
    },
  ],
  nextReading: { title: "Robots.txt Analyzer", href: "/robots-txt-analyzer" },
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
