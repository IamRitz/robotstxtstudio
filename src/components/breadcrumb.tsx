import { Fragment } from "react";
import { cn } from "@/lib/utils";

/** Uppercase, tracked breadcrumb (e.g. ROBOTS.TXT STUDIO / ANALYZE). */
export function Breadcrumb({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1.5", className)}>
      {items.map((item, i) => (
        <Fragment key={`${item}-${i}`}>
          {i > 0 ? <span className="text-xs text-border" aria-hidden>/</span> : null}
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {item}
          </span>
        </Fragment>
      ))}
    </nav>
  );
}
