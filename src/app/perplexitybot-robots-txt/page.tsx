import type { Metadata } from "next";
import Link from "next/link";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "PerplexityBot in robots.txt: Allow or Block",
  description:
    "Control PerplexityBot in robots.txt. What Perplexity's crawler does, the referral-traffic trade-off of blocking it, copy-paste rules, and reported compliance caveats.",
  alternates: { canonical: "/perplexitybot-robots-txt" },
};

const page: ContentPage = {
  slug: "perplexitybot-robots-txt",
  h1: "PerplexityBot in robots.txt",
  description:
    "What PerplexityBot is, the trade-off of blocking it, and the exact robots.txt rules.",
  heroCta: "ai-manager",
  lead: (
    <>
      <code className="font-mono text-foreground">PerplexityBot</code> fetches pages for
      Perplexity&apos;s AI answer engine. Unlike pure training crawlers, blocking it is a genuine
      trade-off: you stay out of AI answers, but you also forgo the referral traffic those citations
      can send.
    </>
  ),
  cta: "analyzer",
  sections: [
    {
      id: "what",
      heading: "What PerplexityBot does",
      blocks: [
        {
          kind: "p",
          content:
            "Perplexity is an AI answer engine that responds to questions with synthesized answers and source citations. PerplexityBot crawls pages so they can be surfaced and linked in those answers. Because Perplexity links its sources, appearing there can drive real visitors — which makes the allow/block decision different from a training-only crawler.",
        },
        {
          kind: "table",
          head: ["Property", "Value"],
          rows: [
            [
              "User-agent",
              <code key="u" className="font-mono">
                PerplexityBot
              </code>,
            ],
            ["Operator", "Perplexity"],
            ["Purpose", "AI answer engine — fetch & cite pages"],
            ["Sends referral traffic", "Yes, via citations"],
            ["Honors robots.txt", "Partial — see caveat below"],
          ],
        },
        {
          kind: "p",
          content: (
            <>
              Source:{" "}
              <a
                href="https://docs.perplexity.ai/guides/bots"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                Perplexity&apos;s crawler documentation
              </a>
              , which describes PerplexityBot and Perplexity-User.
            </>
          ),
        },
      ],
    },
    {
      id: "tradeoff",
      heading: "The allow-vs-block trade-off",
      blocks: [
        {
          kind: "list",
          items: [
            "Allow it if discovery matters more than control — citations in Perplexity can send qualified readers to your pages.",
            "Block it if you don't want your content summarized in AI answers, or if you license content commercially.",
            "Unlike GPTBot or ClaudeBot, this is not a no-cost block — weigh the lost referrals.",
          ],
        },
        { kind: "cta", tool: "analyzer" },
      ],
    },
    {
      id: "how",
      heading: "How to allow or block PerplexityBot",
      blocks: [
        { kind: "p", content: "Block PerplexityBot across the whole site:" },
        {
          kind: "snippet",
          code: "User-agent: PerplexityBot\nDisallow: /",
          caption: "Block PerplexityBot",
        },
        { kind: "p", content: "Allow it explicitly (the default) with an empty Disallow:" },
        {
          kind: "snippet",
          code: "User-agent: PerplexityBot\nDisallow:",
          caption: "Allow PerplexityBot",
        },
      ],
    },
    {
      id: "caveat",
      heading: "Compliance caveat",
      blocks: [
        {
          kind: "callout",
          status: "warning",
          title: "Reported robots.txt evasion",
          body: "Security researchers have reported Perplexity fetching pages without honoring robots.txt or its declared user-agent in some cases. If keeping content out is critical, don't rely on robots.txt alone — combine it with server-side blocking and verify behavior.",
        },
        {
          kind: "p",
          content:
            "robots.txt is a voluntary standard. For crawlers with a questionable record, treat a Disallow rule as a request and confirm it with the Analyzer, then escalate to firewall or WAF rules if the crawler ignores it.",
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
              to confirm PerplexityBot resolves to the policy you intended while Googlebot stays
              Allowed, or trace a single URL against the PerplexityBot user-agent in the{" "}
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
              title: "Treating it like a training crawler",
              body: "Blocking PerplexityBot costs you referral traffic, unlike blocking GPTBot. Decide deliberately.",
            },
            {
              title: "Relying on robots.txt alone",
              body: "Given reported non-compliance, add server-side enforcement if the content is sensitive.",
            },
            {
              title: "Not verifying",
              body: "Always confirm the block took effect — run your domain through the Analyzer.",
            },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Should I block PerplexityBot?",
      answer:
        "It depends. Blocking it keeps your content out of Perplexity's AI answers but also gives up the referral traffic its citations can send. If you want discovery, allow it; if you want control or license content, block it.",
    },
    {
      question: "Does PerplexityBot respect robots.txt?",
      answer:
        "Only partially. Perplexity states it honors robots.txt, but researchers have reported it fetching pages without doing so in some cases. For sensitive content, pair robots.txt with server-side blocking and verify with the Analyzer.",
    },
    {
      question: "Does blocking PerplexityBot affect SEO?",
      answer:
        "No. PerplexityBot is unrelated to Googlebot or Bingbot, so blocking it does not change your search rankings. It only affects whether you appear in Perplexity's answers.",
    },
    {
      question: "How do I block PerplexityBot in robots.txt?",
      answer:
        "Add User-agent: PerplexityBot followed by Disallow: /. Because compliance has been inconsistent, confirm the block on a live site and consider firewall rules as a backup.",
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
      title: "Google-Extended",
      href: "/google-extended-robots-txt",
      description: "Google's AI training token.",
    },
    {
      title: "AI Crawler Manager",
      href: "/ai-crawlers",
      description: "Manage AI crawlers in one place.",
    },
    { title: "Robots.txt Analyzer", href: "/analyze", description: "Verify a crawler is blocked." },
  ],
  nextReading: { title: "Google-Extended in robots.txt", href: "/google-extended-robots-txt" },
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
