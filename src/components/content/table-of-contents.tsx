import type { ContentSection } from "./types";

/** Sticky "On this page" anchor navigation built from the page's sections. */
export function TableOfContents({ sections }: { sections: readonly ContentSection[] }) {
  if (sections.length === 0) return null;
  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        On this page
      </p>
      <ul className="space-y-1 border-l border-border">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className="-ml-px block border-l-2 border-transparent py-0.5 pl-3 text-xs text-muted-foreground transition-colors hover:border-brand hover:text-foreground"
            >
              {s.heading}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
