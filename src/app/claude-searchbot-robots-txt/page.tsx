import type { Metadata } from "next";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "Claude-SearchBot in robots.txt: Allow or Block Claude Web Search",
  description:
    "Claude-SearchBot fetches pages so Claude can cite current web results — it doesn't train models. How it differs from ClaudeBot, and the robots.txt rules to allow or block it.",
  alternates: { canonical: "/claude-searchbot-robots-txt" },
};

const page: ContentPage = {
  slug: "claude-searchbot-robots-txt",
  h1: "Claude-SearchBot in robots.txt",
  description:
    "What Claude-SearchBot is, how it differs from ClaudeBot, and the exact robots.txt rules to allow or block Claude's web search.",
  heroCta: "ai-manager",
  lead: (
    <>
      <code className="font-mono text-foreground">Claude-SearchBot</code> is Anthropic&apos;s search
      crawler. It fetches pages so Claude can answer with current web results and cite you as the
      source. It is not the training crawler — that&apos;s ClaudeBot, and the two are decided
      separately in robots.txt.
    </>
  ),
  cta: "validator",
  sections: [
    {
      id: "what",
      heading: "What Claude-SearchBot does",
      blocks: [
        {
          kind: "p",
          content:
            "When Claude searches the web for a user, Claude-SearchBot is the crawler that retrieves the pages Claude reads and cites. Pages it can access are eligible to be quoted — with attribution — in Claude's answers. Anthropic documents it as a search crawler, distinct from ClaudeBot, which collects model-training data under its own user-agent.",
        },
        {
          kind: "table",
          head: ["Property", "Value"],
          rows: [
            [
              "User-agent",
              <code key="u" className="font-mono">
                Claude-SearchBot
              </code>,
            ],
            ["Operator", "Anthropic"],
            ["Purpose", "Fetch and cite pages for Claude's web search"],
            ["Trains AI models", "No (that's ClaudeBot)"],
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
      id: "allow-or-block",
      heading: "Should you allow or block it?",
      blocks: [
        {
          kind: "p",
          content:
            "Like other AI-search crawlers, this is a visibility trade-off rather than a content-protection question — its output cites and links you.",
        },
        {
          kind: "list",
          items: [
            "Allow it if you want Claude to cite your pages in answers — citations include your link.",
            "Block it if you want no presence in AI-generated answers, even attributed ones.",
            "Blocking ClaudeBot does NOT block Claude-SearchBot — separate user-agents, separate groups.",
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
          code: "User-agent: Claude-SearchBot\nDisallow:",
          caption: "Allow Claude-SearchBot (eligible for Claude citations)",
        },
        {
          kind: "snippet",
          code: "User-agent: Claude-SearchBot\nDisallow: /",
          caption: "Block Claude-SearchBot entirely",
        },
        {
          kind: "snippet",
          code: "# Opt out of training, stay citable in Claude's web answers\nUser-agent: ClaudeBot\nDisallow: /\n\nUser-agent: Claude-SearchBot\nDisallow:",
          caption: "The most common Anthropic policy: block training, allow search",
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
            "Confirm the rule does what you intended: run your domain through the Analyzer to see Claude-SearchBot's resolved access, or paste the file into the URL Tester and test a path against the Claude-SearchBot user-agent.",
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
              title: "Assuming ClaudeBot rules cover it",
              body: "A Disallow under User-agent: ClaudeBot has no effect on Claude-SearchBot. Each Anthropic crawler needs its own group.",
            },
            {
              title: "Blocking it to keep content out of training",
              body: "Claude-SearchBot doesn't collect training data. Blocking it removes you from Claude's cited answers without changing what trains on your content.",
            },
            {
              title: "Typos in the token",
              body: "It must be exactly Claude-SearchBot. ClaudeSearchBot or Claude-Search won't match.",
            },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What is Claude-SearchBot?",
      answer:
        "Claude-SearchBot is Anthropic's search crawler. It fetches web pages so Claude can answer questions with current information and cite the source. It is separate from ClaudeBot and is not used for model training.",
    },
    {
      question: "Does Claude-SearchBot train Claude?",
      answer:
        "No. Anthropic documents that Claude-SearchBot only retrieves pages for Claude's web search answers. Training data collection happens under the ClaudeBot user-agent, which you control separately in robots.txt.",
    },
    {
      question: "Should I block Claude-SearchBot?",
      answer:
        "Only if you don't want your pages cited in Claude's answers. Allowing it keeps you eligible for attributed citations with links, and it has no effect on AI training — many sites allow it while blocking ClaudeBot.",
    },
    {
      question: "Does Claude-SearchBot respect robots.txt?",
      answer:
        "Yes. Anthropic states that its crawlers, including Claude-SearchBot, honor robots.txt rules targeting their user-agent token.",
    },
  ],
  related: [
    {
      title: "Block ClaudeBot",
      href: "/claudebot-robots-txt",
      description: "Anthropic's training crawler — the other half of the decision.",
    },
    {
      title: "OAI-SearchBot in robots.txt",
      href: "/oai-searchbot-robots-txt",
      description: "The same decision on the OpenAI side.",
    },
    {
      title: "AI Crawler Directory",
      href: "/ai-crawlers-directory",
      description: "Every AI crawler compared.",
    },
    {
      title: "AI Crawler Manager",
      href: "/ai-crawlers",
      description: "Set the Anthropic policy with one click.",
    },
  ],
  nextReading: { title: "How to Block AI Crawlers", href: "/block-ai-crawlers" },
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
