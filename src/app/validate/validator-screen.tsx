"use client";

import { useEffect, useMemo, useState } from "react";
import { parseRobots } from "@/parser";
import { validateRobots } from "@/features/validator";
import type { Severity } from "@/types";
import { trackValidationCompleted } from "@/lib/analytics";
import { PageHeader } from "@/components/page-header";
import { SectionHeader } from "@/components/section-header";
import { ScoreCard } from "@/components/score-card";
import { IssueCard } from "@/components/issue-card";
import { Callout } from "@/components/callout";
import { EmptyState } from "@/components/empty-state";
import { Segmented } from "@/components/segmented";
import { RobotsSourceField } from "@/components/robots-source-field";
import { Card } from "@/components/ui/card";

const SAMPLE = `User-agent: *
Allow: /
Disallow: /admin/
Crawl-delay: 0

User-agent: GPTBot
Disallow: /

Sitemap: http://example.com/sitemap.xml`;

type Filter = "all" | Severity;

export function ValidatorScreen() {
  const [text, setText] = useState(SAMPLE);
  const [filter, setFilter] = useState<Filter>("all");

  const result = useMemo(() => validateRobots(parseRobots(text)), [text]);
  const visible = result.issues.filter((i) => filter === "all" || i.severity === filter);

  // Debounced: report a validation once the user stops editing (not per keystroke).
  useEffect(() => {
    const id = setTimeout(() => {
      trackValidationCompleted({
        healthScore: result.health.value,
        healthBand: result.health.band,
        errorCount: result.counts.error,
        warningCount: result.counts.warning,
        infoCount: result.counts.info,
        issueCodes: Array.from(new Set(result.issues.map((i) => i.code))),
      });
    }, 1500);
    return () => clearTimeout(id);
  }, [result]);

  return (
    <div>
      <PageHeader
        breadcrumb={["Robots.txt Studio", "Validate"]}
        title="Validate robots.txt"
        subtitle="Diagnose issues, check crawler configuration, and get a health score."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <Card className="p-4">
          <SectionHeader className="mb-3">robots.txt content</SectionHeader>
          <RobotsSourceField value={text} onChange={setText} rows={16} />
        </Card>

        <ScoreCard
          eyebrow="Health score"
          title={`Health ${result.health.band}`}
          value={result.health.value}
          metrics={[
            { label: "Syntax", value: `${result.health.subscores.syntax}` },
            { label: "AI config", value: `${result.health.subscores.aiCrawlerConfig}` },
            { label: "Best practice", value: `${result.health.subscores.bestPractices}` },
          ]}
        />
      </div>

      <div className="mt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <SectionHeader>Issues</SectionHeader>
          <Segmented<Filter>
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All", count: result.issues.length },
              { value: "error", label: "Errors", count: result.counts.error },
              { value: "warning", label: "Warnings", count: result.counts.warning },
              { value: "info", label: "Info", count: result.counts.info },
            ]}
          />
        </div>

        {result.issues.length === 0 ? (
          <Callout status="allowed" title="No issues found">
            Your robots.txt is valid and follows best practices.
          </Callout>
        ) : visible.length === 0 ? (
          <EmptyState title="Nothing in this filter" description="No issues match the selected severity." />
        ) : (
          <div className="space-y-3">
            {visible.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
