import type { Metadata } from "next";
import Link from "next/link";
import { SeoContentLayout, type ContentPage, type ContentSection } from "@/components/content";
import {
  GLOSSARY,
  GLOSSARY_GROUPS,
  GROUP_ORDER,
  termsInGroup,
  type GlossaryGroup,
} from "@/config/glossary";
import { definedTermSetSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "robots.txt Glossary: Every Directive & Term Explained",
  description:
    "A plain-English glossary of robots.txt terms — User-agent, Disallow, Allow, Sitemap, Crawl-delay, wildcards, precedence, crawl budget, noindex, and AI crawlers — with definitions for each.",
  alternates: { canonical: "/robots-txt-glossary" },
};

/** A glossary group as a section: a table of term → definition, each term anchored. */
function groupSection(group: GlossaryGroup): ContentSection {
  return {
    id: group,
    heading: GLOSSARY_GROUPS[group],
    blocks: [
      {
        kind: "table",
        head: ["Term", "Definition"],
        rows: termsInGroup(group).map((t) => [
          <span key={t.slug} id={t.slug} className="scroll-mt-24 font-semibold text-foreground">
            {t.term}
          </span>,
          t.definition,
        ]),
      },
    ],
  };
}

const page: ContentPage = {
  slug: "robots-txt-glossary",
  h1: "robots.txt Glossary",
  description:
    "Definitions for every robots.txt directive, matching rule, and crawling concept — from User-agent and Disallow to crawl budget, noindex, and AI crawlers.",
  heroCta: "explainer",
  lead: (
    <>
      Every term you&apos;ll meet in a robots.txt file, defined in plain English. New to the format?
      Start with{" "}
      <Link href="/what-is-robots-txt" className="text-brand hover:underline">
        What Is robots.txt?
      </Link>{" "}
      then paste a real file into the{" "}
      <Link href="/explain" className="text-brand hover:underline">
        Explainer
      </Link>{" "}
      to see these terms in context.
    </>
  ),
  cta: "explainer",
  sections: [
    {
      id: "intro",
      heading: "How to use this glossary",
      blocks: [
        {
          kind: "p",
          content:
            "Terms are grouped into directives (the lines you write), matching and precedence (how crawlers decide what a rule covers), core concepts, and crawler types. Jump to a group from the table of contents, or read straight through.",
        },
      ],
    },
    ...GROUP_ORDER.map(groupSection),
  ],
  faqs: [
    {
      question: "What is the difference between Disallow and noindex?",
      answer:
        "Disallow (in robots.txt) stops a crawler from fetching a URL. noindex (a meta tag or HTTP header) tells a search engine not to index a page it has fetched. To deindex a page you must allow crawling and use noindex — a robots.txt block alone can leave a URL indexed without a snippet.",
    },
    {
      question: "What does the * mean in robots.txt?",
      answer:
        "It depends on where it appears. As a User-agent value (User-agent: *) it means 'all crawlers'. Inside a path (Disallow: /*.pdf) it is a wildcard matching any sequence of characters.",
    },
    {
      question: "Which rule wins when Allow and Disallow conflict?",
      answer:
        "The more specific rule — the one with the longer matching path — wins. If both match the same number of characters, Allow takes precedence over Disallow. This is how exceptions to a broad Disallow work.",
    },
  ],
  related: [
    {
      title: "robots.txt Syntax",
      href: "/robots-txt-syntax",
      description: "Directives in full detail.",
    },
    {
      title: "How Does robots.txt Work?",
      href: "/how-does-robots-txt-work",
      description: "Matching and precedence.",
    },
    {
      title: "Robots.txt Explainer",
      href: "/explain",
      description: "See these terms applied to a real file.",
    },
    {
      title: "robots.txt vs noindex",
      href: "/robots-txt-vs-noindex",
      description: "Crawling vs indexing, compared.",
    },
  ],
  nextReading: { title: "robots.txt Syntax", href: "/robots-txt-syntax" },
  extraSchema: [
    definedTermSetSchema(
      "robots.txt Glossary",
      GLOSSARY.map((t) => ({
        term: t.term,
        definition: t.definition,
        path: `/robots-txt-glossary#${t.slug}`,
      })),
    ),
  ],
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
