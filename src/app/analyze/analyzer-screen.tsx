"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Download,
  FileText,
  GitCompare,
  Globe,
  Megaphone,
  ScanSearch,
  Undo2,
  Wand2,
} from "lucide-react";
import { parseRobots } from "@/parser";
import {
  applyTextEdits,
  buildAudit,
  collectSafeEdits,
  fixImpact,
  safelyFixableIssues,
  validateRobots,
} from "@/features/validator";
import { computeBreakdown, computeVisibility, buildRecommendations } from "@/features/live-checker";
import { isAllowed } from "@/features/tester";
import { CATEGORY_LABELS, CATEGORY_ORDER, crawlersByCategory } from "@/config/crawlers";
import type { AnalysisReport, Crawler, ScoreDimension, TextEdit, ValidationIssue } from "@/types";
import { PageHeader } from "@/components/page-header";
import { SectionHeader } from "@/components/section-header";
import { ScoreCard } from "@/components/score-card";
import { AuditDashboard } from "@/components/audit-dashboard";
import { IssueCard } from "@/components/issue-card";
import { DiffView } from "@/components/diff-view";
import { CrawlerBadge } from "@/components/crawler-badge";
import { StatusBadge } from "@/components/status-badge";
import { RecommendationCard } from "@/components/recommendation-card";
import { Callout } from "@/components/callout";
import { EmptyState } from "@/components/empty-state";
import { LoadingCard } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { NextSteps, type NextStep } from "@/components/next-steps";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

const DIM_SHORT: Record<ScoreDimension, string> = {
  syntax: "Syntax",
  seo: "SEO",
  ai: "AI",
  maintainability: "Maint.",
  security: "Security",
};

function downloadText(text: string, filename = "robots.txt") {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** "Recovers SEO +10 · Overall +3" for a fixable issue, else null. */
function impactLabel(issue: ValidationIssue): string | null {
  if (!(issue.fix?.edits?.length ?? 0)) return null;
  const { dimensions, overall } = fixImpact(issue);
  if (dimensions.length === 0) return null;
  const parts = dimensions.map((h) => `${DIM_SHORT[h.dimension]} +${h.points}`);
  return `Recovers ${parts.join(" · ")}${overall > 0 ? ` · Overall +${overall}` : ""}`;
}

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
        subtitle="Audit any live site, then fix its robots.txt and download the corrected file — all in one place."
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

      {state.kind === "done" ? <Report key={state.report.fetchedAt} report={state.report} /> : null}
    </div>
  );
}

/** Per-category, per-crawler visibility breakdown (collapsible). */
function CrawlerBreakdown({ file }: { file: ReturnType<typeof parseRobots> }) {
  const categories = useMemo(
    () =>
      CATEGORY_ORDER.map((category) => {
        const crawlers = crawlersByCategory(category).map((crawler: Crawler) => ({
          crawler,
          allowed: isAllowed(file, "/", crawler.userAgent),
        }));
        const allowed = crawlers.filter((c) => c.allowed).length;
        return { category, crawlers, allowed, total: crawlers.length };
      }),
    [file],
  );

  return (
    <Card className="p-6">
      <SectionHeader className="mb-4">Crawler visibility — by crawler</SectionHeader>
      <div className="space-y-2">
        {categories.map(({ category, crawlers, allowed, total }) => {
          const pct = total === 0 ? 0 : Math.round((allowed / total) * 100);
          return (
            <details key={category} className="group rounded-lg border border-border">
              <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
                <span className="flex-1 text-sm font-medium text-foreground">{CATEGORY_LABELS[category]}</span>
                <span className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-status-blocked-bg sm:block" aria-hidden>
                  <span className="block h-full bg-status-allowed-dot" style={{ width: `${pct}%` }} />
                </span>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {allowed}/{total} allowed
                </span>
              </summary>
              <ul className="divide-y divide-border border-t border-border">
                {crawlers.map(({ crawler, allowed: isOk }) => (
                  <li key={crawler.id} className="flex items-center gap-3 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <CrawlerBadge name={crawler.name} userAgent={crawler.userAgent} />
                    </div>
                    <StatusBadge status={isOk ? "allowed" : "blocked"} />
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </div>
    </Card>
  );
}

function Report({ report }: { report: AnalysisReport }) {
  const fetchInfo = FETCH_STATUS[report.fetch.status] ?? FETCH_STATUS["network-error"]!;
  const originalSource = report.file.source ?? report.fetch.body ?? "";

  const [workingText, setWorkingText] = useState(originalSource);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [trend, setTrend] = useState<number[]>([]);

  // Everything that depends on the file is recomputed from the working copy, so
  // applying a fix updates the visibility score, audit, breakdown, and findings live.
  const derived = useMemo(() => {
    const file = parseRobots(workingText);
    const validation = validateRobots(file);
    const audit = buildAudit(validation.issues);
    const breakdown = computeBreakdown(file);
    const visibility = computeVisibility(breakdown, validation.health);
    const findings = validation.issues.filter((i) => i.severity === "error" || i.severity === "warning");
    const recommendations = buildRecommendations(validation, report.fetch);
    return { file, validation, audit, visibility, findings, recommendations };
  }, [workingText, report.fetch]);

  const safeCount = safelyFixableIssues(derived.validation.issues).length;
  const changed = workingText !== originalSource;

  function applyEdits(edits: readonly TextEdit[]) {
    const before = workingText;
    const after = applyTextEdits(before, edits);
    if (after === before) return;
    const beforeOverall = derived.audit.overall.value;
    const afterOverall = buildAudit(validateRobots(parseRobots(after)).issues).overall.value;
    setUndoStack((s) => [...s, before]);
    setTrend((t) => (t.length === 0 ? [beforeOverall, afterOverall] : [...t, afterOverall]));
    setWorkingText(after);
  }

  const onFix = (issue: ValidationIssue) => {
    if (issue.fix?.edits?.length) applyEdits(issue.fix.edits);
  };
  const fixAllSafe = () => {
    const edits = collectSafeEdits(derived.validation.issues);
    if (edits.length) applyEdits(edits);
  };
  const undo = () => {
    if (undoStack.length === 0) return;
    setWorkingText(undoStack[undoStack.length - 1]!);
    setUndoStack((s) => s.slice(0, -1));
    setTrend((t) => t.slice(0, -1));
  };

  const nextSteps: NextStep[] = [
    {
      kind: "link",
      icon: FileText,
      label: "Open in the Generator",
      description: "Rebuild from scratch with guided toggles and presets.",
      href: "/generate",
    },
    {
      kind: "handoff",
      icon: Megaphone,
      label: "Explain these rules",
      description: "Read the (fixed) file in plain English.",
      href: "/explain",
      text: workingText,
    },
    {
      kind: "handoff",
      icon: GitCompare,
      label: "Compare with another site",
      description: "Diff this file against a competitor or an older version.",
      href: "/compare",
      text: workingText,
    },
    {
      kind: "download",
      icon: Download,
      label: "Download fixed robots.txt",
      description: "Save the corrected file to deploy.",
      text: workingText,
      filename: "robots.txt",
    },
  ];

  return (
    <div className="space-y-6">
      <Callout status={fetchInfo.status} title={fetchInfo.title}>
        {report.domain} · {report.fetch.finalUrl ?? report.fetch.requestedUrl}
      </Callout>

      {/* Visibility (the Analyzer's signature score) + audit health */}
      <ScoreCard
        eyebrow="Crawler Visibility Score"
        title={`${derived.visibility.band === "good" ? "High" : derived.visibility.band === "moderate" ? "Moderate" : "Low"} Visibility`}
        value={derived.visibility.value}
        metrics={[
          { label: "Search access", value: `${derived.visibility.searchEngineAccess}%` },
          { label: "AI access", value: `${derived.visibility.aiCrawlerAccess}%` },
          { label: "Error rate", value: `${derived.visibility.errorRate}%` },
        ]}
      />

      <AuditDashboard report={derived.audit} trend={trend} />

      <CrawlerBreakdown file={derived.file} />

      {/* Fix toolbar — fix the live file and download the corrected version */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHeader>Fix &amp; export</SectionHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={fixAllSafe} disabled={safeCount === 0}>
              <Wand2 aria-hidden /> Fix {safeCount} safe {safeCount === 1 ? "issue" : "issues"}
            </Button>
            {undoStack.length > 0 ? (
              <Button variant="secondary" size="sm" onClick={undo}>
                <Undo2 aria-hidden /> Undo
              </Button>
            ) : null}
            <Button variant="secondary" size="sm" onClick={() => downloadText(workingText)}>
              <Download aria-hidden /> Download {changed ? "fixed " : ""}robots.txt
            </Button>
          </div>
        </div>
        {changed ? (
          <div className="mt-4" aria-live="polite">
            <p className="mb-1.5 text-xs text-muted-foreground">
              Your changes vs. the file currently live on {report.domain}:
            </p>
            <DiffView before={originalSource} after={workingText} />
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">
            Apply fixes below, then download the corrected file to deploy on your site.
          </p>
        )}
      </Card>

      <Card className="p-6">
        <SectionHeader className="mb-4">Issues</SectionHeader>
        {derived.findings.length === 0 ? (
          <Callout status="allowed" title="No errors or warnings found">
            The fetched robots.txt looks healthy.
          </Callout>
        ) : (
          <div className="space-y-3" data-testid="issue-list">
            {derived.findings.map((f) => (
              <IssueCard key={f.id} issue={f} onFix={onFix} impact={impactLabel(f)} />
            ))}
          </div>
        )}
      </Card>

      {derived.recommendations.length > 0 ? (
        <Card className="p-6">
          <SectionHeader className="mb-4">Recommendations</SectionHeader>
          <div className="space-y-3">
            {derived.recommendations.map((r) => (
              <RecommendationCard key={r.id} recommendation={r} />
            ))}
          </div>
        </Card>
      ) : null}

      <NextSteps steps={nextSteps} />
    </div>
  );
}
