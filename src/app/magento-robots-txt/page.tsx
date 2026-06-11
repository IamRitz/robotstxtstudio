import type { Metadata } from "next";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "Magento robots.txt: Best Practices & Example (Adobe Commerce)",
  description:
    "A practical Magento 2 / Adobe Commerce robots.txt: block faceted filters, sorting, and CMS noise, keep assets crawlable, set it in the admin, and a copy-paste example.",
  alternates: { canonical: "/magento-robots-txt" },
};

const page: ContentPage = {
  slug: "magento-robots-txt",
  h1: "Magento robots.txt",
  description:
    "A practical robots.txt for Magento 2 / Adobe Commerce that controls faceted-navigation crawl waste.",
  heroCta: "generator",
  lead: (
    <>
      Magento&apos;s biggest crawl problem is faceted navigation: filters and sort parameters
      multiply a handful of category pages into thousands of near-duplicate URLs. A well-tuned
      robots.txt is the first line of defense. Here&apos;s a practical Magento 2 setup.
    </>
  ),
  cta: "validator",
  sections: [
    {
      id: "where",
      heading: "Where to set it in Magento",
      blocks: [
        {
          kind: "p",
          content:
            "Magento 2 manages robots.txt from the admin: Content → Design → Configuration → edit your store view → Search Engine Robots. You can pick a preset and add custom instructions. On multi-store setups, set it per store view and per domain — each host needs its own correct file.",
        },
        {
          kind: "callout",
          status: "info",
          title: "Set the base URL first",
          body: "Magento builds the sitemap line from your base URL. Confirm it's the canonical https domain before generating robots.txt.",
        },
      ],
    },
    {
      id: "recommended",
      heading: "Recommended Magento robots.txt",
      blocks: [
        {
          kind: "p",
          content:
            "Block the technical directories and the parameter URLs that faceted navigation generates, keep product and category pages crawlable, and declare your sitemap. Tune the parameter list to your store's actual filters.",
        },
        {
          kind: "snippet",
          code: "User-agent: *\nDisallow: /checkout/\nDisallow: /customer/\nDisallow: /cart/\nDisallow: /catalogsearch/\nDisallow: /*?p=\nDisallow: /*?price=\nDisallow: /*?color=\nDisallow: /*?size=\nDisallow: /*?dir=\nDisallow: /*?order=\n\nSitemap: https://example.com/sitemap.xml",
          caption: "Magento 2 robots.txt (tune the parameters)",
        },
        { kind: "cta", tool: "generator" },
      ],
    },
    {
      id: "facets",
      heading: "Faceted navigation: the core issue",
      blocks: [
        {
          kind: "p",
          content:
            "Every filter combination (color + size + price + sort) is a distinct URL. Left unchecked, crawlers spend your entire budget on these instead of real products. Disallowing the parameter patterns is the blunt fix; canonical tags and proper parameter handling are the precise one. Use both.",
        },
        {
          kind: "callout",
          status: "warning",
          title: "Don't block what you want ranked",
          body: "Some filtered pages (e.g. a popular 'red running shoes' facet) may deserve indexing. robots.txt is all-or-nothing per pattern; for nuance, prefer canonicals and noindex over a broad Disallow.",
        },
      ],
    },
    {
      id: "mistakes",
      heading: "Common Magento mistakes",
      blocks: [
        {
          kind: "mistakes",
          items: [
            {
              title: "Blocking /media/, /static/, or /pub/static/",
              body: "These hold CSS, JS, and product images. Blocking them breaks rendering and image search. Keep them crawlable.",
            },
            {
              title: "Forgetting per-store-view files",
              body: "Multi-site Magento serves different robots.txt per domain. Configure each one.",
            },
            {
              title: "Relying only on robots.txt for facets",
              body: "Combine with canonical tags and URL parameter handling for clean indexing.",
            },
            {
              title: "Shipping the default sample",
              body: "Magento's example includes paths that may not match your setup. Review every line.",
            },
          ],
        },
      ],
    },
    {
      id: "verify",
      heading: "Verify the live file",
      blocks: [
        {
          kind: "p",
          content:
            "After saving, flush Magento's cache and fetch the live robots.txt — full-page cache and Varnish can serve a stale copy. Then audit it for unintended blocks.",
        },
        { kind: "cta", tool: "analyzer" },
      ],
    },
  ],
  faqs: [
    {
      question: "Where is the robots.txt file in Magento 2?",
      answer:
        "Magento 2 manages it from the admin under Content → Design → Configuration → Search Engine Robots. It's served at /robots.txt per store view, so multi-domain stores configure each one separately.",
    },
    {
      question: "How do I stop Magento faceted navigation wasting crawl budget?",
      answer:
        "Disallow the filter and sort parameter patterns (e.g. /*?color=, /*?p=, /*?order=) in robots.txt, and pair that with canonical tags and parameter handling so crawlers focus on real product and category pages.",
    },
    {
      question: "Should I block /media/ or /static/ in Magento?",
      answer:
        "No. Those directories hold CSS, JavaScript, and product images that Google needs to render pages and power image search. Blocking them can hurt rankings.",
    },
    {
      question: "What should a Magento robots.txt include?",
      answer:
        "Disallow checkout, customer, cart, and catalog search; disallow the faceted-navigation parameters your store uses; keep assets crawlable; and declare your sitemap with the canonical https URL.",
    },
  ],
  related: [
    {
      title: "Robots.txt Generator",
      href: "/generate",
      description: "Build a Magento-ready file.",
    },
    {
      title: "Shopify robots.txt",
      href: "/shopify-robots-txt",
      description: "Another ecommerce platform.",
    },
    {
      title: "robots.txt for SEO",
      href: "/robots-txt-seo-guide",
      description: "Crawl budget in depth.",
    },
    {
      title: "Robots.txt Analyzer",
      href: "/analyze",
      description: "Audit your live Magento file.",
    },
  ],
  nextReading: { title: "Next.js robots.txt", href: "/nextjs-robots-txt" },
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
