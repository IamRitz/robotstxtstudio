import type { Metadata } from "next";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "Robots.txt Generator — Free, No-Code Builder",
  description:
    "Generate a valid robots.txt in seconds. Pick a preset, toggle search engines and AI crawlers, add your sitemap, and copy clean output — validated as you build. Free, no sign-up.",
  alternates: { canonical: "/robots-txt-generator" },
};

const page: ContentPage = {
  slug: "robots-txt-generator",
  h1: "Robots.txt Generator",
  description:
    "Build a valid, best-practice robots.txt with presets and crawler toggles — no syntax required.",
  heroCta: "generator",
  lead: (
    <>
      Writing robots.txt by hand is easy to get subtly wrong. This generator builds a valid file
      from presets and simple toggles — search engines, AI crawlers, blocked paths, and your sitemap
      — and validates the output as you go. No sign-up, no syntax knowledge required.
    </>
  ),
  cta: "generator",
  sections: [
    {
      id: "why",
      heading: "Why use a generator",
      blocks: [
        {
          kind: "list",
          items: [
            "Avoid the costly typos — a misplaced Disallow: / can deindex a whole site.",
            "Get AI crawler rules right (GPTBot, ClaudeBot, Google-Extended) without memorizing user-agent tokens.",
            "See live validation and a plain-English explanation as you build.",
            "Start from a preset for blogs, SaaS, e-commerce, publishers, or docs.",
          ],
        },
        { kind: "cta", tool: "generator" },
      ],
    },
    {
      id: "how",
      heading: "How it works",
      blocks: [
        {
          kind: "list",
          ordered: true,
          items: [
            "Pick a preset that matches your site, or start blank.",
            "Toggle which search engines and AI crawlers may access your site.",
            "Add any paths to disallow and your sitemap URL.",
            "Copy the generated, validated robots.txt and deploy it to your site root.",
          ],
        },
      ],
    },
    {
      id: "example",
      heading: "Example output",
      blocks: [
        {
          kind: "p",
          content:
            "A typical result — allow search engines, block AI training crawlers, declare the sitemap:",
        },
        {
          kind: "snippet",
          code: "User-agent: GPTBot\nUser-agent: ClaudeBot\nUser-agent: CCBot\nUser-agent: Google-Extended\nDisallow: /\n\nUser-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: https://example.com/sitemap.xml",
          caption: "Generated robots.txt",
        },
      ],
    },
    {
      id: "use-cases",
      heading: "Common use cases",
      blocks: [
        {
          kind: "mistakes",
          items: [
            {
              title: "New site launch",
              body: "Generate a safe default that allows search engines and points to your sitemap.",
            },
            {
              title: "Opting out of AI",
              body: "Block the major AI training crawlers in one step while staying fully indexable.",
            },
            {
              title: "E-commerce crawl control",
              body: "Disallow cart, checkout, and faceted URLs to protect crawl budget.",
            },
            {
              title: "Fixing a broken file",
              body: "Rebuild cleanly instead of patching a file with conflicting rules.",
            },
          ],
        },
        {
          kind: "callout",
          status: "info",
          title: "Validate before you ship",
          body: "Every generated file is checked as you build, but it's worth a final pass in the Validator before deploying to production.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Is this robots.txt generator free?",
      answer:
        "Yes. The generator is free and requires no sign-up. Build your file, copy it, and deploy it to your site root at /robots.txt.",
    },
    {
      question: "Does the generator block AI crawlers?",
      answer:
        "Yes. You can toggle AI crawlers like GPTBot, ClaudeBot, CCBot, and Google-Extended on or off, and the generator writes the correct user-agent groups for you.",
    },
    {
      question: "Will the generated robots.txt be valid?",
      answer:
        "Yes. Output is validated as you build, so you get a syntactically correct file that follows robots.txt best practices, including an absolute sitemap URL.",
    },
    {
      question: "Where do I put the generated robots.txt?",
      answer:
        "Place it at the root of your domain so it's served at https://yourdomain.com/robots.txt. It must be at the root — crawlers don't read robots.txt from subdirectories.",
    },
  ],
  related: [
    {
      title: "AI Crawler Directory",
      href: "/ai-crawlers-directory",
      description: "Decide every AI crawler's access.",
    },
    { title: "Robots.txt Validator", href: "/validate", description: "Check an existing file." },
    {
      title: "robots.txt examples",
      href: "/robots-txt-examples",
      description: "Copy-paste templates.",
    },
    {
      title: "robots.txt syntax",
      href: "/robots-txt-syntax",
      description: "Understand each directive.",
    },
    {
      title: "AI Crawler Manager",
      href: "/ai-crawlers",
      description: "Fine-tune AI crawler access.",
    },
  ],
  nextReading: { title: "Robots.txt Validator", href: "/robots-txt-validator" },
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
