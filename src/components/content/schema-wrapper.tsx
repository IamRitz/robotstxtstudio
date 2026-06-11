import { JsonLd } from "@/components/json-ld";
import { AUTHOR, CONTENT_PUBLISHED, CONTENT_UPDATED } from "@/config/content";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/seo";
import type { ContentPage } from "./types";

/** Emits Breadcrumb + TechArticle (+ FAQ) JSON-LD for a content page. */
export function SchemaWrapper({ page }: { page: ContentPage }) {
  const path = `/${page.slug}`;
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
          datePublished: CONTENT_PUBLISHED,
          dateModified: CONTENT_UPDATED,
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
