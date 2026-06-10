import Link from "next/link";
import type { Route } from "next";
import { Bot } from "lucide-react";
import { BRAND } from "@/config/navigation";
import { EDU_PAGES, eduPath } from "@/config/content";

const TOOL_LINKS: ReadonlyArray<{ href: Route; label: string }> = [
  { href: "/analyze", label: "Analyze" },
  { href: "/generate", label: "Generate" },
  { href: "/validate", label: "Validate" },
  { href: "/url-tester", label: "URL Tester" },
  { href: "/ai-crawlers", label: "AI Crawlers" },
  { href: "/explain", label: "Explainer" },
];

/** Site footer: brand mark, tool + guide links, copyright. Surfaces the educational
 *  cluster site-wide so no content page is orphaned. */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-[1fr_1fr_2fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Bot className="size-3.5" />
              </span>
              <span className="text-sm font-bold text-foreground">{BRAND.name}</span>
            </div>
            <p className="mt-3 max-w-xs text-xs text-muted-foreground">
              Audit, generate, and control who can crawl your site — search engines and AI bots.
            </p>
          </div>

          <nav aria-label="Tools">
            <h2 className="text-xs font-semibold text-foreground">Tools</h2>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              {TOOL_LINKS.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="hover:text-foreground">{t.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Guides">
            <h2 className="text-xs font-semibold text-foreground">Guides</h2>
            <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-xs text-muted-foreground sm:grid-cols-2">
              {EDU_PAGES.map((p) => (
                <li key={p.slug}>
                  <Link href={eduPath(p.slug) as Route} className="hover:text-foreground">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          © {year} {BRAND.name}
        </p>
      </div>
    </footer>
  );
}
