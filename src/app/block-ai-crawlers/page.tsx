import type { Metadata } from "next";
import Link from "next/link";
import { SeoContentLayout, type ContentPage } from "@/components/content";
import { howToSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "How to Block AI Crawlers in robots.txt (GPTBot, ClaudeBot & More)",
  description:
    "Block every AI training crawler — GPTBot, ClaudeBot, CCBot, Google-Extended, Bytespider — with copy-paste robots.txt rules, without touching your Google ranking. Includes the allow-AI-search variant and verification steps.",
  alternates: { canonical: "/block-ai-crawlers" },
};

const BLOCK_ALL_TRAINING = `# Block AI training crawlers, keep search engines
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: CCBot
User-agent: Google-Extended
User-agent: Bytespider
User-agent: meta-externalagent
User-agent: Applebot-Extended
Disallow: /

User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml`;

const BLOCK_EVERYTHING_AI = `# Block AI training AND AI search crawlers
User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ClaudeBot
User-agent: Claude-SearchBot
User-agent: PerplexityBot
User-agent: CCBot
User-agent: Google-Extended
User-agent: Bytespider
User-agent: meta-externalagent
User-agent: Applebot-Extended
User-agent: Amazonbot
Disallow: /

User-agent: *
Allow: /`;

const page: ContentPage = {
  slug: "block-ai-crawlers",
  h1: "How to Block AI Crawlers in robots.txt",
  description:
    "The complete playbook: block AI training crawlers with copy-paste rules, keep your Google ranking, and decide AI search separately.",
  heroCta: "ai-manager",
  lead: (
    <>
      Blocking AI crawlers takes one robots.txt group and has zero effect on your Google ranking —
      AI crawlers like <code className="font-mono text-foreground">GPTBot</code> are completely
      separate from Googlebot. The only real decision is whether to block just <em>training</em>{" "}
      crawlers, or AI <em>search</em> crawlers too. This guide gives you both files and shows you
      how to verify they work.
    </>
  ),
  cta: "validator",
  extraSchema: [
    howToSchema(
      "How to block AI crawlers in robots.txt",
      "Add a robots.txt group listing the AI crawler user-agents with Disallow: /, then verify the rules with a robots.txt analyzer.",
      [
        {
          name: "Decide training vs. search",
          text: "Choose whether to block only AI training crawlers (GPTBot, ClaudeBot, CCBot, Google-Extended) or also AI search crawlers (OAI-SearchBot, Claude-SearchBot, PerplexityBot), which can send referral traffic.",
        },
        {
          name: "Add the blocking group to robots.txt",
          text: "List each AI user-agent on its own User-agent line, followed by a single Disallow: / line. Keep your User-agent: * group separate so search engines remain allowed.",
        },
        {
          name: "Upload and verify",
          text: "Place the file at https://yourdomain.com/robots.txt, then run the domain through a robots.txt analyzer to confirm each AI crawler resolves to Blocked while Googlebot stays Allowed.",
        },
      ],
    ),
  ],
  sections: [
    {
      id: "quick-answer",
      heading: "The quick answer",
      blocks: [
        {
          kind: "p",
          content:
            "Copy this into your robots.txt to block the major AI training crawlers while staying fully visible in Google, Bing, and every other search engine:",
        },
        { kind: "snippet", code: BLOCK_ALL_TRAINING, caption: "Block AI training, keep search" },
        {
          kind: "callout",
          status: "allowed",
          title: "This does not hurt your SEO",
          body: "Google-Extended, GPTBot, ClaudeBot and the rest are separate from Googlebot and Bingbot. You can block every AI training crawler and lose nothing in search rankings.",
        },
        { kind: "cta", tool: "ai-manager" },
      ],
    },
    {
      id: "training-vs-search",
      heading: "Training crawlers vs. AI search crawlers",
      blocks: [
        {
          kind: "p",
          content:
            "AI crawlers do two different jobs, and the right policy is usually different for each:",
        },
        {
          kind: "table",
          head: ["Type", "Crawlers", "What blocking costs you"],
          rows: [
            [
              "Training",
              <span key="t">
                <Link href="/gptbot-robots-txt" className="text-brand hover:underline">
                  GPTBot
                </Link>
                ,{" "}
                <Link href="/claudebot-robots-txt" className="text-brand hover:underline">
                  ClaudeBot
                </Link>
                ,{" "}
                <Link href="/ccbot-robots-txt" className="text-brand hover:underline">
                  CCBot
                </Link>
                ,{" "}
                <Link href="/google-extended-robots-txt" className="text-brand hover:underline">
                  Google-Extended
                </Link>
                , Bytespider
              </span>,
              "Nothing measurable — your content just stops feeding model training.",
            ],
            [
              "AI search",
              <span key="s">
                <Link href="/oai-searchbot-robots-txt" className="text-brand hover:underline">
                  OAI-SearchBot
                </Link>
                ,{" "}
                <Link href="/claude-searchbot-robots-txt" className="text-brand hover:underline">
                  Claude-SearchBot
                </Link>
                ,{" "}
                <Link href="/perplexitybot-robots-txt" className="text-brand hover:underline">
                  PerplexityBot
                </Link>
              </span>,
              "Citations and referral clicks from ChatGPT Search, Claude, and Perplexity answers.",
            ],
          ],
        },
        {
          kind: "p",
          content:
            "Most sites block training and allow AI search: it protects content from being absorbed into models while keeping the attributed, linked visibility AI answers can bring. If you want out of AI entirely, use the full block below.",
        },
        {
          kind: "snippet",
          code: BLOCK_EVERYTHING_AI,
          caption: "Block every AI crawler, training and search",
        },
      ],
    },
    {
      id: "verify",
      heading: "Verify the block actually works",
      blocks: [
        {
          kind: "list",
          ordered: true,
          items: [
            <span key="1">
              Upload the file to{" "}
              <code className="font-mono">https://yourdomain.com/robots.txt</code> (it must be at
              the root — see{" "}
              <Link href="/how-to-find-robots-txt" className="text-brand hover:underline">
                where robots.txt lives
              </Link>
              ).
            </span>,
            <span key="2">
              Run your domain through the{" "}
              <Link href="/analyze" className="text-brand hover:underline">
                Analyzer
              </Link>{" "}
              — the access matrix shows exactly which AI crawlers are blocked and confirms Googlebot
              is still allowed.
            </span>,
            <span key="3">
              Spot-check a URL with the{" "}
              <Link href="/url-tester" className="text-brand hover:underline">
                URL Tester
              </Link>{" "}
              against a specific user-agent like GPTBot — it traces the exact rule that matched.
            </span>,
          ],
        },
        {
          kind: "callout",
          status: "warning",
          title: "robots.txt is a request, not a firewall",
          body: "OpenAI, Anthropic, Google, and Common Crawl document compliance. Bytespider has a patchy record, and bad actors ignore robots.txt entirely. For hard enforcement, block user-agents or IPs at your CDN/server on top of robots.txt.",
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
              title: "Putting Disallow: / under User-agent: *",
              body: "That blocks every crawler, including Google and Bing. AI blocks belong in their own group; your * group should keep Allow: /.",
            },
            {
              title: "Blocking GPTBot and assuming you're done",
              body: "Each company runs multiple crawlers under different tokens. Anthropic, OpenAI and Google each split training and search — a complete policy names each user-agent.",
            },
            {
              title: "Expecting removal from existing models",
              body: "robots.txt controls future crawling. Content already collected in past training runs is not retroactively removed.",
            },
            {
              title: "Forgetting CCBot",
              body: "Common Crawl's dataset feeds dozens of downstream model trainers. Blocking CCBot is the single highest-leverage line in the file.",
            },
          ],
        },
      ],
    },
    {
      id: "per-crawler",
      heading: "Per-crawler deep dives",
      blocks: [
        {
          kind: "p",
          content: (
            <>
              Every crawler in these examples has a dedicated guide with operator documentation,
              nuances, and FAQs — or browse the full{" "}
              <Link href="/ai-crawlers-directory" className="text-brand hover:underline">
                AI Crawler Directory
              </Link>{" "}
              to compare all of them at a glance.
            </>
          ),
        },
        {
          kind: "list",
          items: [
            <Link key="g" href="/gptbot-robots-txt" className="text-brand hover:underline">
              GPTBot — OpenAI's training crawler
            </Link>,
            <Link key="o" href="/oai-searchbot-robots-txt" className="text-brand hover:underline">
              OAI-SearchBot — ChatGPT Search
            </Link>,
            <Link key="c" href="/claudebot-robots-txt" className="text-brand hover:underline">
              ClaudeBot — Anthropic's training crawler
            </Link>,
            <Link
              key="cs"
              href="/claude-searchbot-robots-txt"
              className="text-brand hover:underline"
            >
              Claude-SearchBot — Claude's web search
            </Link>,
            <Link key="p" href="/perplexitybot-robots-txt" className="text-brand hover:underline">
              PerplexityBot — Perplexity's answer engine
            </Link>,
            <Link key="cc" href="/ccbot-robots-txt" className="text-brand hover:underline">
              CCBot — Common Crawl
            </Link>,
            <Link
              key="ge"
              href="/google-extended-robots-txt"
              className="text-brand hover:underline"
            >
              Google-Extended — Gemini training opt-out
            </Link>,
            <Link key="b" href="/crawlers/bytespider" className="text-brand hover:underline">
              Bytespider — ByteDance/TikTok
            </Link>,
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Does blocking AI crawlers hurt my Google ranking?",
      answer:
        "No. AI crawlers (GPTBot, ClaudeBot, CCBot, Google-Extended) use separate user-agents from Googlebot and Bingbot. You can block all of them and remain fully indexed and ranked in search. Google explicitly documents that Google-Extended has no effect on Search.",
    },
    {
      question: "How do I block all AI bots at once?",
      answer:
        "List each AI user-agent on its own User-agent line in a single robots.txt group, followed by Disallow: /. There is no single wildcard that means 'all AI crawlers', so a complete policy names each token — or use the AI Crawler Manager to generate the group automatically.",
    },
    {
      question: "Do AI crawlers actually obey robots.txt?",
      answer:
        "The major operators — OpenAI, Anthropic, Google, Common Crawl, Apple, Meta — document that their crawlers honor robots.txt. Bytespider has a reported history of ignoring it. robots.txt is a voluntary standard, so verify with an analyzer and use server-level blocking when compliance matters.",
    },
    {
      question: "Should I block AI search crawlers like PerplexityBot too?",
      answer:
        "It's a trade-off. AI search crawlers cite and link your pages, which can drive referral traffic. Blocking them removes you from those answers. Most sites block training crawlers and keep AI search allowed.",
    },
    {
      question: "Will blocking remove my content from ChatGPT or Claude?",
      answer:
        "Blocking prevents future crawling. It does not remove content from models that were already trained on it. The earlier you block, the less of your content enters future training runs.",
    },
  ],
  related: [
    {
      title: "AI Crawler Manager",
      href: "/ai-crawlers",
      description: "Apply any of these policies in one click.",
    },
    {
      title: "AI Crawler Directory",
      href: "/ai-crawlers-directory",
      description: "Every AI crawler compared in one table.",
    },
    {
      title: "robots.txt Examples",
      href: "/robots-txt-examples",
      description: "Complete files for common site types.",
    },
    {
      title: "Robots.txt Validator",
      href: "/validate",
      description: "Check your file before you ship it.",
    },
  ],
  nextReading: { title: "Block GPTBot in robots.txt", href: "/gptbot-robots-txt" },
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
