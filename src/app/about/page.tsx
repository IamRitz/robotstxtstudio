import type { Metadata } from "next";
import Link from "next/link";
import { TrustPageLayout, type TrustPage } from "@/components/trust-page-layout";
import { webPageSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About Robots.txt Studio",
  description:
    "Robots.txt Studio is a crawler visibility and permissions platform. Learn what it is, who it's for, and why its deterministic, RFC 9309-based analysis is built to be trustworthy and explainable.",
  alternates: { canonical: "/about" },
};

const page: TrustPage = {
  slug: "about",
  title: "About Robots.txt Studio",
  lead: (
    <>
      Robots.txt Studio is a crawler visibility and permissions platform. We turn an obscure,
      error-prone plaintext format into an explainable, testable, auditable workflow — so anyone who
      owns a website can understand and control who crawls it.
    </>
  ),
  sections: [
    {
      id: "what",
      heading: "What Robots.txt Studio is",
      blocks: [
        {
          kind: "p",
          content:
            "The robots.txt file is the control surface for crawler access, but it is not the product. The product is clarity and control over who can see your website — search engines, AI crawlers, SEO tools, and automated agents. We generate, validate, test, explain, and audit robots.txt, and we manage AI crawler permissions, with every result explained.",
        },
        {
          kind: "list",
          items: [
            <>
              <Link href="/analyze" className="text-brand hover:underline">
                Analyze
              </Link>{" "}
              — fetch and audit any live site&apos;s robots.txt with a visibility score.
            </>,
            <>
              <Link href="/generate" className="text-brand hover:underline">
                Generate
              </Link>{" "}
              and{" "}
              <Link href="/ai-crawlers" className="text-brand hover:underline">
                control AI crawlers
              </Link>{" "}
              — build a correct file and decide who may crawl.
            </>,
            <>
              <Link href="/validate" className="text-brand hover:underline">
                Validate
              </Link>
              ,{" "}
              <Link href="/url-tester" className="text-brand hover:underline">
                test URLs
              </Link>
              , and{" "}
              <Link href="/explain" className="text-brand hover:underline">
                explain
              </Link>{" "}
              — prove correctness and understand any file.
            </>,
          ],
        },
      ],
    },
    {
      id: "who",
      heading: "Who it's for",
      blocks: [
        {
          kind: "p",
          content:
            "Our users span a wide range of technical depth, united by one need: controlling crawler access to their content.",
        },
        {
          kind: "list",
          items: [
            "Website owners, bloggers, and creators who want AI companies to stop scraping their work.",
            "Developers and SaaS founders who need precise, verifiable control.",
            "SEO professionals and agencies auditing many client sites.",
            "Publishers balancing search discoverability against AI-training opt-out.",
          ],
        },
      ],
    },
    {
      id: "trust",
      heading: "Why it's built to be trusted",
      blocks: [
        {
          kind: "p",
          content:
            "Trust is the product. We never show an unexplained verdict — every result comes with a rule trace, a plain-English explanation, or an impact preview.",
        },
        {
          kind: "list",
          items: [
            "Our own deterministic parser implements the robots.txt standard (RFC 9309) — no third-party parsing library, no large language model in the core analysis.",
            "Every block, allow, and score is traceable to the exact rule that produced it.",
            "Our crawler database is a transparent config layer, compiled from each operator's published documentation.",
            "No mandatory sign-up to use any tool, and no dark-pattern monetization.",
          ],
        },
        {
          kind: "callout",
          status: "info",
          title: "How we do the analysis",
          body: (
            <>
              The exact standards, parsing rules, matching algorithm, scoring, and crawler
              classifications are documented on our{" "}
              <Link href="/methodology" className="text-brand hover:underline">
                methodology page
              </Link>
              .
            </>
          ),
        },
      ],
    },
    {
      id: "not",
      heading: "What we don't do",
      blocks: [
        {
          kind: "list",
          items: [
            "We are not a general SEO suite — no rank tracking, keyword research, or backlink selling.",
            "We do not host or serve your robots.txt; we help you create and analyze it.",
            "We are not a crawler or scraper ourselves, beyond fetching a site's own public robots.txt.",
            "We store no accounts and no personal data — see our privacy policy.",
          ],
        },
        { kind: "cta", tool: "analyzer" },
      ],
    },
  ],
  related: [
    {
      title: "Our Methodology",
      href: "/methodology",
      description: "How robots.txt analysis is performed.",
    },
    {
      title: "Crawler Directory",
      href: "/crawlers",
      description: "Every crawler we track, classified.",
    },
    { title: "Contact", href: "/contact", description: "Reach us or report an inaccuracy." },
    { title: "Privacy Policy", href: "/privacy", description: "What we process — and don't." },
  ],
  schema: [
    webPageSchema("AboutPage", {
      name: "About Robots.txt Studio",
      description:
        "Robots.txt Studio is a crawler visibility and permissions platform with deterministic, RFC 9309-based, explainable analysis.",
      path: "/about",
    }),
  ],
};

export default function Page() {
  return <TrustPageLayout page={page} />;
}
