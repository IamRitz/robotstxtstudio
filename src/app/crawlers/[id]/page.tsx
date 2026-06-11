import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SeoContentLayout, type ContentPage, type ContentSection } from "@/components/content";
import type { RelatedLink } from "@/components/content";
import { CATEGORY_LABELS } from "@/config/crawlers";
import {
  crawlerHref,
  crawlerProfile,
  PROFILE_IDS,
  profileCrawler,
  triLabel,
  type CrawlerProfile,
} from "@/config/crawler-directory";
import type { Crawler } from "@/types";
import { howToSchema } from "@/lib/seo";

export function generateStaticParams() {
  return PROFILE_IDS.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const crawler = profileCrawler(id);
  if (!crawler) return {};
  return {
    title: `${crawler.name} in robots.txt — What It Is & How to Block It`,
    description: `${crawler.name} (${crawler.owner}): what it does, whether it honors robots.txt, the SEO impact, and the exact rules to allow or block it.`,
    alternates: { canonical: `/crawlers/${id}` },
  };
}

const REC_STATUS = { allow: "allowed", block: "blocked", depends: "warning" } as const;
const REC_LABEL = { allow: "Allow", block: "Block", depends: "Depends" } as const;

/** Curated + computed related links: profile picks, related crawlers, hub + manager. */
function relatedLinks(profile: CrawlerProfile): RelatedLink[] {
  const out: RelatedLink[] = [...(profile.relatedLinks ?? [])];
  for (const rid of profile.relatedCrawlerIds) {
    const rc = profileCrawler(rid);
    const href = crawlerHref(rid);
    if (rc && href)
      out.push({
        title: rc.name,
        href,
        description: `${rc.owner} — ${rc.category.replace("-", " ")}.`,
      });
  }
  out.push({
    title: "Crawler Directory",
    href: "/crawlers",
    description: "Every crawler, compared.",
  });
  out.push({
    title: "AI Crawler Manager",
    href: "/ai-crawlers",
    description: "Allow or block crawlers in one click.",
  });
  // Dedupe by href, cap at 5.
  const seen = new Set<string>();
  return out.filter((l) => (seen.has(l.href) ? false : (seen.add(l.href), true))).slice(0, 5);
}

function buildSections(crawler: Crawler, profile: CrawlerProfile): ContentSection[] {
  const ua = crawler.userAgent;
  return [
    {
      id: "what",
      heading: `What ${crawler.name} is`,
      blocks: [
        { kind: "p", content: profile.summary },
        {
          kind: "table",
          head: ["Property", "Value"],
          rows: [
            [
              "User-agent",
              <code key="u" className="font-mono">
                {ua}
              </code>,
            ],
            ["Operator", crawler.owner],
            ["Category", CATEGORY_LABELS[crawler.category]],
            ["Honors robots.txt", triLabel(profile.honors)],
            ["Affects search ranking", profile.affectsRanking ? "Yes" : "No"],
          ],
        },
        ...(profile.docsUrl
          ? [
              {
                kind: "p" as const,
                content: (
                  <>
                    Official documentation:{" "}
                    <a
                      href={profile.docsUrl}
                      className="text-brand hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {crawler.owner} crawler docs
                    </a>
                    .
                  </>
                ),
              },
            ]
          : []),
      ],
    },
    {
      id: "does",
      heading: `What ${crawler.name} does`,
      blocks: [{ kind: "list", items: profile.whatItDoes }],
    },
    {
      id: "why",
      heading: "Why site owners care",
      blocks: [
        { kind: "list", items: profile.whyItMatters },
        { kind: "cta", tool: "analyzer" },
      ],
    },
    {
      id: "control",
      heading: `How to allow or block ${crawler.name}`,
      blocks: [
        {
          kind: "p",
          content: `Add a group targeting the ${ua} user-agent. Disallow: / blocks it from your whole site; an empty Disallow: allows it.`,
        },
        {
          kind: "snippet",
          code: `User-agent: ${ua}\nDisallow: /`,
          caption: `Block ${crawler.name}`,
        },
        { kind: "snippet", code: `User-agent: ${ua}\nDisallow:`, caption: `Allow ${crawler.name}` },
        {
          kind: "callout",
          status: profile.affectsRanking ? "warning" : "info",
          title: profile.affectsRanking
            ? "This crawler affects your search ranking"
            : "No effect on search ranking",
          body: profile.affectsRankingNote,
        },
      ],
    },
    {
      id: "verify",
      heading: `How to verify ${crawler.name}`,
      blocks: [
        { kind: "p", content: profile.verify },
        {
          kind: "callout",
          status: "info",
          title: "Does it honor robots.txt?",
          body: profile.honorsNote,
        },
      ],
    },
    {
      id: "recommendation",
      heading: "Recommendation",
      blocks: [
        {
          kind: "callout",
          status: REC_STATUS[profile.recommendation],
          title: `Recommended: ${REC_LABEL[profile.recommendation]}`,
          body: profile.recommendationWhy,
        },
      ],
    },
  ];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const crawler = profileCrawler(id);
  const profile = crawlerProfile(id);
  if (!crawler || !profile) notFound();

  const page: ContentPage = {
    slug: `crawlers/${id}`,
    h1: `${crawler.name} in robots.txt`,
    description: `What ${crawler.name} is, whether it honors robots.txt, and the rules to allow or block it.`,
    heroCta: "ai-manager",
    lead: (
      <>
        <code className="font-mono text-foreground">{crawler.userAgent}</code> is {crawler.owner}
        &apos;s crawler. Here&apos;s exactly what it does, whether it respects robots.txt, and the
        rules to control it. To apply a policy in one click, use the{" "}
        <Link href="/ai-crawlers" className="text-brand hover:underline">
          AI Crawler Manager
        </Link>
        .
      </>
    ),
    cta: profile.recommendation === "allow" ? "validator" : "ai-manager",
    sections: buildSections(crawler, profile),
    faqs: profile.faqs,
    related: relatedLinks(profile),
    nextReading: { title: "Crawler Directory", href: "/crawlers" },
    extraSchema: [
      howToSchema(
        `How to block ${crawler.name} in robots.txt`,
        `Stop ${crawler.name} (${crawler.owner}) from crawling your site by adding a rule to your robots.txt file.`,
        [
          {
            name: "Open robots.txt",
            text: "Open (or create) the robots.txt file at the root of your domain, e.g. https://example.com/robots.txt.",
          },
          {
            name: "Add the crawler group",
            text: `Add a new line: User-agent: ${crawler.userAgent}`,
          },
          {
            name: "Disallow the crawler",
            text: "On the next line add Disallow: / to block your entire site, or list specific paths to block only those.",
          },
          {
            name: "Verify the rule",
            text: "Save the file and confirm the crawler is blocked using the Robots.txt Analyzer or URL Tester.",
          },
        ],
      ),
    ],
  };

  return <SeoContentLayout page={page} />;
}
