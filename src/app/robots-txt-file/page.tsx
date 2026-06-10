import type { Metadata } from "next";
import Link from "next/link";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "The robots.txt File: What Goes In It & How to Create One",
  description:
    "Where the robots.txt file lives, what it should contain, and how to create and upload one — for any stack.",
  alternates: { canonical: "/robots-txt-file" },
};

const page: ContentPage = {
  slug: "robots-txt-file",
  h1: "The robots.txt File",
  description: "Where the robots.txt file lives, what it should contain, and how to create one.",
  lead: (
    <>
      The robots.txt file is a single UTF-8 text file served from{" "}
      <code className="font-mono text-foreground">/robots.txt</code> at your domain root. This guide
      covers exactly what belongs in it, what a healthy file looks like, and how to create one
      whether you run WordPress, a static site, or a custom app.
    </>
  ),
  cta: "generator",
  sections: [
    {
      id: "location",
      heading: "Where the file must live",
      blocks: [
        {
          kind: "p",
          content:
            "Crawlers only check one location per host: the root. The file must be reachable at https://yourdomain.com/robots.txt and returned with a 2xx status and a text/plain content type.",
        },
        {
          kind: "list",
          items: [
            "https://example.com/robots.txt — correct.",
            "https://example.com/blog/robots.txt — ignored; subdirectory files don't count.",
            "https://blog.example.com/robots.txt — required separately; each subdomain has its own.",
            "http vs https and www vs non-www are different hosts — each needs its own file (usually via redirects to the canonical host).",
          ],
        },
      ],
    },
    {
      id: "contents",
      heading: "What goes in a robots.txt file",
      blocks: [
        {
          kind: "p",
          content: "A complete, healthy file usually contains four things:",
        },
        {
          kind: "list",
          ordered: true,
          items: [
            "A default group (User-agent: *) with any site-wide disallows.",
            "Optional crawler-specific groups (e.g. blocking AI training bots).",
            "A Sitemap line pointing to your XML sitemap.",
            "Comments (lines starting with #) explaining non-obvious rules.",
          ],
        },
        {
          kind: "snippet",
          code: "# Default policy\nUser-agent: *\nAllow: /\nDisallow: /cart/\nDisallow: /checkout/\n\n# Keep AI training crawlers out\nUser-agent: GPTBot\nDisallow: /\n\nSitemap: https://example.com/sitemap.xml",
          caption: "A practical robots.txt",
        },
        {
          kind: "p",
          content: (
            <>
              Not sure what to disallow for your platform? The{" "}
              <Link href="/robots-txt-examples" className="text-brand hover:underline">
                examples page
              </Link>{" "}
              has copy-paste files for blogs, WordPress, and ecommerce.
            </>
          ),
        },
      ],
    },
    {
      id: "create",
      heading: "How to create and upload it",
      blocks: [
        {
          kind: "list",
          items: [
            "Static / custom sites: create a file named robots.txt and place it in your public/web root. Next.js, Astro, and most frameworks serve files from a public directory or a generated route.",
            "WordPress: a virtual robots.txt exists by default; edit it via an SEO plugin (Yoast, Rank Math) or upload a physical file to the web root to override it.",
            "Shopify: robots.txt is generated automatically; customize it with the robots.txt.liquid template.",
          ],
        },
        {
          kind: "callout",
          status: "info",
          title: "Generate it instead of hand-writing",
          body: "The Generator builds a valid file from presets and crawler toggles, so you don't have to memorize the syntax or risk a typo that blocks your whole site.",
        },
      ],
    },
    {
      id: "validate",
      heading: "Always validate before you ship",
      blocks: [
        {
          kind: "p",
          content:
            "A single misplaced slash can deindex a site. After creating the file, validate the syntax and test a few real URLs before deploying.",
        },
        {
          kind: "p",
          content: (
            <>
              Run it through the{" "}
              <Link href="/robots-txt-checker" className="text-brand hover:underline">
                robots.txt checker
              </Link>{" "}
              and confirm a key page resolves the way you expect in the{" "}
              <Link href="/url-tester" className="text-brand hover:underline">
                URL Tester
              </Link>
              .
            </>
          ),
        },
      ],
    },
    {
      id: "mistakes",
      heading: "Common file mistakes",
      blocks: [
        {
          kind: "mistakes",
          items: [
            { title: "Wrong location", body: "Placing robots.txt anywhere but the root means it's never read." },
            { title: "Wrong content type", body: "Serving the file as text/html (e.g. a 200 HTML error page) makes crawlers ignore it." },
            { title: "BOM / wrong encoding", body: "Save as UTF-8 without a byte-order mark; some parsers mishandle a leading BOM." },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What should be in a robots.txt file?",
      answer:
        "At minimum, a User-agent: * group with any paths you want to disallow, and a Sitemap line. Add crawler-specific groups (for example, to block AI bots) as needed. If you want everything crawled, a file with just a sitemap is fine.",
    },
    {
      question: "How do I create a robots.txt file?",
      answer:
        "Create a plain-text file named exactly robots.txt, add your rules, and place it at your web root so it's served from /robots.txt. The Generator can produce a valid file for you to download.",
    },
    {
      question: "What file format and encoding should robots.txt use?",
      answer:
        "Plain text, UTF-8 encoded, served as text/plain. Line endings can be LF or CRLF. Avoid a leading byte-order mark (BOM).",
    },
    {
      question: "Can a site have more than one robots.txt file?",
      answer:
        "One per host. Each subdomain (and each protocol/host variant) is treated separately and needs its own robots.txt at its root.",
    },
  ],
  related: [
    { title: "What is robots.txt?", href: "/what-is-robots-txt", description: "Start with the basics." },
    { title: "robots.txt examples", href: "/robots-txt-examples", description: "Copy-paste files by platform." },
    { title: "robots.txt format", href: "/robots-txt-format", description: "Structure and encoding rules." },
  ],
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
