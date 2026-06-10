import type { Metadata } from "next";
import Link from "next/link";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "How to Read a robots.txt File",
  description:
    "Read any robots.txt line by line: identify groups, find the rules that apply to a crawler, and resolve Allow/Disallow conflicts.",
  alternates: { canonical: "/how-to-read-robots-txt" },
};

const page: ContentPage = {
  slug: "how-to-read-robots-txt",
  h1: "How to Read robots.txt",
  description: "Read any robots.txt file line by line and know exactly what it allows and blocks.",
  lead: (
    <>
      A robots.txt file can look cryptic, but it follows a predictable structure. Once you can spot
      the groups and apply the precedence rule, you can read any file — yours or a competitor's — in
      under a minute.
    </>
  ),
  cta: "explainer",
  sections: [
    {
      id: "worked-example",
      heading: "A worked example",
      blocks: [
        {
          kind: "snippet",
          code: "User-agent: *\nDisallow: /search\nDisallow: /*?\nAllow: /search/about\n\nUser-agent: GPTBot\nDisallow: /\n\nSitemap: https://example.com/sitemap.xml",
          caption: "We'll read this top to bottom",
        },
        {
          kind: "p",
          content:
            "There are two groups and one sitemap. The first group applies to all crawlers; the second applies only to GPTBot. Let's decode each.",
        },
      ],
    },
    {
      id: "step1",
      heading: "Step 1 — Find the groups",
      blocks: [
        {
          kind: "p",
          content:
            "Scan for User-agent lines. Each one starts a group. Everything until the next User-agent (ignoring blank lines and comments) belongs to that group.",
        },
        {
          kind: "list",
          items: [
            "Group 1 — User-agent: * → the default rules for any crawler without its own group.",
            "Group 2 — User-agent: GPTBot → rules just for OpenAI's GPTBot.",
            "Sitemap is file-level — it applies regardless of group.",
          ],
        },
      ],
    },
    {
      id: "step2",
      heading: "Step 2 — Pick the group for your crawler",
      blocks: [
        {
          kind: "p",
          content:
            "A crawler uses the single most specific matching group. GPTBot uses group 2. Googlebot has no named group, so it uses the wildcard group 1. This is the step people skip — and why they misread files.",
        },
        {
          kind: "callout",
          status: "warning",
          title: "Named groups don't inherit the wildcard",
          body: "Because GPTBot has its own group, it ignores group 1 entirely. Its only rule is Disallow: / — it's blocked from everything.",
        },
      ],
    },
    {
      id: "step3",
      heading: "Step 3 — Apply the rules to a URL",
      blocks: [
        {
          kind: "p",
          content:
            "Within the chosen group, find every Allow/Disallow that matches the URL, then keep the one with the longest path (Allow wins ties). For Googlebot reading group 1:",
        },
        {
          kind: "list",
          items: [
            "/search → matches Disallow: /search → blocked.",
            "/search/about → matches both Disallow: /search and Allow: /search/about; the Allow is longer → allowed.",
            "/products?color=red → matches Disallow: /*? → blocked (query strings).",
            "/about → matches nothing → allowed by default.",
          ],
        },
        {
          kind: "p",
          content: (
            <>
              That longest-match logic is covered in depth in{" "}
              <Link href="/how-does-robots-txt-work" className="text-brand hover:underline">
                how robots.txt works
              </Link>
              . To verify your reading of any specific URL, use the{" "}
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
      id: "shortcut",
      heading: "The shortcut",
      blocks: [
        {
          kind: "p",
          content:
            "Reading by hand is a great skill, but you don't have to. The Explainer turns any robots.txt into plain-English sentences — per group and per AI crawler — so you can confirm your interpretation instantly.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "How do I know which rules apply to a specific crawler?",
      answer:
        "Find the group whose User-agent best matches the crawler's name; if none match, use the User-agent: * group. A crawler only ever follows one group — it does not combine a named group with the wildcard group.",
    },
    {
      question: "What does an empty Disallow line mean?",
      answer: "Disallow: with no value places no restriction — it effectively allows everything. It's the opposite of Disallow: /, which blocks everything.",
    },
    {
      question: "How are Allow and Disallow conflicts resolved?",
      answer:
        "The rule with the longest matching path wins. If an Allow and a Disallow match the same length, the Allow (least restrictive) wins.",
    },
    {
      question: "Do comments affect how a file is read?",
      answer: "No. Everything after # is ignored by crawlers. Comments only help humans understand the file.",
    },
  ],
  related: [
    { title: "Robots.txt Explainer", href: "/explain", description: "Plain-English breakdown of any file." },
    { title: "How robots.txt works", href: "/how-does-robots-txt-work", description: "The matching algorithm." },
    { title: "robots.txt examples", href: "/robots-txt-examples", description: "Read real-world files." },
  ],
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
