/**
 * Centralized SEO constants and JSON-LD schema builders. Pure data/functions —
 * rendered via the {@link JsonLd} component. Used site-wide (Organization, WebSite)
 * and per-page (Breadcrumb, FAQ).
 */

export const SITE = {
  url: "https://robots-txt-studio.vercel.app",
  name: "Robots.txt Studio",
  shortName: "Robots.txt Studio",
  description:
    "A modern all-in-one robots.txt toolkit: generator, validator, tester, explainer, AI crawler manager, and live checker for GPTBot, ClaudeBot, PerplexityBot and more.",
  twitter: "@robotstudio",
  locale: "en_US",
} as const;

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE.url).toString();
}

/** Organization schema (site-wide). */
export function organizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: absoluteUrl("/icon.svg"),
    description: SITE.description,
  };
}

/** WebSite schema with a SearchAction pointing at the Analyzer. */
export function websiteSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE.url}/analyze?domain={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface BreadcrumbItem {
  readonly name: string;
  readonly path: string;
}

/** BreadcrumbList schema from name/path pairs. */
export function breadcrumbSchema(items: readonly BreadcrumbItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export interface ArticleSchemaInput {
  readonly title: string;
  readonly description: string;
  readonly path: string;
  readonly datePublished: string;
  readonly dateModified: string;
  readonly authorName: string;
}

/** TechArticle schema for educational/guide pages. */
export function articleSchema(input: ArticleSchemaInput): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    mainEntityOfPage: absoluteUrl(input.path),
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    author: { "@type": "Organization", name: input.authorName, url: SITE.url },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
      logo: { "@type": "ImageObject", url: absoluteUrl("/icon.svg") },
    },
  };
}

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

/** FAQPage schema from question/answer pairs. */
export function faqSchema(items: readonly FaqItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
