import type { Metadata } from "next";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "How to Block CCBot in robots.txt (Common Crawl)",
  description:
    "Block CCBot, the Common Crawl crawler that seeds many AI models, in robots.txt. Why one block stops dozens of downstream trainers, copy-paste rules, and common mistakes.",
  alternates: { canonical: "/ccbot-robots-txt" },
};

const page: ContentPage = {
  slug: "ccbot-robots-txt",
  h1: "Block CCBot in robots.txt",
  description: "What CCBot is, why blocking it has outsized impact, and the exact robots.txt rules.",
  heroCta: "ai-manager",
  lead: (
    <>
      <code className="font-mono text-foreground">CCBot</code> is Common Crawl&apos;s crawler. Its open
      dataset is one of the most widely used sources of AI training data on the internet — so a single
      CCBot block keeps your content out of many downstream models at once.
    </>
  ),
  cta: "validator",
  sections: [
    {
      id: "what",
      heading: "What CCBot does",
      blocks: [
        {
          kind: "p",
          content:
            "Common Crawl is a non-profit that publishes a free, open archive of the web. CCBot is the crawler that builds it. Because the dataset is public and enormous, countless AI labs and researchers train models on it — including many that never crawl your site directly. That makes CCBot unusually high-leverage: blocking it removes your content from a dataset that feeds dozens of downstream trainers.",
        },
        {
          kind: "table",
          head: ["Property", "Value"],
          rows: [
            ["User-agent", <code key="u" className="font-mono">CCBot</code>],
            ["Operator", "Common Crawl (non-profit)"],
            ["Purpose", "Build the open Common Crawl dataset"],
            ["Downstream use", "Training data for many third-party models"],
            ["Honors robots.txt", "Yes"],
          ],
        },
      ],
    },
    {
      id: "why",
      heading: "Why CCBot is worth a deliberate decision",
      blocks: [
        {
          kind: "callout",
          status: "info",
          title: "One block, broad effect",
          body: "Unlike blocking a single company's crawler, blocking CCBot affects every model trainer that relies on Common Crawl — which is a large share of the open ecosystem.",
        },
        {
          kind: "p",
          content:
            "The flip side: Common Crawl also powers legitimate research, search projects, and archives. Some site owners deliberately allow it to support the open web. Decide based on whether broad reuse of your content is acceptable.",
        },
        { kind: "cta", tool: "analyzer" },
      ],
    },
    {
      id: "how",
      heading: "How to block CCBot",
      blocks: [
        { kind: "p", content: "Block CCBot across your whole site:" },
        { kind: "snippet", code: "User-agent: CCBot\nDisallow: /", caption: "Block CCBot" },
        {
          kind: "p",
          content: "Most sites that block CCBot also block the major commercial training crawlers in the same file:",
        },
        {
          kind: "snippet",
          code: "User-agent: CCBot\nUser-agent: GPTBot\nUser-agent: ClaudeBot\nUser-agent: Google-Extended\nDisallow: /\n\nUser-agent: *\nAllow: /\n\nSitemap: https://example.com/sitemap.xml",
          caption: "A complete AI-training opt-out",
        },
        { kind: "p", content: "Allow CCBot explicitly with an empty Disallow:" },
        { kind: "snippet", code: "User-agent: CCBot\nDisallow:", caption: "Allow CCBot" },
      ],
    },
    {
      id: "mistakes",
      heading: "Common mistakes",
      blocks: [
        {
          kind: "mistakes",
          items: [
            { title: "Blocking GPTBot but forgetting CCBot", body: "Your content can still reach OpenAI-style models indirectly through Common Crawl. Block CCBot too for a fuller opt-out." },
            { title: "Assuming it's a search engine", body: "CCBot doesn't power a search engine. Blocking it costs you no search traffic." },
            { title: "Only blocking new training", body: "robots.txt prevents future crawls; it can't retract data already in past Common Crawl snapshots." },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: "How do I block CCBot?",
      answer: "Add User-agent: CCBot followed by Disallow: / to robots.txt. CCBot honors robots.txt, so this removes your site from future Common Crawl snapshots.",
    },
    {
      question: "Why does blocking CCBot matter so much?",
      answer: "Common Crawl's open dataset is used to train a large number of AI models. Blocking CCBot keeps your content out of that shared dataset, which affects many downstream trainers at once — not just one company.",
    },
    {
      question: "Does blocking CCBot affect SEO?",
      answer: "No. CCBot is not a search engine crawler. Blocking it has no impact on your Google or Bing rankings.",
    },
    {
      question: "Can I remove my content from past Common Crawl data?",
      answer: "robots.txt only prevents future crawling. It does not delete content already captured in earlier Common Crawl snapshots; for that you'd contact Common Crawl directly.",
    },
  ],
  related: [
    { title: "AI Crawler Directory", href: "/ai-crawlers-directory", description: "Every AI crawler compared." },
    { title: "Block GPTBot", href: "/gptbot-robots-txt", description: "OpenAI's training crawler." },
    { title: "AI Crawler Manager", href: "/ai-crawlers", description: "Block CCBot with one click." },
    { title: "robots.txt examples", href: "/robots-txt-examples", description: "Copy-paste AI-block files." },
  ],
  nextReading: { title: "AI Crawler Directory", href: "/ai-crawlers-directory" },
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
