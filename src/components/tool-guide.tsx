import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Block } from "@/components/content/blocks";
import { FaqSection } from "@/components/content/faq-section";
import { CodePanel } from "@/components/code-panel";
import { JsonLd } from "@/components/json-ld";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import type { ToolGuide } from "@/config/tool-guides";
import { faqSchema } from "@/lib/seo";

/**
 * Server-rendered explanation below a tool (SEO recovery, 2026-10). The tool pages
 * are the canonical URLs for their queries, so the page has to explain itself in
 * HTML — not only in the interactive app. FAQ JSON-LD mirrors the visible FAQ.
 */
export function ToolGuideSection({ guide }: { guide: ToolGuide }) {
  return (
    <section aria-labelledby="tool-guide" className="mt-12 border-t border-border pt-8">
      <h2 id="tool-guide" className="text-xl font-bold tracking-tight text-foreground">
        {guide.heading}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">{guide.intro}</p>

      <div className="mt-6 max-w-3xl space-y-8">
        {guide.sections.map((s) => (
          <div key={s.id} id={s.id} className="scroll-mt-20 space-y-3">
            <h3 className="text-base font-semibold text-foreground">{s.heading}</h3>
            {s.paragraphs?.map((p, i) => (
              <Block key={i} block={{ kind: "p", content: p }} />
            ))}
            {s.bullets ? <Block block={{ kind: "list", items: s.bullets }} /> : null}
            {s.table ? (
              <Block block={{ kind: "table", head: s.table.head, rows: s.table.rows }} />
            ) : null}
          </div>
        ))}

        {guide.traces && guide.traces.length > 0 ? (
          <div id="worked-examples" className="scroll-mt-20 space-y-3">
            <h3 className="text-base font-semibold text-foreground">Worked examples</h3>
            <p className="text-sm leading-7 text-muted-foreground">
              Each result below is produced by this tester; paste any of them above to see the full
              trace.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {guide.traces.map((t) => (
                <Card key={t.title} className="space-y-2 p-4">
                  <p className="text-sm font-semibold text-foreground">{t.title}</p>
                  <CodePanel code={t.robots} title="robots.txt" />
                  <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <code className="font-mono text-foreground">{t.url}</code> for{" "}
                    <code className="font-mono text-foreground">{t.agent}</code>
                    <StatusBadge status={t.expected} />
                  </p>
                  <p className="text-xs leading-6 text-muted-foreground">
                    {t.decidedBy ? (
                      <>
                        Decided by <code className="font-mono">{t.decidedBy}</code>.{" "}
                      </>
                    ) : (
                      "No rule matches. "
                    )}
                    {t.why}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        ) : null}

        {guide.findings && guide.findings.length > 0 ? (
          <div id="worked-examples" className="scroll-mt-20 space-y-3">
            <h3 className="text-base font-semibold text-foreground">What it catches: examples</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {guide.findings.map((f) => (
                <Card key={f.title} className="space-y-2 p-4">
                  <p className="text-sm font-semibold text-foreground">{f.title}</p>
                  <CodePanel code={f.robots} title="robots.txt" />
                  <p className="text-xs leading-6 text-muted-foreground">{f.fix}</p>
                </Card>
              ))}
            </div>
          </div>
        ) : null}

        <JsonLd data={faqSchema(guide.faqs)} />
        <FaqSection faqs={guide.faqs} />

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">Next steps</h3>
            <ul className="space-y-2">
              {guide.next.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="group text-sm font-medium text-brand hover:underline"
                  >
                    {n.title}
                    <ArrowRight
                      className="ml-1 inline size-3 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Link>
                  <span className="block text-xs text-muted-foreground">{n.why}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">Sources</h3>
            <ul className="space-y-2 text-xs">
              {guide.sources.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    rel="noopener"
                    className="text-muted-foreground hover:text-foreground hover:underline"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
