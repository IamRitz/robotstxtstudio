import type { Metadata } from "next";
import Link from "next/link";
import { SeoContentLayout, type ContentPage } from "@/components/content";
import type { ContentSection } from "@/components/content";
import { AI_CRAWLERS, triLabel, type AiCrawlerEntry } from "@/config/ai-crawler-directory";

export const metadata: Metadata = {
  title: "AI Crawler Directory: GPTBot, ClaudeBot, PerplexityBot & More",
  description:
    "A directory of the AI crawlers that read your site — GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot, Bytespider and more. What each does, whether it honors robots.txt, and the exact rules to allow or block it.",
  alternates: { canonical: "/ai-crawlers-directory" },
};

const REC_STATUS = { block: "blocked", allow: "allowed", depends: "warning" } as const;
const REC_LABEL = { block: "Block", allow: "Allow", depends: "Depends" } as const;

/** Build one detail section per crawler from the directory data. */
function crawlerSection(c: AiCrawlerEntry): ContentSection {
  return {
    id: c.id,
    heading: `${c.name} — ${c.company}`,
    blocks: [
      { kind: "p", content: c.purpose },
      {
        kind: "table",
        head: ["Trains AI", "AI search", "Honors robots.txt"],
        rows: [[triLabel(c.training), triLabel(c.search), triLabel(c.honors)]],
      },
      {
        kind: "snippet",
        code: `# Block ${c.name}\nUser-agent: ${c.name}\nDisallow: /\n\n# Allow ${c.name}\nUser-agent: ${c.name}\nDisallow:`,
        caption: `${c.name} allow / block config`,
      },
      {
        kind: "callout",
        status: REC_STATUS[c.recommendation],
        title: `Recommended: ${REC_LABEL[c.recommendation]}`,
        body: c.recommendationWhy,
      },
    ],
  };
}

const page: ContentPage = {
  slug: "ai-crawlers-directory",
  h1: "AI Crawler Directory",
  description:
    "Every major AI crawler, what it does, whether it honors robots.txt, and the exact rules to allow or block it.",
  heroCta: "ai-manager",
  lead: (
    <>
      AI companies crawl your site to train models and answer questions about it. This directory lists
      the crawlers that matter, what each one actually does, whether it respects robots.txt, and the
      exact rules to allow or block it. To apply any of this in one click, use the{" "}
      <Link href="/ai-crawlers" className="text-brand hover:underline">
        AI Crawler Manager
      </Link>
      .
    </>
  ),
  cta: "validator",
  sections: [
    {
      id: "overview",
      heading: "Every AI crawler at a glance",
      blocks: [
        {
          kind: "p",
          content:
            "Two questions decide every AI crawler policy: does it use my content for training, and does it honor robots.txt? Training crawlers (GPTBot, ClaudeBot, CCBot) are the ones most sites block. AI-search crawlers (OAI-SearchBot, PerplexityBot) can send referral traffic, so blocking them is a trade-off.",
        },
        {
          kind: "table",
          head: ["Crawler", "Company", "Trains AI", "AI search", "Honors robots.txt", "Recommended"],
          rows: AI_CRAWLERS.map((c) => [
            <a key={c.id} href={`#${c.id}`} className="font-medium text-brand hover:underline">{c.name}</a>,
            c.company,
            triLabel(c.training),
            triLabel(c.search),
            triLabel(c.honors),
            REC_LABEL[c.recommendation],
          ]),
        },
        {
          kind: "callout",
          status: "info",
          title: "Blocking AI crawlers does not affect Google ranking",
          body: "Google-Extended, GPTBot and the rest are separate from Googlebot. You can block every AI training crawler and remain 100% visible in Google Search.",
        },
        { kind: "cta", tool: "analyzer" },
      ],
    },
    {
      id: "how-to-apply",
      heading: "How to allow or block any AI crawler",
      blocks: [
        {
          kind: "p",
          content:
            "Each crawler is identified by its User-agent token. Add a group for the crawler with Disallow: / to block it everywhere, or Disallow: (empty) to allow it. Multiple crawlers can share one group.",
        },
        {
          kind: "snippet",
          code: "# Block the major AI training crawlers, allow everything else\nUser-agent: GPTBot\nUser-agent: ClaudeBot\nUser-agent: CCBot\nUser-agent: Google-Extended\nDisallow: /\n\nUser-agent: *\nAllow: /\n\nSitemap: https://example.com/sitemap.xml",
          caption: "Block AI training, keep search engines",
        },
        {
          kind: "callout",
          status: "warning",
          title: "Compliance varies",
          body: "Well-behaved crawlers (OpenAI, Anthropic, Google) honor these rules. Some — like Bytespider — have a patchy record. robots.txt is a request, not an enforced firewall; verify behavior in the Analyzer.",
        },
      ],
    },
    ...AI_CRAWLERS.map(crawlerSection),
  ],
  faqs: [
    {
      question: "What is an AI crawler?",
      answer:
        "An AI crawler is a bot that fetches web pages to train an AI model or to answer questions in an AI product. Examples include OpenAI's GPTBot, Anthropic's ClaudeBot, and Perplexity's PerplexityBot. They are separate from search-engine crawlers like Googlebot.",
    },
    {
      question: "Do AI crawlers respect robots.txt?",
      answer:
        "The major operators (OpenAI, Anthropic, Google, Common Crawl) document that their crawlers honor robots.txt. Some crawlers, such as Bytespider, have been reported to ignore it. robots.txt is a voluntary standard, so use the Analyzer to confirm a crawler is actually being blocked.",
    },
    {
      question: "Should I block all AI crawlers?",
      answer:
        "Block training crawlers (GPTBot, ClaudeBot, CCBot, Google-Extended) if you don't want your content used to train models — it has no effect on search ranking. AI-search crawlers like OAI-SearchBot and PerplexityBot can drive referral traffic, so blocking those is a business trade-off, not an automatic win.",
    },
    {
      question: "Which AI crawler should I worry about most?",
      answer:
        "CCBot has the widest reach: Common Crawl's dataset feeds dozens of downstream model trainers, so one block stops many of them. GPTBot, ClaudeBot, and Google-Extended cover the largest commercial models directly.",
    },
  ],
  related: [
    { title: "AI Crawler Manager", href: "/ai-crawlers", description: "Allow or block every crawler with one click." },
    { title: "Block GPTBot", href: "/gptbot-robots-txt", description: "OpenAI's training crawler, in depth." },
    { title: "Why robots.txt is important", href: "/why-robots-txt-is-important", description: "The strategic case for crawler control." },
    { title: "Robots.txt Analyzer", href: "/analyze", description: "Confirm a crawler is really blocked." },
  ],
  nextReading: { title: "Block GPTBot in robots.txt", href: "/gptbot-robots-txt" },
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
