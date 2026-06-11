import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { Breadcrumb } from "@/components/breadcrumb";
import { JsonLd } from "@/components/json-ld";
import { Blocks } from "@/components/content/blocks";
import { RelatedResources } from "@/components/content/related-resources";
import type { ContentSection, RelatedLink } from "@/components/content";
import { breadcrumbSchema } from "@/lib/seo";
import { BRAND } from "@/config/navigation";

/** A trust/EEAT/legal page (About, Contact, Privacy, Terms, Methodology). */
export interface TrustPage {
  readonly slug: string;
  readonly title: string;
  readonly lead: ReactNode;
  /** ISO date shown as "Last updated" (legal pages). */
  readonly updated?: string;
  readonly sections: readonly ContentSection[];
  readonly related: readonly RelatedLink[];
  /** Page-specific JSON-LD (e.g. AboutPage / ContactPage / TechArticle). */
  readonly schema: readonly Record<string, unknown>[];
}

/**
 * Renders a trust page on the shared design system: breadcrumb, H1 + lead, optional
 * last-updated stamp, prose sections, and a related-resources block for internal
 * linking. Emits Breadcrumb JSON-LD plus the page's own schema. Narrower column than
 * the article layout (these are read top-to-bottom, no TOC).
 */
export function TrustPageLayout({ page }: { page: TrustPage }) {
  return (
    <AppShell>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: page.title, path: `/${page.slug}` },
        ])}
      />
      {page.schema.map((s, i) => (
        <JsonLd key={i} data={s} />
      ))}

      <article className="mx-auto max-w-3xl">
        <Breadcrumb items={[BRAND.name, page.title]} className="mb-3" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {page.title}
        </h1>
        <p className="mt-3 text-base text-muted-foreground">{page.lead}</p>
        {page.updated ? (
          <p className="mt-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Last updated {page.updated}
          </p>
        ) : null}

        <div className="mt-10 space-y-10">
          {page.sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-20">
              <h2 className="mb-3 text-xl font-bold tracking-tight text-foreground">{s.heading}</h2>
              <Blocks blocks={s.blocks} />
            </section>
          ))}

          <RelatedResources related={page.related} />
        </div>
      </article>
    </AppShell>
  );
}
