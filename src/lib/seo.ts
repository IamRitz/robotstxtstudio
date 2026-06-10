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

export interface WebPageSchemaInput {
  readonly name: string;
  readonly description: string;
  readonly path: string;
  readonly dateModified?: string;
}

/**
 * Generic page schema for trust/legal pages. `type` lets a page be marked as an
 * AboutPage or ContactPage for richer entity understanding; defaults to WebPage.
 */
export function webPageSchema(
  type: "WebPage" | "AboutPage" | "ContactPage",
  input: WebPageSchemaInput,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": type,
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
  };
}

export interface SoftwareAppSchemaInput {
  readonly name: string;
  readonly description: string;
  readonly path: string;
  /** Feature bullet list for the rich result. */
  readonly features?: readonly string[];
}

/**
 * SoftwareApplication schema for the interactive tools. Marks each tool page as a
 * free web app (rich-result eligible) rather than a plain article.
 */
export function softwareAppSchema(input: SoftwareAppSchemaInput): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web Browser",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    ...(input.features && input.features.length > 0 ? { featureList: input.features } : {}),
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
  };
}

export interface HowToStep {
  readonly name: string;
  readonly text: string;
}

/** HowTo schema for step-by-step guides (rich-result eligible). */
export function howToSchema(
  name: string,
  description: string,
  steps: readonly HowToStep[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export interface ItemListEntry {
  readonly name: string;
  readonly path: string;
  readonly description?: string;
}

/** ItemList / CollectionPage schema for directory + gallery hub pages. */
export function itemListSchema(name: string, items: readonly ItemListEntry[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        url: absoluteUrl(item.path),
        ...(item.description ? { description: item.description } : {}),
      })),
    },
  };
}

export interface DefinedTerm {
  readonly term: string;
  readonly definition: string;
  /** Anchor/path the term resolves to. */
  readonly path: string;
}

/** DefinedTermSet schema for the glossary. */
export function definedTermSetSchema(name: string, terms: readonly DefinedTerm[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name,
    hasDefinedTerm: terms.map((t) => ({
      "@type": "DefinedTerm",
      name: t.term,
      description: t.definition,
      url: absoluteUrl(t.path),
    })),
  };
}
