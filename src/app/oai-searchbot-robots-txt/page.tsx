import type { Metadata } from "next";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "OAI-SearchBot in robots.txt: Allow or Block ChatGPT Search",
  description:
    "OAI-SearchBot is OpenAI's ChatGPT Search crawler — not a training bot. What it does, how it differs from GPTBot, and the exact robots.txt rules to allow or block it.",
  alternates: { canonical: "/oai-searchbot-robots-txt" },
};

const page: ContentPage = {
  slug: "oai-searchbot-robots-txt",
  h1: "OAI-SearchBot in robots.txt",
  description:
    "What OAI-SearchBot is, how it differs from GPTBot, and the exact robots.txt rules to allow or block ChatGPT Search.",
  heroCta: "ai-manager",
  lead: (
    <>
      <code className="font-mono text-foreground">OAI-SearchBot</code> is OpenAI&apos;s search
      crawler. It fetches pages to show and cite them in ChatGPT Search — it does <em>not</em>{" "}
      collect training data. Allowing it can send you referral traffic; blocking it keeps you out of
      ChatGPT&apos;s web answers. Decide it separately from GPTBot.
    </>
  ),
  cta: "validator",
  sections: [
    {
      id: "what",
      heading: "What OAI-SearchBot does",
      blocks: [
        {
          kind: "p",
          content:
            "When ChatGPT searches the web, OAI-SearchBot is the crawler that discovers and fetches the pages ChatGPT links and cites. Pages it can access are eligible to appear — with attribution and a link — in ChatGPT Search results. OpenAI documents that it is not used to train models: training collection is GPTBot's job, under a separate user-agent you control independently.",
        },
        {
          kind: "table",
          head: ["Property", "Value"],
          rows: [
            [
              "User-agent",
              <code key="u" className="font-mono">
                OAI-SearchBot
              </code>,
            ],
            ["Operator", "OpenAI"],
            ["Purpose", "Fetch and cite pages for ChatGPT Search"],
            ["Trains AI models", "No (that's GPTBot)"],
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
              , which lists every OpenAI user-agent and what it is used for.
            </>
          ),
        },
      ],
    },
    {
      id: "allow-or-block",
      heading: "Should you allow or block it?",
      blocks: [
        {
          kind: "p",
          content:
            "This is a traffic trade-off, not a content-protection question. Unlike training crawlers, OAI-SearchBot's output links back to you.",
        },
        {
          kind: "list",
          items: [
            "Allow it if you want citations and referral clicks from ChatGPT Search — most publishers and businesses do.",
            "Block it if you don't want your pages quoted in AI answers at all, even with attribution.",
            "Blocking GPTBot does NOT block OAI-SearchBot — they are separate user-agents and separate decisions.",
          ],
        },
        { kind: "cta", tool: "ai-manager" },
      ],
    },
    {
      id: "how",
      heading: "Example robots.txt rules",
      blocks: [
        {
          kind: "snippet",
          code: "User-agent: OAI-SearchBot\nDisallow:",
          caption: "Allow OAI-SearchBot (eligible for ChatGPT Search)",
        },
        {
          kind: "snippet",
          code: "User-agent: OAI-SearchBot\nDisallow: /",
          caption: "Block OAI-SearchBot entirely",
        },
        {
          kind: "snippet",
          code: "# Opt out of training, stay visible in ChatGPT Search\nUser-agent: GPTBot\nDisallow: /\n\nUser-agent: OAI-SearchBot\nDisallow:",
          caption: "The most common OpenAI policy: block training, allow search",
        },
      ],
    },
    {
      id: "verify",
      heading: "Verify your rule works",
      blocks: [
        {
          kind: "p",
          content:
            "After editing robots.txt, confirm the rule does what you intended: run your domain through the Analyzer to see OAI-SearchBot's resolved access, or paste the file into the URL Tester and check a specific path against the OAI-SearchBot user-agent.",
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
              title: "Assuming GPTBot rules cover it",
              body: "A Disallow under User-agent: GPTBot has no effect on OAI-SearchBot. Each OpenAI crawler needs its own group.",
            },
            {
              title: "Blocking it to “protect content from AI”",
              body: "OAI-SearchBot doesn't train models. Blocking it costs you ChatGPT Search visibility without changing what trains on your content.",
            },
            {
              title: "Typos in the token",
              body: "It must be exactly OAI-SearchBot. OpenAI-SearchBot or SearchBot won't match.",
            },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What is OAI-SearchBot?",
      answer:
        "OAI-SearchBot is OpenAI's search crawler. It fetches web pages so ChatGPT Search can show and cite them, with links back to the source. It is separate from GPTBot and is not used for model training.",
    },
    {
      question: "Does OAI-SearchBot train ChatGPT?",
      answer:
        "No. OpenAI documents that OAI-SearchBot is used only to surface and link pages in ChatGPT Search. Training data collection happens under the GPTBot user-agent, which you control separately in robots.txt.",
    },
    {
      question: "Should I block OAI-SearchBot?",
      answer:
        "Only if you don't want your pages cited in ChatGPT's web answers. Allowing it can bring referral traffic, and it has no effect on what trains AI models — most sites allow it even when they block GPTBot.",
    },
    {
      question: "Does OAI-SearchBot respect robots.txt?",
      answer:
        "Yes. OpenAI states that all of its published crawlers, including OAI-SearchBot, honor robots.txt rules targeting their user-agent token.",
    },
  ],
  related: [
    {
      title: "Block GPTBot",
      href: "/gptbot-robots-txt",
      description: "OpenAI's training crawler — the other half of the decision.",
    },
    {
      title: "AI Crawler Directory",
      href: "/ai-crawlers-directory",
      description: "Every AI crawler compared.",
    },
    {
      title: "AI Crawler Manager",
      href: "/ai-crawlers",
      description: "Set the OpenAI policy with one click.",
    },
    {
      title: "Block AI crawlers (guide)",
      href: "/block-ai-crawlers",
      description: "The complete AI blocking playbook.",
    },
  ],
  nextReading: { title: "Claude-SearchBot in robots.txt", href: "/claude-searchbot-robots-txt" },
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
