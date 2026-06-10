"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, FileText, Globe, Megaphone, ScanSearch, ShieldCheck } from "lucide-react";
import type { AnalysisReport } from "@/types";
import { CATEGORY_LABELS } from "@/config/crawlers";
import { PageHeader } from "@/components/page-header";
import { SectionHeader } from "@/components/section-header";
import { ScoreCard } from "@/components/score-card";
import { CategoryBar } from "@/components/category-bar";
import { IssueCard } from "@/components/issue-card";
import { RecommendationCard } from "@/components/recommendation-card";
import { CodePanel } from "@/components/code-panel";
import { Callout } from "@/components/callout";
import { EmptyState } from "@/components/empty-state";
import { LoadingCard } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NextSteps, type NextStep } from "@/components/next-steps";
import type { StatusKey } from "@/components/severity";
import { trackAnalyzeCompleted, trackFetchRobots } from "@/lib/analytics";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "done"; report: AnalysisReport };

const FETCH_STATUS: Record<string, { status: StatusKey; title: string }> = {
  ok: { status: "allowed", title: "robots.txt fetched successfully" },
  "not-found": { status: "warning", title: "No robots.txt found — all crawlers are allowed" },
  "invalid-content-type": { status: "warning", title: "robots.txt is not plain text" },
  "too-large": { status: "warning", title: "robots.txt is very large — analyzed a portion" },
  timeout: { status: "blocked", title: "Fetching robots.txt timed out" },
  "network-error": { status: "blocked", title: "Could not fetch robots.txt" },
};

export function AnalyzerScreen({ initialDomain }: { initialDomain: string }) {
  const [domain, setDomain] = useState(initialDomain);
  const [state, setState] = useState<State>({ kind: "idle" });

  const run = useCallback(async (value: string) => {
    const target = value.trim();
    if (!target) return;
    setState({ kind: "loading" });
    trackFetchRobots("analyzer");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domain: target }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setState({ kind: "error", message: body?.error ?? "Analysis failed. Please try again." });
        return;
      }
      const report = (await res.json()) as AnalysisReport;
      setState({ kind: "done", report });
      trackAnalyzeCompleted({
        fetchStatus: report.fetch.status,
        visibilityScore: report.visibility.value,
        visibilityBand: report.visibility.band,
        healthScore: report.validation.health.value,
        errorCount: report.validation.counts.error,
        warningCount: report.validation.counts.warning,
        findingCount: report.findings.length,
        findingCodes: Array.from(new Set(report.findings.map((f) => f.code))),
      });
    } catch {
      setState({ kind: "error", message: "Network error. Please try again." });
    }
  }, []);

  useEffect(() => {
    if (initialDomain) void run(initialDomain);
  }, [initialDomain, run]);

  return (
    <div>
      <PageHeader
        breadcrumb={["Robots.txt Studio", "Analyze"]}
        title="Crawler Visibility Audit"
        subtitle="Analyze crawler access, AI visibility, and robots.txt issues in one report."
      />

      <Card className="mb-8 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run(domain);
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-input bg-card px-3">
            <Globe className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              aria-label="Domain to analyze"
              placeholder="Enter domain — e.g. example.com"
              className="h-10 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
            />
          </div>
          <Button type="submit" size="lg" disabled={state.kind === "loading"}>
            <ScanSearch /> {state.kind === "loading" ? "Analyzing…" : "Fetch & Analyze"}
          </Button>
        </form>
      </Card>

      {state.kind === "idle" ? (
        <EmptyState
          icon={ScanSearch}
          title="No robots.txt analyzed yet"
          description="Enter a domain above to fetch and audit its robots.txt — crawler visibility, AI access, and issues in one report."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setDomain("example.com");
                void run("example.com");
              }}
            >
              <Globe /> Try a sample (example.com)
            </Button>
          }
        />
      ) : null}

      {state.kind === "loading" ? <LoadingCard /> : null}

      {state.kind === "error" ? <ErrorState message={state.message} /> : null}

      {state.kind === "done" ? <Report report={state.report} /> : null}
    </div>
  );
}

function Report({ report }: { report: AnalysisReport }) {
  const fetchInfo = FETCH_STATUS[report.fetch.status] ?? FETCH_STATUS["network-error"]!;
  const source = report.file.source ?? report.fetch.body ?? "";

  const steps: NextStep[] = [
    {
      kind: "handoff",
      icon: ShieldCheck,
      label: "Validate this robots.txt",
      description: "Run a full syntax + best-practice check on the fetched file.",
      href: "/validate",
      text: source,
    },
    {
      kind: "handoff",
      icon: Megaphone,
      label: "Explain the findings",
      description: "See what every rule means in plain English.",
      href: "/explain",
      text: source,
    },
    {
      kind: "link",
      icon: FileText,
      label: "Fix it in the Generator",
      description: "Rebuild a clean robots.txt with guided toggles.",
      href: "/generate",
    },
  ];
  if (source.trim()) {
    steps.push({
      kind: "download",
      icon: Download,
      label: "Download robots.txt",
      description: "Save the fetched file to edit or deploy.",
      text: source,
      filename: "robots.txt",
    });
  }

  return (
    <div className="space-y-6">
      <Callout status={fetchInfo.status} title={fetchInfo.title}>
        {report.domain} · {report.fetch.finalUrl ?? report.fetch.requestedUrl}
      </Callout>

      <div className="grid gap-4 lg:grid-cols-2">
        <ScoreCard
          eyebrow="Crawler Visibility Score"
          title={`${report.visibility.band === "good" ? "High" : report.visibility.band === "moderate" ? "Moderate" : "Low"} Visibility`}
          value={report.visibility.value}
          metrics={[
            { label: "Search access", value: `${report.visibility.searchEngineAccess}%` },
            { label: "AI access", value: `${report.visibility.aiCrawlerAccess}%` },
            { label: "Error rate", value: `${report.visibility.errorRate}%` },
          ]}
        />
        <ScoreCard
          eyebrow="Robots.txt Health"
          title={`Health ${report.validation.health.band}`}
          value={report.validation.health.value}
          metrics={[
            { label: "Syntax", value: `${report.validation.health.subscores.syntax}` },
            { label: "AI config", value: `${report.validation.health.subscores.aiCrawlerConfig}` },
            { label: "Best practice", value: `${report.validation.health.subscores.bestPractices}` },
          ]}
        />
      </div>

      <Card className="p-6">
        <SectionHeader className="mb-4">Crawler breakdown</SectionHeader>
        <div className="space-y-3">
          {report.breakdown.map((b) => (
            <CategoryBar key={b.category} label={CATEGORY_LABELS[b.category]} allowed={b.allowed} blocked={b.blocked} />
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <SectionHeader className="mb-4">Audit summary</SectionHeader>
        {report.findings.length === 0 ? (
          <Callout status="allowed" title="No errors or warnings found">
            Your robots.txt looks healthy.
          </Callout>
        ) : (
          <div className="space-y-3">
            {report.findings.map((f) => (
              <IssueCard key={f.id} issue={f} />
            ))}
          </div>
        )}
      </Card>

      {report.recommendations.length > 0 ? (
        <Card className="p-6">
          <SectionHeader className="mb-4">Recommendations</SectionHeader>
          <div className="space-y-3">
            {report.recommendations.map((r) => (
              <RecommendationCard key={r.id} recommendation={r} />
            ))}
          </div>
        </Card>
      ) : null}

      {report.fetch.body ? (
        <div>
          <SectionHeader className="mb-3">Fetched robots.txt</SectionHeader>
          <CodePanel code={report.file.source ?? report.fetch.body} title={`${report.domain}/robots.txt`} />
        </div>
      ) : null}

      <NextSteps steps={steps} />
    </div>
  );
}
