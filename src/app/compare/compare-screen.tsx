"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { buildComparison } from "@/features/compare";
import type { CrawlerAccessDelta, ScoreDelta } from "@/types";
import { takeHandoff } from "@/lib/handoff";
import { PageHeader } from "@/components/page-header";
import { SectionHeader } from "@/components/section-header";
import { RobotsSourceField } from "@/components/robots-source-field";
import { StatusBadge } from "@/components/status-badge";
import { DiffView } from "@/components/diff-view";
import { Callout } from "@/components/callout";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SAMPLE_A = `User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml`;

const SAMPLE_B = `User-agent: *
Allow: /

User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Google-Extended
Disallow: /

Sitemap: https://example.com/sitemap.xml`;

/** A before → after stat with a signed, colored delta. */
function DeltaStat({ d }: { d: ScoreDelta }) {
  const tone =
    d.delta > 0
      ? "text-status-allowed-fg"
      : d.delta < 0
        ? "text-status-blocked-fg"
        : "text-muted-foreground";
  const Icon = d.delta > 0 ? TrendingUp : d.delta < 0 ? TrendingDown : Minus;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{d.label}</p>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="font-mono text-sm tabular-nums text-muted-foreground">{d.before}</span>
        <ArrowRight className="size-3 text-muted-foreground" aria-hidden />
        <span className="font-mono text-lg font-bold tabular-nums text-foreground">{d.after}</span>
        <span
          className={cn(
            "ml-auto inline-flex items-center gap-1 font-mono text-xs font-semibold tabular-nums",
            tone,
          )}
        >
          <Icon className="size-3" aria-hidden />
          {d.delta > 0 ? `+${d.delta}` : d.delta}
        </span>
      </div>
    </div>
  );
}

/** A → B access row with two status badges. */
function AccessRow({ row }: { row: CrawlerAccessDelta }) {
  return (
    <li className={cn("flex items-center gap-3 px-3 py-2", row.changed && "bg-muted/50")}>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
        {row.name}
      </span>
      <StatusBadge status={row.before === "allowed" ? "allowed" : "blocked"} />
      <ArrowRight
        className={cn(
          "size-3 shrink-0",
          row.changed ? "text-foreground" : "text-muted-foreground/40",
        )}
        aria-hidden
      />
      <StatusBadge status={row.after === "allowed" ? "allowed" : "blocked"} />
    </li>
  );
}

export function CompareScreen() {
  const [textA, setTextA] = useState(SAMPLE_A);
  const [textB, setTextB] = useState(SAMPLE_B);

  // A "Compare this" handoff (e.g. from the Analyzer) prefills side A.
  useEffect(() => {
    const handed = takeHandoff();
    if (handed) setTextA(handed);
  }, []);

  const cmp = useMemo(() => buildComparison(textA, textB), [textA, textB]);
  const otherChanges = cmp.crawlerChanges.filter(
    (r) => r.category !== "ai-training" && r.category !== "ai-search",
  );

  return (
    <div>
      <PageHeader
        breadcrumb={["Robots.txt Studio", "Compare"]}
        title="Compare robots.txt"
        subtitle="Diff two sites (or two versions): score changes, findings fixed or introduced, and per-crawler visibility — including a dedicated AI-crawler report."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <SectionHeader className="mb-3">Site A (before)</SectionHeader>
          <RobotsSourceField
            value={textA}
            onChange={setTextA}
            rows={10}
            label="Site A robots.txt"
          />
        </Card>
        <Card className="p-4">
          <SectionHeader className="mb-3">Site B (after)</SectionHeader>
          <RobotsSourceField
            value={textB}
            onChange={setTextB}
            rows={10}
            label="Site B robots.txt"
          />
        </Card>
      </div>

      {cmp.identical ? (
        <Callout status="info" title="The two files are identical" className="mt-6">
          Paste or fetch a different robots.txt on either side to see the comparison.
        </Callout>
      ) : (
        <div className="mt-8 space-y-8">
          {/* Score deltas */}
          <section>
            <SectionHeader className="mb-3">Score changes (A → B)</SectionHeader>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <DeltaStat d={cmp.overall} />
              <DeltaStat d={cmp.visibility} />
              {cmp.dimensions.map((d) => (
                <DeltaStat key={d.key} d={d} />
              ))}
            </div>
          </section>

          {/* AI crawler visibility — first-class */}
          <section>
            <SectionHeader className="mb-3">AI crawler visibility (A → B)</SectionHeader>
            <Card className="overflow-hidden">
              <ul className="divide-y divide-border">
                {cmp.aiCrawlers.map((row) => (
                  <AccessRow key={row.id} row={row} />
                ))}
              </ul>
            </Card>
          </section>

          {/* Other visibility changes */}
          {otherChanges.length > 0 ? (
            <section>
              <SectionHeader className="mb-3">Other visibility changes</SectionHeader>
              <Card className="overflow-hidden">
                <ul className="divide-y divide-border">
                  {otherChanges.map((row) => (
                    <AccessRow key={row.id} row={row} />
                  ))}
                </ul>
              </Card>
            </section>
          ) : null}

          {/* Findings resolved / added */}
          <section className="grid gap-4 lg:grid-cols-2">
            <div>
              <SectionHeader className="mb-3">Findings resolved</SectionHeader>
              <Card className="p-4">
                {cmp.findingsResolved.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No findings resolved.</p>
                ) : (
                  <ul className="space-y-2">
                    {cmp.findingsResolved.map((f) => (
                      <li key={f.code} className="flex items-baseline gap-2 text-xs">
                        <span className="text-status-allowed-fg" aria-hidden>
                          ✓
                        </span>
                        <span className="text-foreground">{f.title}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
            <div>
              <SectionHeader className="mb-3">Findings introduced</SectionHeader>
              <Card className="p-4">
                {cmp.findingsAdded.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No new findings.</p>
                ) : (
                  <ul className="space-y-2">
                    {cmp.findingsAdded.map((f) => (
                      <li key={f.code} className="flex items-baseline gap-2 text-xs">
                        <span className="text-status-blocked-fg" aria-hidden>
                          +
                        </span>
                        <span className="text-foreground">{f.title}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </section>

          {/* Raw text diff */}
          <section>
            <SectionHeader className="mb-3">File diff</SectionHeader>
            <DiffView before={textA} after={textB} />
          </section>
        </div>
      )}
    </div>
  );
}
