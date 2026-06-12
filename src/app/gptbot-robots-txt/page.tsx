import type { Metadata } from "next";
import Link from "next/link";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "How to Block GPTBot in robots.txt (OpenAI Crawler)",
  description:
    "Block or allow GPTBot, OpenAI's training crawler, in robots.txt. Copy-paste rules, what GPTBot does, how it differs from OAI-SearchBot, and the common mistakes.",
  alternates: { canonical: "/gptbot-robots-txt" },
};

const page: ContentPage = {
  slug: "gptbot-robots-txt",
  h1: "Block GPTBot in robots.txt",
  description:
    "What GPTBot is, why it matters, and the exact robots.txt rules to allow or block OpenAI's crawler.",
  heroCta: "ai-manager",
  lead: (
    <>
      <code className="font-mono text-foreground">GPTBot</code> is OpenAI&apos;s web crawler. It
      gathers content to train OpenAI&apos;s models. If you don&apos;t want your pages used for
      training, two lines of robots.txt stop it — without touching your Google ranking.
    </>
  ),
  cta: "validator",
  sections: [
    {
      id: "what",
      heading: "What GPTBot does",
      blocks: [
        {
          kind: "p",
          content:
            "GPTBot crawls publicly accessible pages and feeds them into the training data for OpenAI's foundation models. It is a training crawler only — it is not the bot that fetches live pages for ChatGPT Search (that's OAI-SearchBot) and it is not a search engine. Blocking GPTBot keeps your content out of future model training but does not remove you from any search results.",
        },
        {
          kind: "table",
          head: ["Property", "Value"],
          rows: [
            [
              "User-agent",
              <code key="u" className="font-mono">
                GPTBot
              </code>,
            ],
            ["Operator", "OpenAI"],
            ["Purpose", "Model training data collection"],
            ["Honors robots.txt", "Yes (per OpenAI docs)"],
            ["Affects Google ranking", "No"],
          ],
        },
        {
          kind: "p",
          content: (
            <>
              Source:{" "}
              <a
                href="https://platform.openai.com/docs/bots"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                OpenAI&apos;s crawler documentation
              </a>
              , which lists every OpenAI user-agent and its purpose.
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
          kind: "list",
          items: [
            "Content licensing — publishers who sell or license content often block training crawlers by default.",
            "Competitive risk — you may not want your proprietary writing absorbed into a model.",
            "Bandwidth — large crawls cost server resources on big sites.",
            "It's free and reversible — a robots.txt rule costs nothing and can be removed any time.",
          ],
        },
        { kind: "cta", tool: "analyzer" },
      ],
    },
    {
      id: "how",
      heading: "How to block GPTBot",
      blocks: [
        {
          kind: "p",
          content:
            "Add a group targeting the GPTBot user-agent with Disallow: / to block your whole site:",
        },
        {
          kind: "snippet",
          code: "User-agent: GPTBot\nDisallow: /",
          caption: "Block GPTBot entirely",
        },
        {
          kind: "p",
          content: "To block only part of your site, list specific paths instead:",
        },
        {
          kind: "snippet",
          code: "User-agent: GPTBot\nDisallow: /premium/\nDisallow: /members/",
          caption: "Block GPTBot from specific sections",
        },
        {
          kind: "p",
          content:
            "To explicitly allow GPTBot (the default if you say nothing), use an empty Disallow:",
        },
        { kind: "snippet", code: "User-agent: GPTBot\nDisallow:", caption: "Allow GPTBot" },
      ],
    },
    {
      id: "search",
      heading: "GPTBot vs OAI-SearchBot",
      blocks: [
        {
          kind: "p",
          content: (
            <>
              OpenAI runs two distinct crawlers. GPTBot is for training;{" "}
              <Link href="/oai-searchbot-robots-txt" className="text-brand hover:underline">
                OAI-SearchBot
              </Link>{" "}
              fetches pages to cite in ChatGPT Search and can send you referral traffic. Blocking
              one does not block the other, so decide them separately.
            </>
          ),
        },
        {
          kind: "snippet",
          code: "# Opt out of training, stay eligible for ChatGPT Search\nUser-agent: GPTBot\nDisallow: /\n\nUser-agent: OAI-SearchBot\nDisallow:",
          caption: "Block training, allow AI search",
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
              — its access matrix shows whether GPTBot resolves to Blocked while Googlebot stays
              Allowed. To trace a single URL against the GPTBot user-agent, use the{" "}
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
              title: "Blocking Googlebot by accident",
              body: "GPTBot is not Googlebot. Make sure your Disallow: / sits under User-agent: GPTBot, not User-agent: *.",
            },
            {
              title: "Assuming it deindexes content",
              body: "Blocking GPTBot stops training, not indexing. It has no effect on whether you appear in any search engine.",
            },
            {
              title: "Typos in the token",
              body: "It must be exactly GPTBot. GPT-Bot, ChatGPT, or OpenAI won't match.",
            },
            {
              title: "Forgetting OAI-SearchBot",
              body: "If your goal is to stay out of all OpenAI products, you also need to decide on OAI-SearchBot.",
            },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: "How do I block GPTBot?",
      answer:
        "Add User-agent: GPTBot followed by Disallow: / to your robots.txt. That blocks GPTBot from your entire site. OpenAI documents that GPTBot honors robots.txt.",
    },
    {
      question: "Does blocking GPTBot hurt my SEO?",
      answer:
        "No. GPTBot is OpenAI's training crawler and is completely separate from Googlebot and Bingbot. Blocking it has zero effect on your search rankings or indexing.",
    },
    {
      question: "What is the difference between GPTBot and OAI-SearchBot?",
      answer:
        "GPTBot collects training data for OpenAI's models. OAI-SearchBot fetches pages to show and cite in ChatGPT Search. They are separate user-agents, so you can block training while still allowing ChatGPT Search.",
    },
    {
      question: "Does GPTBot obey robots.txt?",
      answer:
        "Yes. OpenAI states that GPTBot respects robots.txt directives. To confirm your rule is working on a live site, run it through the Analyzer.",
    },
  ],
  related: [
    {
      title: "OAI-SearchBot in robots.txt",
      href: "/oai-searchbot-robots-txt",
      description: "OpenAI's search crawler — decide it separately.",
    },
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
      title: "AI Crawler Manager",
      href: "/ai-crawlers",
      description: "Block GPTBot with one click.",
    },
    { title: "Robots.txt Validator", href: "/validate", description: "Check your rule is valid." },
  ],
  nextReading: { title: "Block ClaudeBot in robots.txt", href: "/claudebot-robots-txt" },
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
