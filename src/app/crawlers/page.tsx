import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SeoContentLayout, type ContentPage, type ContentSection } from "@/components/content";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/config/crawlers";
import { directoryRows } from "@/config/crawler-directory";
import { itemListSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Crawler Directory: Every Web Crawler & How to Control It",
  description:
    "A complete directory of the web crawlers that visit your site — search engines (Googlebot, Bingbot), AI bots (GPTBot, ClaudeBot, Bytespider), SEO tools (AhrefsBot, SemrushBot) and more. What each does, whether it honors robots.txt, and the rules to allow or block it.",
  alternates: { canonical: "/crawlers" },
};

const REC_LABEL = { allow: "Allow", block: "Block" } as const;

const rows = directoryRows();

/** A name cell: links to the crawler's page when one exists, else plain text. */
function nameCell(name: string, href: ReturnType<typeof directoryRows>[number]["href"]) {
  if (!href) return <span className="font-medium text-foreground">{name}</span>;
  return (
    <Link href={href} className="inline-flex items-center gap-1 font-medium text-brand hover:underline">
      {name}
      <ArrowRight className="size-3" aria-hidden />
    </Link>
  );
}

/** One section per category, each a table of its crawlers. */
function categorySection(category: (typeof CATEGORY_ORDER)[number]): ContentSection | null {
  const inCategory = rows.filter((r) => r.crawler.category === category);
  if (inCategory.length === 0) return null;
  return {
    id: category,
    heading: CATEGORY_LABELS[category],
    blocks: [
      {
        kind: "table",
        head: ["Crawler", "Operator", "What it does", "Recommended"],
        rows: inCategory.map((r) => [
          nameCell(r.crawler.name, r.href),
          r.crawler.owner,
          r.crawler.description,
          REC_LABEL[r.crawler.defaultRecommendation],
        ]),
      },
    ],
  };
}

const sections: ContentSection[] = [
  {
    id: "overview",
    heading: "Every crawler that visits your site",
    blocks: [
      {
        kind: "p",
        content:
          "A web crawler is an automated bot that fetches your pages. Some build search indexes that send you traffic (Googlebot, Bingbot), some gather data to train AI models (GPTBot, ClaudeBot, Bytespider), some power SEO tools (AhrefsBot, SemrushBot), and some build social link previews. robots.txt is how you tell each one what it may access. This directory covers the crawlers worth knowing, grouped by what they do.",
      },
      {
        kind: "callout",
        status: "info",
        title: "Blocking AI and SEO crawlers does not affect your Google ranking",
        body: "Only search-engine crawlers (Googlebot, Bingbot) control your search visibility. You can block every AI and SEO crawler and remain fully indexed in Google and Bing.",
      },
      { kind: "cta", tool: "analyzer" },
    ],
  },
  ...CATEGORY_ORDER.map(categorySection).filter((s): s is ContentSection => s !== null),
  {
    id: "how-to-control",
    heading: "How to allow or block any crawler",
    blocks: [
      {
        kind: "p",
        content:
          "Every crawler is identified by a User-agent token. Add a group naming the crawler, then Disallow: / to block it everywhere or an empty Disallow: to allow it. Crawlers not named anywhere fall back to the User-agent: * group.",
      },
      {
        kind: "snippet",
        code: "# Block AI training crawlers, keep search engines\nUser-agent: GPTBot\nUser-agent: ClaudeBot\nUser-agent: CCBot\nUser-agent: Bytespider\nDisallow: /\n\nUser-agent: *\nAllow: /\n\nSitemap: https://example.com/sitemap.xml",
        caption: "Block AI training, allow search engines",
      },
      {
        kind: "callout",
        status: "warning",
        title: "robots.txt is a request, not a firewall",
        body: "Reputable crawlers obey it; some (like Bytespider) have a patchy record. Confirm a crawler is actually blocked with the Analyzer, and verify a bot's identity by reverse DNS before trusting its user-agent.",
      },
    ],
  },
];

const page: ContentPage = {
  slug: "crawlers",
  h1: "Crawler Directory",
  description:
    "Every web crawler that visits your site — search, AI, SEO, and social — with what each does, whether it honors robots.txt, and how to allow or block it.",
  heroCta: "analyzer",
  lead: (
    <>
      The complete reference to the bots that crawl the web: search engines, AI crawlers, SEO tools,
      and social preview bots. For each one — what it does, whether it respects robots.txt, and the
      exact rules to control it. To act on any of this, run the{" "}
      <Link href="/analyze" className="text-brand hover:underline">
        Analyzer
      </Link>{" "}
      or open the{" "}
      <Link href="/ai-crawlers" className="text-brand hover:underline">
        AI Crawler Manager
      </Link>
      .
    </>
  ),
  cta: "ai-manager",
  sections,
  faqs: [
    {
      question: "What is a web crawler?",
      answer:
        "A web crawler (or bot/spider) is an automated program that fetches web pages. Search engines crawl to build their index, AI companies crawl to train models or answer questions, and SEO tools crawl to map links. You control what each crawler can access using robots.txt.",
    },
    {
      question: "How do I block a specific crawler?",
      answer:
        "Add a group to your robots.txt naming the crawler's User-agent token, followed by Disallow: / to block your whole site. For example, User-agent: AhrefsBot then Disallow: /. Use an empty Disallow: to allow it.",
    },
    {
      question: "Will blocking crawlers hurt my SEO?",
      answer:
        "Only if you block search-engine crawlers like Googlebot or Bingbot. Blocking AI crawlers (GPTBot, ClaudeBot) or SEO tools (AhrefsBot, SemrushBot) has no effect on your Google or Bing rankings.",
    },
    {
      question: "How do I know a crawler is really who it claims to be?",
      answer:
        "User-agent strings can be spoofed. For major crawlers, verify the request IP with a reverse DNS lookup that forward-confirms to the operator's domain (e.g. googlebot.com), or match the operator's published IP ranges.",
    },
  ],
  related: [
    { title: "AI Crawler Directory", href: "/ai-crawlers-directory", description: "The AI crawlers in depth." },
    { title: "AI Crawler Manager", href: "/ai-crawlers", description: "Allow or block crawlers in one click." },
    { title: "Robots.txt Analyzer", href: "/analyze", description: "See who can crawl any live site." },
    { title: "Why robots.txt Is Important", href: "/why-robots-txt-is-important", description: "The case for crawler control." },
  ],
  nextReading: { title: "AI Crawler Directory", href: "/ai-crawlers-directory" },
  extraSchema: [
    itemListSchema(
      "Crawler Directory",
      rows
        .filter((r) => r.href)
        .map((r) => ({ name: r.crawler.name, path: r.href as string, description: r.crawler.description })),
    ),
  ],
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
