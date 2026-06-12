import type { Metadata } from "next";
import Link from "next/link";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "Google-Extended in robots.txt: Opt Out of Gemini Training",
  description:
    "Use Google-Extended in robots.txt to stop Google training Gemini on your content — without affecting Google Search ranking. Copy-paste rules and how it differs from Googlebot.",
  alternates: { canonical: "/google-extended-robots-txt" },
};

const page: ContentPage = {
  slug: "google-extended-robots-txt",
  h1: "Google-Extended in robots.txt",
  description:
    "How Google-Extended lets you opt out of Gemini training without touching Google Search ranking.",
  heroCta: "ai-manager",
  lead: (
    <>
      <code className="font-mono text-foreground">Google-Extended</code> is not a crawler —
      it&apos;s an opt-out token. It controls whether Google may use your content to train Gemini
      and ground AI features. Blocking it has zero effect on your Google Search ranking, because
      Googlebot is separate.
    </>
  ),
  cta: "validator",
  sections: [
    {
      id: "what",
      heading: "What Google-Extended is",
      blocks: [
        {
          kind: "p",
          content:
            "Google-Extended is a robots.txt user-agent token Google introduced so publishers can opt out of having their content used for AI training and grounding (Gemini, Vertex AI) while remaining fully crawlable for Google Search. There is no separate bot called Google-Extended fetching your pages — Googlebot still does the crawling. The token simply governs how the already-crawled content may be used.",
        },
        {
          kind: "callout",
          status: "info",
          title: "This is the safest AI opt-out",
          body: "Because Googlebot and Google-Extended are decoupled, you can block Google-Extended with complete confidence that your search rankings are unaffected.",
        },
        {
          kind: "p",
          content: (
            <>
              Source:{" "}
              <a
                href="https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                Google&apos;s crawler documentation
              </a>
              , which lists Google-Extended among Google&apos;s user-agent tokens.
            </>
          ),
        },
      ],
    },
    {
      id: "googlebot",
      heading: "Google-Extended vs Googlebot",
      blocks: [
        {
          kind: "table",
          head: ["Token", "Controls", "Affects Search ranking?"],
          rows: [
            [
              <code key="a" className="font-mono">
                Googlebot
              </code>,
              "Crawling for Google Search",
              "Yes — don't block it",
            ],
            [
              <code key="b" className="font-mono">
                Google-Extended
              </code>,
              "Use of content for Gemini / AI training",
              "No — safe to block",
            ],
          ],
        },
        {
          kind: "callout",
          status: "blocked",
          title: "Never block Googlebot to stop AI",
          body: "Blocking Googlebot removes you from Google Search. To opt out of AI only, block Google-Extended and leave Googlebot allowed.",
        },
        { kind: "cta", tool: "analyzer" },
      ],
    },
    {
      id: "how",
      heading: "How to block Google-Extended",
      blocks: [
        { kind: "p", content: "Opt out of Google AI training while staying in Search:" },
        {
          kind: "snippet",
          code: "User-agent: Google-Extended\nDisallow: /\n\nUser-agent: Googlebot\nAllow: /",
          caption: "Opt out of Gemini training, keep Google Search",
        },
        { kind: "p", content: "To allow it (the default), use an empty Disallow:" },
        {
          kind: "snippet",
          code: "User-agent: Google-Extended\nDisallow:",
          caption: "Allow Google AI training",
        },
      ],
    },
    {
      id: "verify",
      heading: "Verify the rule works",
      blocks: [
        {
          kind: "p",
          content: (
            <>
              After uploading your robots.txt, run your domain through the{" "}
              <Link href="/analyze" className="text-brand hover:underline">
                Analyzer
              </Link>{" "}
              to confirm Google-Extended resolves to Blocked while Googlebot stays Allowed, or trace
              a single URL against the Google-Extended token in the{" "}
              <Link href="/url-tester" className="text-brand hover:underline">
                URL Tester
              </Link>
              .
            </>
          ),
        },
        { kind: "cta", tool: "analyzer" },
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
              title: "Blocking Googlebot instead",
              body: "The classic error: Disallow: / under Googlebot deindexes your site. Use Google-Extended for the AI opt-out.",
            },
            {
              title: "Expecting a crawl change",
              body: "You won't see a new bot in your logs — Google-Extended is a policy token, not a separate crawler.",
            },
            {
              title: "Assuming it covers other engines",
              body: "Google-Extended only governs Google. Bing, OpenAI, and Anthropic need their own rules.",
            },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What does Google-Extended do?",
      answer:
        "It lets you opt out of Google using your content to train its AI models (Gemini) and ground AI features. It does not affect crawling for Google Search, which is handled by Googlebot.",
    },
    {
      question: "Does blocking Google-Extended hurt my Google ranking?",
      answer:
        "No. Google-Extended is completely separate from Googlebot. Blocking it stops AI training use only and has no effect on how you rank or whether you're indexed in Google Search.",
    },
    {
      question: "How do I block Google-Extended?",
      answer:
        "Add User-agent: Google-Extended followed by Disallow: / to robots.txt. Keep Googlebot allowed so you remain in Google Search.",
    },
    {
      question: "Is Google-Extended a crawler?",
      answer:
        "No. It's an opt-out token, not a bot. Googlebot still crawls your pages; Google-Extended only controls whether that content may be used for AI training and grounding.",
    },
  ],
  related: [
    {
      title: "How to Block AI Crawlers",
      href: "/block-ai-crawlers",
      description: "Block every AI crawler in one file.",
    },
    {
      title: "AI Crawler Directory",
      href: "/ai-crawlers-directory",
      description: "Every AI crawler compared.",
    },
    {
      title: "Block CCBot",
      href: "/ccbot-robots-txt",
      description: "The Common Crawl dataset crawler.",
    },
    {
      title: "robots.txt for SEO",
      href: "/robots-txt-seo-guide",
      description: "Crawling vs ranking, explained.",
    },
    {
      title: "AI Crawler Manager",
      href: "/ai-crawlers",
      description: "Set Google-Extended in one click.",
    },
  ],
  nextReading: { title: "Block CCBot in robots.txt", href: "/ccbot-robots-txt" },
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
