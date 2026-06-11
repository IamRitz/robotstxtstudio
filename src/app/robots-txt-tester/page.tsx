import type { Metadata } from "next";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "Robots.txt Tester — Check if a URL Is Blocked",
  description:
    "Test whether any URL is allowed or blocked for a given crawler. See the verdict, the exact rule that decided it, and a step-by-step match trace. Free robots.txt URL tester.",
  alternates: { canonical: "/robots-txt-tester" },
};

const page: ContentPage = {
  slug: "robots-txt-tester",
  h1: "Robots.txt Tester",
  description:
    "Test whether a URL is allowed or blocked for any crawler, with the matched rule and a full trace.",
  heroCta: "tester",
  lead: (
    <>
      A valid robots.txt can still block the wrong page. This tester answers the real question — is
      this URL allowed or blocked for this crawler? — and shows the exact rule that decided it, plus
      a step-by-step trace so the verdict is never a black box.
    </>
  ),
  cta: "tester",
  sections: [
    {
      id: "why",
      heading: "Why test individual URLs",
      blocks: [
        {
          kind: "p",
          content:
            "Validation confirms a file is well-formed; it doesn't confirm your important pages are reachable. Real matching depends on group selection, longest-match precedence, and wildcard rules — easy to misjudge by reading the file. Testing applies the actual algorithm to a specific URL and crawler.",
        },
        { kind: "cta", tool: "tester" },
      ],
    },
    {
      id: "trace",
      heading: "See exactly why",
      blocks: [
        {
          kind: "p",
          content:
            "Every result shows the verdict, the matched directive, and the reasoning: which user-agent group applied, which Allow/Disallow rules matched, and why one won. No guessing about precedence.",
        },
        {
          kind: "snippet",
          code: "robots.txt:\nUser-agent: *\nDisallow: /admin/\nAllow: /admin/public/\n\nURL: /admin/public/list\nCrawler: Googlebot\n→ ALLOWED by Allow: /admin/public/ (longer match wins)",
          caption: "A URL test result with reasoning",
        },
      ],
    },
    {
      id: "how",
      heading: "How to test a URL",
      blocks: [
        {
          kind: "list",
          ordered: true,
          items: [
            "Provide your robots.txt — paste it or fetch it from a live domain.",
            "Enter the URL or path you want to check.",
            "Pick the crawler (Googlebot, GPTBot, Bingbot, and more).",
            "Read the verdict, the matched rule, and the trace.",
          ],
        },
        {
          kind: "callout",
          status: "info",
          title: "Test the crawlers that matter",
          body: "Rules can differ per crawler. Test Googlebot for SEO and an AI bot like GPTBot to confirm your AI policy behaves as intended.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "How do I test if a URL is blocked by robots.txt?",
      answer:
        "Provide your robots.txt, enter the URL, and choose a crawler. The tester applies the real matching rules and returns allowed or blocked, along with the exact directive that decided it.",
    },
    {
      question: "Why is my page blocked when the file looks fine?",
      answer:
        "Usually because of group selection or precedence — a broad Disallow matched before a more specific Allow, or a wildcard caught more than expected. The tester's trace shows which rule applied and why.",
    },
    {
      question: "Can I test different crawlers?",
      answer:
        "Yes. Rules can vary by user-agent, so you can test Googlebot, Bingbot, GPTBot, and others against the same URL to confirm each behaves the way you intend.",
    },
    {
      question: "Is the robots.txt tester free?",
      answer:
        "Yes. Testing is free with no sign-up. You can paste a file or fetch it live, then test as many URLs and crawlers as you like.",
    },
  ],
  related: [
    {
      title: "Robots.txt Validator",
      href: "/validate",
      description: "Check the file is well-formed.",
    },
    {
      title: "how to read robots.txt",
      href: "/how-to-read-robots-txt",
      description: "Understand the rules you're testing.",
    },
    { title: "Robots.txt Analyzer", href: "/analyze", description: "Audit a whole live site." },
    {
      title: "robots.txt syntax",
      href: "/robots-txt-syntax",
      description: "Wildcards and precedence.",
    },
  ],
  nextReading: { title: "AI Crawler Directory", href: "/ai-crawlers-directory" },
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
