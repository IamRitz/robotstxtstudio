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

// Trust / EEAT + legal links, surfaced site-wide in the footer base row.
const TRUST_LINKS: ReadonlyArray<{ href: Route; label: string }> = [
  { href: "/about", label: "About" },
  { href: "/methodology", label: "Methodology" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

// One entry per cluster head so every chain has a top-level link (no orphans).
const SOLUTION_LINKS: ReadonlyArray<{ href: Route; label: string }> = [
  { href: "/compare", label: "Compare robots.txt" },
  { href: "/crawlers", label: "Crawler Directory" },
  { href: "/ai-crawlers-directory", label: "AI Crawler Directory" },
  { href: "/robots-txt-templates", label: "robots.txt Templates" },
  { href: "/robots-txt-glossary", label: "robots.txt Glossary" },
  { href: "/block-ai-crawlers", label: "Block AI Crawlers" },
  { href: "/gptbot-robots-txt", label: "Block GPTBot" },
  { href: "/wordpress-robots-txt", label: "WordPress robots.txt" },
  { href: "/robots-txt-vs-noindex", label: "robots.txt vs noindex" },
  { href: "/robots-txt-sitemap", label: "robots.txt & sitemaps" },
];

/** Site footer: brand mark, tool + guide links, copyright. Surfaces the educational
 *  cluster site-wide so no content page is orphaned. */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    // Bottom padding below lg clears the fixed tab bar; safe-area covers the iOS home indicator.
    <footer className="border-t border-border pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-[1.3fr_1fr_1.2fr_2fr]">
          <div className="col-span-2 lg:col-span-1">
            <Link
              href="/"
              aria-label={`${BRAND.name} — home`}
              className="inline-flex items-center gap-2 rounded-md transition-opacity hover:opacity-80"
            >
              <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Bot className="size-3.5" />
              </span>
              <span className="text-sm font-bold text-foreground">{BRAND.name}</span>
            </Link>
            <p className="mt-3 max-w-xs text-xs text-muted-foreground">
              Audit, generate, and control who can crawl your site — search engines and AI bots.
            </p>
          </div>

          <nav aria-label="Tools">
            <h2 className="text-xs font-semibold text-foreground">Tools</h2>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              {TOOL_LINKS.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="hover:text-foreground">
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Solutions">
            <h2 className="text-xs font-semibold text-foreground">Solutions</h2>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              {SOLUTION_LINKS.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="hover:text-foreground">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Guides" className="col-span-2 lg:col-span-1">
            <h2 className="text-xs font-semibold text-foreground">Guides</h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-muted-foreground">
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

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {year} {BRAND.name}
          </p>
          <nav
            aria-label="Company"
            className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground"
          >
            {TRUST_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
