"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, FileText, GitCompare, Globe, Megaphone, ScanSearch } from "lucide-react";
import { parseRobots } from "@/parser";
import {
  applyTextEdits,
  collectSafeEdits,
  fixableIssues,
  safelyFixableIssues,
  validateRobots,
} from "@/features/validator";
import { computeBreakdown, computeVisibility } from "@/features/live-checker";
import { isAllowed } from "@/features/tester";
import { CATEGORY_LABELS, CATEGORY_ORDER, crawlersByCategory } from "@/config/crawlers";
import type { AnalysisReport, Crawler, TextEdit, ValidationIssue } from "@/types";
import { PageHeader } from "@/components/page-header";
import { SectionHeader } from "@/components/section-header";
import { DiffView } from "@/components/diff-view";
import { CrawlerBadge } from "@/components/crawler-badge";
import { StatusBadge } from "@/components/status-badge";
import { Callout } from "@/components/callout";
import { EmptyState } from "@/components/empty-state";
import { LoadingCard } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { NextSteps, type NextStep } from "@/components/next-steps";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { StatusKey } from "@/components/severity";
import {
  trackAnalyzeCompleted,
  trackFetchRobots,
  trackFixApplied,
  trackFixUndone,
  type FixAppliedProps,
} from "@/lib/analytics";
import { VerdictBand } from "./verdict-band";
import { ActionQueue } from "./action-queue";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "done"; report: AnalysisReport };

/** Non-`ok` outcomes change what the report MEANS, so they keep a loud callout;
 *  a successful fetch is just provenance and lives in the verdict band. */
const FETCH_PROBLEM: Record<string, { status: StatusKey; title: string }> = {
  "not-found": { status: "warning", title: "No robots.txt found — all crawlers are allowed" },
  "invalid-content-type": { status: "warning", title: "robots.txt is not plain text" },
  "too-large": { status: "warning", title: "robots.txt is very large — analyzed a portion" },
  timeout: { status: "blocked", title: "Fetching robots.txt timed out" },
  "network-error": { status: "blocked", title: "Could not fetch robots.txt" },
};

function downloadText(text: string, filename = "robots.txt") {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
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
                <ChevronDown
                  className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                  aria-hidden
                />
                <span className="flex-1 text-sm font-medium text-foreground">
                  {CATEGORY_LABELS[category]}
                </span>
                <span
                  className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-status-blocked-bg sm:block"
                  aria-hidden
                >
                  <span
                    className="block h-full bg-status-allowed-dot"
                    style={{ width: `${pct}%` }}
                  />
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

/** Recompute the visibility verdict for a hypothetical file text. Pure + cheap. */
function visibilityOf(text: string) {
  const file = parseRobots(text);
  const validation = validateRobots(file);
  return {
    visibility: computeVisibility(computeBreakdown(file), validation.health).value,
    health: validation.health.value,
  };
}

function Report({ report }: { report: AnalysisReport }) {
  const fetchProblem = FETCH_PROBLEM[report.fetch.status];
  const originalSource = report.file.source ?? report.fetch.body ?? "";

  const [workingText, setWorkingText] = useState(originalSource);
  const [undoStack, setUndoStack] = useState<string[]>([]);

  // Everything that depends on the file is recomputed from the working copy, so
  // applying a fix updates the verdict, queue, and breakdown live.
  const derived = useMemo(() => {
    const file = parseRobots(workingText);
    const validation = validateRobots(file);
    const breakdown = computeBreakdown(file);
    const visibility = computeVisibility(breakdown, validation.health);
    return { file, validation, breakdown, visibility };
  }, [workingText]);

  // Recovery, in the headline currency: simulate the fixes and re-score. No
  // estimates — the same pure pipeline the report itself uses.
  const recovery = useMemo(() => {
    const fixable = fixableIssues(derived.validation.issues);
    const safeEdits = collectSafeEdits(derived.validation.issues);
    const all =
      fixable.length > 0
        ? visibilityOf(
            applyTextEdits(
              workingText,
              fixable.flatMap((i) => i.fix!.edits!),
            ),
          )
        : { visibility: derived.visibility.value, health: derived.validation.health.value };
    const safe =
      safeEdits.length > 0
        ? visibilityOf(applyTextEdits(workingText, safeEdits)).visibility
        : derived.visibility.value;
    return {
      fixableCount: fixable.length,
      safeCount: safelyFixableIssues(derived.validation.issues).length,
      potentialVisibility: all.visibility,
      potentialHealth: all.health,
      safeDelta: safe - derived.visibility.value,
    };
  }, [workingText, derived]);

  const search = derived.breakdown.find((b) => b.category === "search-engine");
  const ai = derived.breakdown.filter(
    (b) => b.category === "ai-training" || b.category === "ai-search",
  );
  const aiAllowed = ai.reduce((s, b) => s + b.allowed, 0);
  const aiTotal = ai.reduce((s, b) => s + b.total, 0);

  const changed = workingText !== originalSource;

  function applyEdits(edits: readonly TextEdit[], meta: Omit<FixAppliedProps, "scoreDelta">) {
    const before = workingText;
    const after = applyTextEdits(before, edits);
    if (after === before) return;
    const scoreDelta = visibilityOf(after).visibility - derived.visibility.value;
    trackFixApplied({ ...meta, scoreDelta });
    setUndoStack((s) => [...s, before]);
    setWorkingText(after);
  }

  const onFix = (issue: ValidationIssue) => {
    if (issue.fix?.edits?.length) {
      applyEdits(issue.fix.edits, {
        mode: "single",
        code: issue.code,
        safe: issue.fix.safe === true,
        count: 1,
        surface: "analyzer",
      });
    }
  };
  const fixAllSafe = () => {
    const edits = collectSafeEdits(derived.validation.issues);
    if (edits.length) {
      applyEdits(edits, { mode: "all-safe", count: recovery.safeCount, surface: "analyzer" });
    }
  };
  const undo = () => {
    if (undoStack.length === 0) return;
    trackFixUndone("analyzer");
    setWorkingText(undoStack[undoStack.length - 1]!);
    setUndoStack((s) => s.slice(0, -1));
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
  ];

  return (
    <div className="space-y-6">
      {fetchProblem ? (
        <Callout status={fetchProblem.status} title={fetchProblem.title}>
          {report.domain} · {report.fetch.finalUrl ?? report.fetch.requestedUrl}
        </Callout>
      ) : null}

      <VerdictBand
        domain={report.domain}
        now={derived.visibility.value}
        potential={recovery.potentialVisibility}
        band={derived.visibility.band}
        searchAllowed={search?.allowed ?? 0}
        searchTotal={search?.total ?? 0}
        aiAllowed={aiAllowed}
        aiTotal={aiTotal}
        healthNow={derived.validation.health.value}
        healthPotential={recovery.potentialHealth}
        fixableCount={recovery.fixableCount}
        safeCount={recovery.safeCount}
        safeDelta={recovery.safeDelta}
        canUndo={undoStack.length > 0}
        fetch={report.fetch}
        fetchedAt={report.fetchedAt}
        sourceBytes={new TextEncoder().encode(workingText).length}
        onFixAllSafe={fixAllSafe}
        onUndo={undo}
        onDownload={() => downloadText(workingText)}
      />

      <CrawlerBreakdown file={derived.file} />

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <SectionHeader>What to do first</SectionHeader>
          <span className="text-xs text-muted-foreground">ranked by points recovered</span>
        </div>
        {derived.validation.issues.length === 0 ? (
          <Callout status="allowed" title="Nothing to fix">
            This robots.txt is healthy — no errors, warnings, or open decisions.
          </Callout>
        ) : (
          <ActionQueue issues={derived.validation.issues} sourceText={workingText} onFix={onFix} />
        )}
      </section>

      {changed ? (
        <Card className="p-4" aria-live="polite">
          <p className="mb-1.5 text-xs text-muted-foreground">
            Your changes vs. the file currently live on {report.domain} — download from the bar
            above to deploy:
          </p>
          <DiffView before={originalSource} after={workingText} />
        </Card>
      ) : null}

      {/* Only once the queue is settled — while work remains, the queue IS the next step. */}
      {derived.validation.issues.length === 0 ? <NextSteps steps={nextSteps} /> : null}
    </div>
  );
}
