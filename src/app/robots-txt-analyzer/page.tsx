import type { Metadata } from "next";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "Robots.txt Analyzer — Audit Any Live Site Free",
  description:
    "Analyze any website's live robots.txt in one report: who's blocked, AI crawler status, sitemap check, risky rules, and a visibility health score. Audit your site or a competitor's.",
  alternates: { canonical: "/robots-txt-analyzer" },
};

const page: ContentPage = {
  slug: "robots-txt-analyzer",
  h1: "Robots.txt Analyzer",
  description: "Fetch and audit any site's live robots.txt — crawler access, AI status, sitemap, and a health score in one report.",
  heroCta: "analyzer",
  lead: (
    <>
      Enter a domain and get its live robots.txt audited in one report: which crawlers are blocked, how
      AI bots are handled, whether a sitemap is declared, and a visibility score with prioritized
      findings. Works on your own site or any competitor&apos;s.
    </>
  ),
  cta: "analyzer",
  sections: [
    {
      id: "what-you-get",
      heading: "What the analysis shows",
      blocks: [
        {
          kind: "list",
          items: [
            "Crawler access — which search engines and AI bots can reach the site.",
            "AI crawler status — whether GPTBot, ClaudeBot, PerplexityBot and others are blocked.",
            "Sitemap check — is a sitemap declared, and is it an absolute https URL?",
            "Risk findings — accidental Disallow: /, blocked assets, conflicts.",
            "A visibility health score summarizing it all.",
          ],
        },
        { kind: "cta", tool: "analyzer" },
      ],
    },
    {
      id: "robust",
      heading: "Built for messy real-world files",
      blocks: [
        {
          kind: "p",
          content:
            "Live robots.txt files are rarely clean. The analyzer handles redirects, missing files, wrong content types, and oversized files gracefully — so you get a useful verdict instead of an error, whatever the server returns.",
        },
        {
          kind: "callout",
          status: "info",
          title: "Great for competitor research",
          body: "Want to know whether a competitor blocks AI crawlers or which sections they hide from search? Analyze their domain and read the breakdown.",
        },
      ],
    },
    {
      id: "how",
      heading: "How to analyze a site",
      blocks: [
        {
          kind: "list",
          ordered: true,
          items: [
            "Enter any domain — no need to paste the file.",
            "The analyzer fetches the live /robots.txt and parses it.",
            "Review crawler access, AI status, sitemap, and the health score.",
            "Act on the prioritized findings — fix issues in the Generator, then re-analyze.",
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: "How do I analyze a website's robots.txt?",
      answer: "Enter the domain into the analyzer. It fetches the live robots.txt, parses it, and reports which crawlers are blocked, how AI bots are handled, whether a sitemap is declared, and an overall visibility score.",
    },
    {
      question: "Can I check a competitor's robots.txt?",
      answer: "Yes. The analyzer works on any public domain. Enter a competitor's URL to see whether they block AI crawlers, which sections they disallow, and any issues in their file.",
    },
    {
      question: "What does the visibility health score mean?",
      answer: "It's a summary metric combining crawler access, AI crawler handling, sitemap presence, and risk findings into a single score, so you can gauge a file's health at a glance before reading the details.",
    },
    {
      question: "Is the robots.txt analyzer free?",
      answer: "Yes. You can analyze any live domain for free with no sign-up. It handles redirects, missing files, and unusual responses gracefully.",
    },
  ],
  related: [
    { title: "Robots.txt Validator", href: "/validate", description: "Validate a pasted file." },
    { title: "AI Crawler Directory", href: "/ai-crawlers-directory", description: "Understand the AI bots it detects." },
    { title: "how to find robots.txt", href: "/how-to-find-robots-txt", description: "Locate any site's file." },
    { title: "URL Tester", href: "/url-tester", description: "Test a specific URL." },
  ],
  nextReading: { title: "Robots.txt Tester", href: "/robots-txt-tester" },
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
