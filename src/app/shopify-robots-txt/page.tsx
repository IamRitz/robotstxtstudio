import type { Metadata } from "next";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "Shopify robots.txt: How to Edit It (robots.txt.liquid)",
  description:
    "How to customize Shopify's robots.txt with robots.txt.liquid: what Shopify blocks by default, safe edits, blocking AI crawlers, and the mistakes that hurt rankings.",
  alternates: { canonical: "/shopify-robots-txt" },
};

const page: ContentPage = {
  slug: "shopify-robots-txt",
  h1: "Shopify robots.txt",
  description:
    "How Shopify's robots.txt works, how to edit it with robots.txt.liquid, and what to change.",
  heroCta: "analyzer",
  lead: (
    <>
      Shopify generates robots.txt automatically and, for years, wouldn&apos;t let you touch it.
      Since the introduction of <code className="font-mono text-foreground">robots.txt.liquid</code>
      , you can customize it — carefully. Here&apos;s what Shopify blocks by default and what you
      should and shouldn&apos;t change.
    </>
  ),
  cta: "validator",
  sections: [
    {
      id: "default",
      heading: "What Shopify blocks by default",
      blocks: [
        {
          kind: "p",
          content:
            "Shopify ships a sensible default robots.txt. It disallows checkout, cart, account, and internal search/filter URLs to protect crawl budget and avoid duplicate content, and it declares your sitemap. For most stores, the default is genuinely good — don't change it without a reason.",
        },
        {
          kind: "list",
          items: [
            "Disallows /checkout, /cart, /account, /orders.",
            "Disallows internal search (/search) and many filtered collection URLs.",
            "Declares the Shopify-generated sitemap.xml.",
          ],
        },
      ],
    },
    {
      id: "edit",
      heading: "Editing with robots.txt.liquid",
      blocks: [
        {
          kind: "p",
          content:
            "To customize it, add a template named robots.txt.liquid under your theme (Online Store → Themes → Edit code → Templates → Add a new template → robots.txt). You can append rules or filter the defaults with Liquid. Edits apply to your primary domain's /robots.txt.",
        },
        {
          kind: "snippet",
          code: "{% comment %} Append a rule to Shopify's defaults {% endcomment %}\n{{ content_for_header }}\nUser-agent: AhrefsBot\nDisallow: /",
          caption: "robots.txt.liquid (illustrative)",
        },
        {
          kind: "callout",
          status: "warning",
          title: "Edit conservatively",
          body: "Shopify's defaults exist for good reasons. Removing the checkout/cart disallows can flood crawlers with duplicate, low-value URLs. Add rules; rarely remove them.",
        },
        { kind: "cta", tool: "analyzer" },
      ],
    },
    {
      id: "ai",
      heading: "Blocking AI crawlers on Shopify",
      blocks: [
        {
          kind: "p",
          content:
            "If you want to keep product copy and content out of AI training, append AI crawler groups in robots.txt.liquid. This is the most common legitimate reason to customize a Shopify robots.txt.",
        },
        {
          kind: "snippet",
          code: "User-agent: GPTBot\nUser-agent: ClaudeBot\nUser-agent: CCBot\nUser-agent: Google-Extended\nDisallow: /",
          caption: "AI block to append on Shopify",
        },
      ],
    },
    {
      id: "mistakes",
      heading: "Common Shopify mistakes",
      blocks: [
        {
          kind: "mistakes",
          items: [
            {
              title: "Unblocking checkout and cart",
              body: "These pages are noise for crawlers and create duplicate content. Keep Shopify's disallows.",
            },
            {
              title: "Blocking collection or product URLs you want ranked",
              body: "Over-eager filtering can hide pages you actually want indexed. Test before shipping.",
            },
            {
              title: "Editing robots.txt on a non-primary domain",
              body: "robots.txt applies per host. Make sure you're editing the canonical domain.",
            },
            {
              title: "Assuming you can't change it at all",
              body: "Outdated advice — robots.txt.liquid has allowed customization for a while.",
            },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Can you edit robots.txt on Shopify?",
      answer:
        "Yes. Add a robots.txt.liquid template to your theme to customize the generated robots.txt. You can append rules or filter Shopify's defaults with Liquid.",
    },
    {
      question: "What does Shopify block in robots.txt by default?",
      answer:
        "Shopify disallows checkout, cart, account, and internal search/filter URLs to save crawl budget and avoid duplicate content, and it declares your sitemap. The defaults are well-tuned for most stores.",
    },
    {
      question: "How do I block AI crawlers on Shopify?",
      answer:
        "Add a robots.txt.liquid template and append groups for GPTBot, ClaudeBot, CCBot, and Google-Extended with Disallow: /. This keeps your store content out of AI training without affecting search engines.",
    },
    {
      question: "Should I remove Shopify's default disallow rules?",
      answer:
        "Usually not. They prevent crawlers wasting budget on checkout, cart, and filtered URLs. Append your own rules instead of removing Shopify's, unless you have a specific, tested reason.",
    },
  ],
  related: [
    {
      title: "Robots.txt Analyzer",
      href: "/analyze",
      description: "Audit your live Shopify file.",
    },
    {
      title: "WordPress robots.txt",
      href: "/wordpress-robots-txt",
      description: "The WordPress equivalent.",
    },
    {
      title: "robots.txt for SEO",
      href: "/robots-txt-seo-guide",
      description: "Crawl budget for ecommerce.",
    },
    {
      title: "AI Crawler Manager",
      href: "/ai-crawlers",
      description: "Generate the AI block rules.",
    },
  ],
  nextReading: { title: "Magento robots.txt", href: "/magento-robots-txt" },
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
