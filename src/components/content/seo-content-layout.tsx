import type { Route } from "next";
import { EDU_PAGES, eduPath } from "@/config/content";
import { AppShell } from "@/components/app-shell";
import { Breadcrumb } from "@/components/breadcrumb";
import { AuthorBox, AuthorByline } from "./author-box";
import { Blocks } from "./blocks";
import { FaqSection } from "./faq-section";
import { NextReading, RelatedResources } from "./related-resources";
import { SchemaWrapper } from "./schema-wrapper";
import { TableOfContents } from "./table-of-contents";
import { ToolCTA } from "./tool-cta";
import type { ContentPage } from "./types";

/**
 * Renders a {@link ContentPage}: schema, breadcrumb, H1 + lead, EEAT byline, a sticky
 * table of contents, the body sections, FAQ, tool CTA, related resources, and the
 * next-reading link. The single layout for every educational/SEO page (12B–12F).
 */
export function SeoContentLayout({ page }: { page: ContentPage }) {
  const index = EDU_PAGES.findIndex((p) => p.slug === page.slug);
  const autoNext = index >= 0 && index < EDU_PAGES.length - 1 ? EDU_PAGES[index + 1] : undefined;
  const next = page.nextReading ?? (autoNext ? { title: autoNext.title, href: eduPath(autoNext.slug) as Route } : undefined);

  return (
    <AppShell>
      <SchemaWrapper page={page} />
      <article className="mx-auto max-w-5xl">
        <Breadcrumb items={["Robots.txt Studio", page.h1]} className="mb-3" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{page.h1}</h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">{page.lead}</p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <AuthorByline />
          {page.heroCta ? (
            <div className="w-full sm:max-w-xs">
              <ToolCTA tool={page.heroCta} variant="compact" />
            </div>
          ) : null}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_15rem]">
          <div className="order-2 min-w-0 space-y-10 lg:order-1">
            {page.sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-20">
                <h2 className="mb-3 text-xl font-bold tracking-tight text-foreground">{s.heading}</h2>
                <Blocks blocks={s.blocks} />
              </section>
            ))}

            <FaqSection faqs={page.faqs} />
            <ToolCTA tool={page.cta} />
            <RelatedResources related={page.related} />
            {next ? <NextReading title={next.title} href={next.href} /> : null}
            <AuthorBox />
          </div>

          <aside className="order-1 lg:order-2 lg:sticky lg:top-20 lg:self-start">
            <TableOfContents sections={page.sections} />
          </aside>
        </div>
      </article>
    </AppShell>
  );
}
