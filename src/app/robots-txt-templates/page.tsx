import type { Metadata } from "next";
import Link from "next/link";
import { SeoContentLayout, type ContentPage, type ContentSection } from "@/components/content";
import { TEMPLATES, type RobotsTemplate } from "@/config/templates";
import { itemListSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "robots.txt Templates: Copy-Paste Files by Site Type",
  description:
    "Free, ready-to-use robots.txt templates for blogs, WordPress, e-commerce, SaaS, documentation, and blocking AI crawlers. Copy a valid file in one click, then customise it in the Generator.",
  alternates: { canonical: "/robots-txt-templates" },
};

/** One section per template: when to use it + the copy-paste file + a Generator CTA. */
function templateSection(t: RobotsTemplate): ContentSection {
  return {
    id: t.id,
    heading: t.title,
    blocks: [
      { kind: "p", content: t.description },
      { kind: "snippet", code: t.code, caption: `${t.title} — robots.txt` },
      { kind: "cta", tool: "generator" },
    ],
  };
}

const page: ContentPage = {
  slug: "robots-txt-templates",
  h1: "robots.txt Templates",
  description:
    "Copy-paste robots.txt templates for every common site type — blog, WordPress, e-commerce, SaaS, docs, and AI-blocking — then customise in the Generator.",
  heroCta: "generator",
  lead: (
    <>
      Pick a template that matches your site, copy it, and drop it at{" "}
      <code className="font-mono text-foreground">/robots.txt</code>. Every template here is valid and
      minimal — open the{" "}
      <Link href="/generate" className="text-brand hover:underline">
        Generator
      </Link>{" "}
      to tweak paths, crawlers, and your sitemap, or the{" "}
      <Link href="/validate" className="text-brand hover:underline">
        Validator
      </Link>{" "}
      to check a file you already have.
    </>
  ),
  cta: "generator",
  sections: [
    {
      id: "how-to-use",
      heading: "How to use these templates",
      blocks: [
        {
          kind: "list",
          ordered: true,
          items: [
            "Pick the template that best matches your site type below.",
            "Copy it and save it as a plain-text file named robots.txt.",
            "Replace example.com in the Sitemap line with your real domain.",
            "Upload it to the root of your site so it's served at /robots.txt.",
            "Validate it, then confirm specific URLs with the URL Tester.",
          ],
        },
        {
          kind: "callout",
          status: "warning",
          title: "Edit the sitemap line",
          body: "Every template points the Sitemap directive at example.com. Change it to your own domain (or remove the line if you don't have a sitemap yet).",
        },
        { kind: "cta", tool: "validator" },
      ],
    },
    ...TEMPLATES.map(templateSection),
  ],
  faqs: [
    {
      question: "Where do I put the robots.txt file?",
      answer:
        "robots.txt must live at the root of your domain so it's served at https://yourdomain.com/robots.txt. It only applies to the exact host and protocol it's served from — subdomains need their own file.",
    },
    {
      question: "Which robots.txt template should I use?",
      answer:
        "Start from the one matching your platform — WordPress, e-commerce, SaaS, blog, or docs. If your only goal is to keep AI companies from training on your content while staying in Google, use the 'Block AI training, keep search' template.",
    },
    {
      question: "Will these templates hurt my SEO?",
      answer:
        "No — they follow best practice. The only template that blocks search engines is 'Block everything (staging)', which is meant for non-production sites. Never deploy that one to a live site you want indexed.",
    },
    {
      question: "Can I combine templates?",
      answer:
        "Yes. The Generator lets you merge rules — for example the WordPress baseline plus the AI-blocking group — and keeps the output valid. Paste a template in and adjust from there.",
    },
  ],
  related: [
    { title: "Robots.txt Generator", href: "/generate", description: "Build a custom file with toggles." },
    { title: "robots.txt Examples", href: "/robots-txt-examples", description: "Annotated real-world files." },
    { title: "WordPress robots.txt", href: "/wordpress-robots-txt", description: "The WordPress deep-dive." },
    { title: "Robots.txt Validator", href: "/validate", description: "Check any file's health." },
  ],
  nextReading: { title: "Robots.txt Generator", href: "/generate" },
  extraSchema: [
    itemListSchema(
      "robots.txt Templates",
      TEMPLATES.map((t) => ({
        name: t.title,
        path: `/robots-txt-templates#${t.id}`,
        description: t.description,
      })),
    ),
  ],
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
