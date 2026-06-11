"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, GitCompare, Globe, Megaphone, ScanSearch } from "lucide-react";
import { parseRobots } from "@/parser";
import {
  applyTextEdits,
  buildAudit,
  collectSafeEdits,
  fixableIssues,
  safelyFixableIssues,
  validateRobots,
} from "@/features/validator";
import { buildAnalysisReport, computeBreakdown, computeVisibility } from "@/features/live-checker";
import type { AnalysisReport, ScoreDimension, TextEdit, ValidationIssue } from "@/types";
import { PageHeader } from "@/components/page-header";
import { SectionHeader } from "@/components/section-header";
import { DiffView } from "@/components/diff-view";
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
  trackRecentAnalysisSaved,
  type FixAppliedProps,
} from "@/lib/analytics";
import {
  getRecentAnalysis,
  listRecentAnalyses,
  saveRecentAnalysis,
  type RecentAnalysis,
} from "@/lib/recent-analyses";
import {
  getWorkspace,
  isWorkspaceDirty,
  setWorkspace,
  WORKSPACE_SOURCE_LABEL,
  workspaceLabel,
} from "@/lib/workspace";
import { DimensionChipStrip } from "@/components/dimension-chip-strip";
import { RobotsEditor, type EditorAnnotation } from "@/components/robots-editor";
import { affectsDimension, issueLine } from "@/app/validate/issue-panel";
import { VerdictBand } from "./verdict-band";
import { ActionQueue } from "./action-queue";
import { AccessMatrix } from "./access-matrix";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "done"; report: AnalysisReport; initialWorkingText?: string };

/** Rebuild the full report from a stored snapshot — the same pure pipeline the
 *  server runs, just fed from localStorage instead of the network. */
function restoreState(stored: RecentAnalysis): State {
  // Bidirectional editing (17D): if the shared workspace holds this domain's file,
  // its text wins — it may carry edits made in the Validator/Manager/Generator
  // since this archive snapshot was taken.
  const ws = getWorkspace();
  const workingText = ws?.domain === stored.domain ? ws.text : stored.workingText;
  return {
    kind: "done",
    report: buildAnalysisReport(
      { ...stored.fetch, body: stored.source },
      stored.domain,
      stored.fetchedAt,
    ),
    initialWorkingText: workingText,
  };
}

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

export function AnalyzerScreen({
  initialDomain,
  forceFresh = false,
}: {
  initialDomain: string;
  /** True for explicit "analyze now" entries (?fresh=1) — never restore a snapshot. */
  forceFresh?: boolean;
}) {
  const [domain, setDomain] = useState(initialDomain);
  const [state, setState] = useState<State>({ kind: "idle" });

  const run = useCallback(async (value: string) => {
    const target = value.trim();
    if (!target) return;
    // Unsaved-work protection (17D): a fetch REPLACES the working file.
    const ws = getWorkspace();
    if (
      ws &&
      isWorkspaceDirty(ws) &&
      !window.confirm(
        `Analyzing will replace your working file (${workspaceLabel(ws)}), which has edits. Continue?`,
      )
    ) {
      return;
    }
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
      // Drop ?fresh=1 so a refresh of this URL restores instead of refetching.
      window.history.replaceState(null, "", `/analyze?domain=${encodeURIComponent(target)}`);
      trackRecentAnalysisSaved(report.findings.length);
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

  // Continuity (Phase 17C): a mount is navigation (refresh / back / Continue),
  // not a request for new IO — restore the snapshot when we have one. Only an
  // explicit submit (the form, or ?fresh=1) fetches.
  useEffect(() => {
    if (initialDomain) {
      const stored = forceFresh ? undefined : getRecentAnalysis(initialDomain);
      if (stored?.source !== undefined) {
        setDomain(stored.domain);
        setState(restoreState(stored));
        return;
      }
      void run(initialDomain);
      return;
    }
    const latest = listRecentAnalyses()[0];
    if (latest?.source !== undefined) {
      setDomain(latest.domain);
      setState(restoreState(latest));
    }
  }, [initialDomain, forceFresh, run]);

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

      {state.kind === "done" ? (
        <Report
          key={state.report.fetchedAt}
          report={state.report}
          initialWorkingText={state.initialWorkingText}
        />
      ) : null}
    </div>
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

const DIMENSION_FILTER_KEY = "rs:analyzer-dimension";

function Report({
  report,
  initialWorkingText,
}: {
  report: AnalysisReport;
  /** Restored working copy (continuity) — defaults to the fetched source. */
  initialWorkingText?: string;
}) {
  const fetchProblem = FETCH_PROBLEM[report.fetch.status];
  const originalSource = report.file.source ?? report.fetch.body ?? "";

  const [workingText, setWorkingText] = useState(initialWorkingText ?? originalSource);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  /** Smart-Fix provenance log (17D) — continued from the workspace when it's ours. */
  const [fixLog, setFixLog] = useState<readonly string[]>(() => {
    if (typeof window === "undefined") return [];
    const ws = getWorkspace();
    return ws?.domain === report.domain ? ws.appliedFixes : [];
  });
  /** At-a-glance provenance (17F.4): this report includes another tool's edits. */
  const [crossToolNote] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const ws = getWorkspace();
    return ws && ws.domain === report.domain && ws.source !== "analyzer"
      ? `includes changes from ${WORKSPACE_SOURCE_LABEL[ws.source]}`
      : null;
  });
  // The chip filter survives navigation within the tab (back/forward, resume).
  const [dimension, setDimension] = useState<ScoreDimension | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem(DIMENSION_FILTER_KEY);
      if (!raw) return null;
      const saved = JSON.parse(raw) as { domain?: string; dimension?: ScoreDimension | null };
      return saved.domain === report.domain ? (saved.dimension ?? null) : null;
    } catch {
      return null;
    }
  });
  useEffect(() => {
    try {
      sessionStorage.setItem(
        DIMENSION_FILTER_KEY,
        JSON.stringify({ domain: report.domain, dimension }),
      );
    } catch {
      // session-only nicety
    }
  }, [report.domain, dimension]);

  // Everything that depends on the file is recomputed from the working copy, so
  // applying a fix updates the verdict, queue, and breakdown live.
  const derived = useMemo(() => {
    const file = parseRobots(workingText);
    const validation = validateRobots(file);
    const breakdown = computeBreakdown(file);
    const visibility = computeVisibility(breakdown, validation.health);
    const audit = buildAudit(validation.issues);
    return { file, validation, breakdown, visibility, audit };
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

  // Publish the shared workspace (17D): the Analyzer is where named files are born.
  useEffect(() => {
    setWorkspace({
      domain: report.domain,
      originalText: originalSource,
      text: workingText,
      appliedFixes: fixLog,
      source: "analyzer",
    });
  }, [report.domain, originalSource, workingText, fixLog]);

  // Keep the local snapshot current (Phase 17C): on mount and after every fix.
  // Upsert is LRU-by-domain and same-fetch updates preserve the re-check delta.
  useEffect(() => {
    const { body: _body, ...fetchMeta } = report.fetch;
    saveRecentAnalysis({
      domain: report.domain,
      fetchedAt: report.fetchedAt,
      fetch: fetchMeta,
      source: originalSource,
      workingText: changed ? workingText : undefined,
      visibility: { value: derived.visibility.value, band: derived.visibility.band },
      health: derived.validation.health.value,
      fetchStatus: report.fetch.status,
      findingCount: derived.validation.counts.error + derived.validation.counts.warning,
      safeFixCount: recovery.safeCount,
    });
  }, [report, originalSource, changed, workingText, derived, recovery.safeCount]);

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
      setFixLog((l) => [...l, issue.code]);
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
      const codes = safelyFixableIssues(derived.validation.issues).map((i) => i.code);
      setFixLog((l) => [...l, ...codes]);
      applyEdits(edits, { mode: "all-safe", count: recovery.safeCount, surface: "analyzer" });
    }
  };
  const undo = () => {
    if (undoStack.length === 0) return;
    trackFixUndone("analyzer");
    setWorkingText(undoStack[undoStack.length - 1]!);
    setUndoStack((s) => s.slice(0, -1));
  };

  const issues = derived.validation.issues;
  const queueIssues =
    dimension === null ? issues : issues.filter((i) => affectsDimension(i, dimension));
  const activeDim = derived.audit.dimensions.find((d) => d.dimension === dimension);

  const annotations: EditorAnnotation[] = issues.flatMap((i) => {
    const line = issueLine(i);
    return line === undefined ? [] : [{ line, severity: i.severity }];
  });
  const lineCount = workingText === "" ? 0 : workingText.split("\n").length;

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
        crossToolNote={crossToolNote}
        onFixAllSafe={fixAllSafe}
        onUndo={undo}
        onDownload={() => downloadText(workingText)}
      />

      <AccessMatrix file={derived.file} domain={report.domain} />

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <SectionHeader>What to do first</SectionHeader>
          <span className="text-xs text-muted-foreground">ranked by points recovered</span>
        </div>
        {issues.length > 0 ? (
          <div className="mb-3">
            <DimensionChipStrip
              report={derived.audit}
              active={dimension}
              onToggle={(d) => setDimension((cur) => (cur === d ? null : d))}
            />
            {activeDim ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Showing only {activeDim.label} issues ({queueIssues.length}). Click the chip again
                to clear.
              </p>
            ) : null}
          </div>
        ) : null}
        {issues.length === 0 ? (
          <Callout status="allowed" title="Nothing to fix">
            This robots.txt is healthy — no errors, warnings, or open decisions.
          </Callout>
        ) : queueIssues.length === 0 ? (
          <Callout status="allowed" title={`No ${activeDim?.label ?? ""} issues left`}>
            Nothing to do in this dimension — click the chip again to see everything.
          </Callout>
        ) : (
          <ActionQueue issues={queueIssues} sourceText={workingText} onFix={onFix} />
        )}
      </section>

      {/* Transparency: the exact text that was fetched / fixed / will download. */}
      <details className="rounded-xl border border-border bg-card px-4 py-3">
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground">
          The file — {changed ? "with your fixes applied" : "as served"} ({lineCount}{" "}
          {lineCount === 1 ? "line" : "lines"}
          {annotations.length > 0 ? `, ${annotations.length} flagged` : ""})
        </summary>
        <div className="mt-3">
          <RobotsEditor
            value={workingText}
            readOnly
            annotations={annotations}
            ariaLabel="robots.txt (read-only)"
            minRows={4}
            className="max-h-[60vh]"
          />
        </div>
      </details>

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
