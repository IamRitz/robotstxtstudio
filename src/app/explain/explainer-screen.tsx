"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, ShieldCheck } from "lucide-react";
import { parseRobots } from "@/parser";
import { validateRobots } from "@/features/validator";
import { explainRobots } from "@/features/explainer";
import type { CrawlerAccess } from "@/types";
import { takeHandoff } from "@/lib/handoff";
import { PageHeader } from "@/components/page-header";
import { SectionHeader } from "@/components/section-header";
import { StatusBadge } from "@/components/status-badge";
import { InfoPanel } from "@/components/info-panel";
import type { StatusKey } from "@/components/severity";
import { RobotsSourceField } from "@/components/robots-source-field";
import { NextSteps, type NextStep } from "@/components/next-steps";
import { Card } from "@/components/ui/card";

const SAMPLE = `User-agent: *
Disallow: /admin/

User-agent: GPTBot
Disallow: /

Sitemap: https://example.com/sitemap.xml`;

const ACCESS_STATUS: Record<CrawlerAccess, StatusKey> = {
  allowed: "allowed",
  blocked: "blocked",
  partial: "warning",
};

export function ExplainerScreen() {
  const [text, setText] = useState(SAMPLE);

  const explanation = useMemo(() => {
    const file = parseRobots(text);
    return explainRobots(file, { validation: validateRobots(file) });
  }, [text]);

  // Load a robots.txt handed off from another tool ("Explain this").
  useEffect(() => {
    const handed = takeHandoff();
    if (handed) setText(handed);
  }, []);

  const nextSteps: NextStep[] = [
    {
      kind: "handoff",
      icon: ShieldCheck,
      label: "Validate this file",
      description: "Check it for syntax errors and best-practice warnings.",
      href: "/validate",
      text,
    },
    {
      kind: "link",
      icon: FileText,
      label: "Edit in the Generator",
      description: "Adjust crawler access with guided toggles, then export.",
      href: "/generate",
    },
  ];

  return (
    <div>
      <PageHeader
        breadcrumb={["Robots.txt Studio", "Explain"]}
        title="Explain robots.txt"
        subtitle="Translate your robots.txt into plain English — no technical knowledge required."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-4">
          <SectionHeader className="mb-3">Your robots.txt</SectionHeader>
          <RobotsSourceField value={text} onChange={setText} rows={16} />
        </Card>

        <div className="space-y-4">
          <InfoPanel title="Summary">{explanation.summary}</InfoPanel>

          {explanation.groups.length > 0 ? (
            <Card className="p-6">
              <SectionHeader className="mb-3">Rule groups</SectionHeader>
              <div className="space-y-4">
                {explanation.groups.map((g, i) => (
                  <div key={i}>
                    <p className="text-sm font-semibold text-foreground">{g.summary}</p>
                    {g.bullets.length > 0 ? (
                      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
                        {g.bullets.map((b, j) => (
                          <li key={j}>{b}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      </div>

      <Card className="mt-6 p-6">
        <SectionHeader className="mb-4">AI crawlers</SectionHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          {explanation.aiCrawlers.map((c) => (
            <div key={c.id} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{c.name}</span>
                <StatusBadge status={ACCESS_STATUS[c.access]} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">It {c.purpose}.</p>
              <p className="mt-2 text-xs text-foreground">{c.statusText}</p>
              {c.recommendation ? (
                <p className="mt-1 text-xs text-brand">{c.recommendation}</p>
              ) : null}
            </div>
          ))}
        </div>
      </Card>

      {(explanation.sitemaps.length > 0 || explanation.notes.length > 0) && (
        <Card className="mt-6 p-6">
          <SectionHeader className="mb-3">Notes</SectionHeader>
          <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            {explanation.sitemaps.map((s, i) => (
              <li key={`s-${i}`}>{s}</li>
            ))}
            {explanation.notes.map((n, i) => (
              <li key={`n-${i}`}>{n}</li>
            ))}
          </ul>
        </Card>
      )}

      <NextSteps steps={nextSteps} />
    </div>
  );
}
