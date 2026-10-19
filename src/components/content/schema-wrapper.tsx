import { JsonLd } from "@/components/json-ld";
import { AUTHOR } from "@/config/content";
import { pageDates } from "@/config/page-dates";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/seo";
import type { ContentPage } from "./types";

/** Emits Breadcrumb + TechArticle (+ FAQ) JSON-LD for a content page. */
export function SchemaWrapper({ page }: { page: ContentPage }) {
  const path = `/${page.slug}`;
  const dates = pageDates(path);
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: page.h1, path },
        ])}
      />
      <JsonLd
        data={articleSchema({
          title: page.h1,
          description: page.description,
          path,
          datePublished: dates?.published,
          dateModified: dates?.modified,
          authorName: AUTHOR.name,
        })}
      />
      {page.faqs.length > 0 ? <JsonLd data={faqSchema(page.faqs)} /> : null}
      {page.extraSchema?.map((schema, i) => (
        <JsonLd key={i} data={schema} />
      ))}
    </>
  );
}
