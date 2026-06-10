import type { Metadata } from "next";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "WordPress robots.txt: Best Practices & Example",
  description:
    "The right robots.txt for WordPress: what to disallow, why you must keep admin-ajax.php and assets crawlable, virtual vs static files, AI crawlers, and a copy-paste example.",
  alternates: { canonical: "/wordpress-robots-txt" },
};

const page: ContentPage = {
  slug: "wordpress-robots-txt",
  h1: "WordPress robots.txt",
  description: "A practical, correct robots.txt for WordPress — with the mistakes most plugins still get wrong.",
  heroCta: "generator",
  lead: (
    <>
      WordPress generates a virtual robots.txt by default, and most SEO plugins let you edit it. The
      defaults are mostly fine — but a few stubborn mistakes (blocking <code className="font-mono text-foreground">/wp-content/</code>,
      breaking admin-ajax) still cause real damage. Here&apos;s the version that works.
    </>
  ),
  cta: "validator",
  sections: [
    {
      id: "virtual",
      heading: "Virtual vs static robots.txt",
      blocks: [
        {
          kind: "p",
          content:
            "If no physical robots.txt exists in your site root, WordPress serves a virtual one dynamically. The moment you upload a real robots.txt file (or an SEO plugin writes one), that static file takes over. Know which one you're editing — editing the virtual file's filters in code has no effect once a static file exists.",
        },
        {
          kind: "callout",
          status: "info",
          title: "Plugins usually win",
          body: "Yoast, Rank Math, and All in One SEO write or override robots.txt. Edit it through your plugin's tools rather than fighting it with a static upload.",
        },
      ],
    },
    {
      id: "recommended",
      heading: "Recommended WordPress robots.txt",
      blocks: [
        {
          kind: "p",
          content:
            "Block the admin area, but explicitly allow admin-ajax.php (themes and plugins call it on the front end) and never block wp-content — Google needs your CSS, JS, and images to render and rank pages.",
        },
        {
          kind: "snippet",
          code: "User-agent: *\nDisallow: /wp-admin/\nAllow: /wp-admin/admin-ajax.php\n\nSitemap: https://example.com/wp-sitemap.xml",
          caption: "Recommended WordPress robots.txt",
        },
        { kind: "cta", tool: "generator" },
      ],
    },
    {
      id: "mistakes",
      heading: "Common WordPress mistakes",
      blocks: [
        {
          kind: "mistakes",
          items: [
            { title: "Disallow: /wp-content/", body: "This blocks your CSS, JS, and images. Google renders pages — broken rendering can tank rankings. Never block it." },
            { title: "Blocking admin-ajax.php", body: "Many front-end features (lazy load, filters, add-to-cart) use it. Always Allow: /wp-admin/admin-ajax.php." },
            { title: "Disallowing /wp-includes/", body: "Old advice that blocks core scripts needed for rendering. Drop it." },
            { title: "Leaving the staging block live", body: "WordPress under development often ships Disallow: / — confirm production doesn't." },
            { title: "Using Disallow to hide /wp-admin/ for security", body: "robots.txt is public and advertises the path. Security comes from authentication, not Disallow." },
          ],
        },
      ],
    },
    {
      id: "ai",
      heading: "AI crawlers on WordPress",
      blocks: [
        {
          kind: "p",
          content:
            "Publishers and bloggers increasingly opt out of AI training. WordPress doesn't do this for you — add the AI crawler groups yourself, above the catch-all group:",
        },
        {
          kind: "snippet",
          code: "User-agent: GPTBot\nUser-agent: ClaudeBot\nUser-agent: CCBot\nUser-agent: Google-Extended\nDisallow: /\n\nUser-agent: *\nDisallow: /wp-admin/\nAllow: /wp-admin/admin-ajax.php\n\nSitemap: https://example.com/wp-sitemap.xml",
          caption: "WordPress robots.txt that also blocks AI training",
        },
      ],
    },
    {
      id: "verify",
      heading: "Verify before you trust it",
      blocks: [
        {
          kind: "p",
          content:
            "WordPress caching and CDNs can serve a stale robots.txt. After editing, fetch the live file and confirm it matches what you intended — then spot-test a key URL.",
        },
        { kind: "cta", tool: "analyzer" },
      ],
    },
  ],
  faqs: [
    {
      question: "What is the best robots.txt for WordPress?",
      answer: "Disallow /wp-admin/, explicitly Allow /wp-admin/admin-ajax.php, leave wp-content crawlable, and declare your sitemap. Add AI crawler groups if you want to opt out of model training.",
    },
    {
      question: "Should I block wp-content in robots.txt?",
      answer: "No. wp-content holds your themes' CSS and JavaScript and your images. Google needs them to render and evaluate pages, so blocking wp-content can hurt rankings.",
    },
    {
      question: "Where is the WordPress robots.txt file?",
      answer: "By default WordPress serves a virtual robots.txt at /robots.txt with no physical file. If you or an SEO plugin create a real file in the site root, that static file replaces the virtual one.",
    },
    {
      question: "How do I edit robots.txt in WordPress?",
      answer: "Use your SEO plugin (Yoast, Rank Math, All in One SEO) which provides a robots.txt editor, or upload a static robots.txt to the site root. Avoid doing both, since the static file overrides the plugin.",
    },
  ],
  related: [
    { title: "Robots.txt Generator", href: "/generate", description: "Build a WordPress-ready file." },
    { title: "robots.txt examples", href: "/robots-txt-examples", description: "More copy-paste templates." },
    { title: "Shopify robots.txt", href: "/shopify-robots-txt", description: "The ecommerce equivalent." },
    { title: "Robots.txt Validator", href: "/validate", description: "Check your file is correct." },
  ],
  nextReading: { title: "Shopify robots.txt", href: "/shopify-robots-txt" },
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
