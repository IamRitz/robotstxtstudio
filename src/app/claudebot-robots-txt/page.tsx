import type { Metadata } from "next";
import Link from "next/link";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "How to Block ClaudeBot in robots.txt (Anthropic Crawler)",
  description:
    "Block or allow ClaudeBot, Anthropic's training crawler, in robots.txt. Copy-paste rules, how ClaudeBot differs from Claude-SearchBot, and common mistakes.",
  alternates: { canonical: "/claudebot-robots-txt" },
};

const page: ContentPage = {
  slug: "claudebot-robots-txt",
  h1: "Block ClaudeBot in robots.txt",
  description:
    "What ClaudeBot is, why it matters, and the exact robots.txt rules to allow or block Anthropic's crawler.",
  heroCta: "ai-manager",
  lead: (
    <>
      <code className="font-mono text-foreground">ClaudeBot</code> is Anthropic&apos;s web crawler,
      used to gather training data for the Claude models. If you want to opt out of Claude training,
      a short robots.txt group stops it — with no impact on your search visibility.
    </>
  ),
  cta: "validator",
  sections: [
    {
      id: "what",
      heading: "What ClaudeBot does",
      blocks: [
        {
          kind: "p",
          content: (
            <>
              ClaudeBot crawls public web pages to build training data for Anthropic&apos;s Claude
              models. Like other reputable AI crawlers, it identifies itself with a stable
              user-agent and follows robots.txt. It is distinct from{" "}
              <Link href="/claude-searchbot-robots-txt" className="text-brand hover:underline">
                Claude-SearchBot
              </Link>
              , which fetches pages so Claude can cite current results when answering.
            </>
          ),
        },
        {
          kind: "table",
          head: ["Property", "Value"],
          rows: [
            [
              "User-agent",
              <code key="u" className="font-mono">
                ClaudeBot
              </code>,
            ],
            ["Operator", "Anthropic"],
            ["Purpose", "Model training data collection"],
            ["Honors robots.txt", "Yes (per Anthropic docs)"],
            ["Affects Google ranking", "No"],
          ],
        },
        {
          kind: "p",
          content: (
            <>
              Source:{" "}
              <a
                href="https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                Anthropic&apos;s crawler documentation
              </a>
              , which lists each Anthropic user-agent and how to control it.
            </>
          ),
        },
      ],
    },
    {
      id: "why",
      heading: "Why site owners care",
      blocks: [
        {
          kind: "p",
          content:
            "The decision mirrors GPTBot: publishers protecting licensed content, businesses guarding proprietary writing, and large sites managing crawl load typically block training crawlers. Because the rule is reversible, many sites block by default and revisit later.",
        },
        { kind: "cta", tool: "analyzer" },
      ],
    },
    {
      id: "how",
      heading: "How to block ClaudeBot",
      blocks: [
        { kind: "p", content: "Block ClaudeBot across your whole site:" },
        {
          kind: "snippet",
          code: "User-agent: ClaudeBot\nDisallow: /",
          caption: "Block ClaudeBot entirely",
        },
        {
          kind: "p",
          content:
            "Block ClaudeBot alongside other AI crawlers by listing several user-agents in one group:",
        },
        {
          kind: "snippet",
          code: "User-agent: ClaudeBot\nUser-agent: GPTBot\nUser-agent: CCBot\nDisallow: /\n\nUser-agent: *\nAllow: /",
          caption: "Block several AI training crawlers at once",
        },
        { kind: "p", content: "Explicitly allow ClaudeBot with an empty Disallow:" },
        { kind: "snippet", code: "User-agent: ClaudeBot\nDisallow:", caption: "Allow ClaudeBot" },
      ],
    },
    {
      id: "legacy",
      heading: "A note on older Anthropic agents",
      blocks: [
        {
          kind: "p",
          content:
            "Anthropic has previously used other tokens (such as anthropic-ai and Claude-Web). Current guidance consolidates on ClaudeBot for crawling and Claude-SearchBot for search. If you want belt-and-suspenders coverage, you can list the legacy tokens too — they simply won't match anything if unused.",
        },
        {
          kind: "snippet",
          code: "User-agent: ClaudeBot\nUser-agent: anthropic-ai\nUser-agent: Claude-Web\nDisallow: /",
          caption: "ClaudeBot plus legacy tokens",
        },
      ],
    },
    {
      id: "verify",
      heading: "Verify the block works",
      blocks: [
        {
          kind: "p",
          content: (
            <>
              After uploading your robots.txt, run your domain through the{" "}
              <Link href="/analyze" className="text-brand hover:underline">
                Analyzer
              </Link>{" "}
              to confirm ClaudeBot resolves to Blocked while Googlebot stays Allowed, or trace a
              single URL against the ClaudeBot user-agent in the{" "}
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
              title: "Confusing the two Anthropic bots",
              body: "ClaudeBot is training; Claude-SearchBot fetches pages for cited answers. Block them independently.",
            },
            {
              title: "Wrong casing or spelling",
              body: "User-agent matching is case-insensitive, but the token must still read ClaudeBot — not Claude or ClaudeAI.",
            },
            {
              title: "Expecting it to remove indexed pages",
              body: "Blocking ClaudeBot affects training only, never search indexing.",
            },
            {
              title: "Putting the rule under the wrong group",
              body: "Disallow: / belongs under User-agent: ClaudeBot, not the catch-all *.",
            },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: "How do I block ClaudeBot?",
      answer:
        "Add User-agent: ClaudeBot followed by Disallow: / to robots.txt. Anthropic documents that ClaudeBot respects robots.txt, so this opts your site out of Claude training.",
    },
    {
      question: "Will blocking ClaudeBot affect my Google ranking?",
      answer:
        "No. ClaudeBot is Anthropic's crawler and is unrelated to Googlebot. Blocking it has no effect on search rankings or indexing.",
    },
    {
      question: "What is the difference between ClaudeBot and Claude-SearchBot?",
      answer:
        "ClaudeBot collects training data for Anthropic's models. Claude-SearchBot fetches live pages so Claude can cite them when answering questions. They are separate user-agents and can be controlled separately.",
    },
    {
      question: "Should I also block anthropic-ai and Claude-Web?",
      answer:
        "Those are older or legacy tokens. Listing them alongside ClaudeBot does no harm and adds coverage, but ClaudeBot is the current crawler to focus on.",
    },
  ],
  related: [
    {
      title: "AI Crawler Directory",
      href: "/ai-crawlers-directory",
      description: "Every AI crawler compared.",
    },
    {
      title: "Block GPTBot",
      href: "/gptbot-robots-txt",
      description: "OpenAI's training crawler.",
    },
    {
      title: "AI Crawler Manager",
      href: "/ai-crawlers",
      description: "Block ClaudeBot with one click.",
    },
    {
      title: "Claude-SearchBot in robots.txt",
      href: "/claude-searchbot-robots-txt",
      description: "Anthropic's search crawler — decide it separately.",
    },
    {
      title: "How to Block AI Crawlers",
      href: "/block-ai-crawlers",
      description: "Block every AI crawler in one file.",
    },
  ],
  nextReading: { title: "PerplexityBot in robots.txt", href: "/perplexitybot-robots-txt" },
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
