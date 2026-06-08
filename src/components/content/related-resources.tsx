import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/section-header";
import type { RelatedLink } from "./types";

/** "Related resources" grid of internal links. */
export function RelatedResources({ related }: { related: readonly RelatedLink[] }) {
  if (related.length === 0) return null;
  return (
    <section aria-labelledby="related">
      <SectionHeader className="mb-3">
        <span id="related">Related resources</span>
      </SectionHeader>
      <div className="grid gap-4 sm:grid-cols-2">
        {related.map((r) => (
          <Link key={r.href} href={r.href} className="group">
            <Card className="h-full p-4">
              <p className="text-sm font-semibold text-foreground">{r.title}</p>
              {r.description ? (
                <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
              ) : null}
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand">
                Read <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** "Next recommended reading" banner linking to the next cluster page. */
export function NextReading({ title, href }: { title: string; href: Route }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 hover:border-brand"
    >
      <span className="min-w-0">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Next up
        </span>
        <span className="mt-0.5 block text-sm font-semibold text-foreground">{title}</span>
      </span>
      <ArrowRight className="size-4 shrink-0 text-brand" aria-hidden />
    </Link>
  );
}
