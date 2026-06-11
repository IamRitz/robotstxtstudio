"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Megaphone } from "lucide-react";
import { parseRobots } from "@/parser";
import {
  applyTextEdits,
  buildAudit,
  collectSafeEdits,
  fixableIssues,
  getAiCrawlerStatuses,
  safelyFixableIssues,
  validateRobots,
} from "@/features/validator";
import type { ScoreDimension, Severity, TextEdit, ValidationIssue } from "@/types";
import {
  trackFixApplied,
  trackFixUndone,
  trackIssueSelected,
  trackValidationCompleted,
} from "@/lib/analytics";
import { takeHandoff } from "@/lib/handoff";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { SectionHeader } from "@/components/section-header";
import { DiffView } from "@/components/diff-view";
import { Callout } from "@/components/callout";
import { EmptyState } from "@/components/empty-state";
import { Segmented } from "@/components/segmented";
import { RobotsSourceField } from "@/components/robots-source-field";
import { RobotsEditor, type EditorAnnotation } from "@/components/robots-editor";
import { NextSteps, type NextStep } from "@/components/next-steps";
import { CommandBar } from "./command-bar";
import { DimensionChips } from "./dimension-chips";
import { affectsDimension, IssueList, issueLine, sortIssues, type IssueSort } from "./issue-panel";

const SAMPLE = `User-agent: *
Allow: /
Disallow: /admin/
Crawl-delay: 0

User-agent: GPTBot
Disallow: /

Sitemap: http://example.com/sitemap.xml`;

type Filter = "all" | Severity;
type MobilePane = "file" | "issues";

function downloadText(text: string, filename = "robots.txt") {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Validator workspace (UX Phase 1): a remediation surface, not a report.
 * Sticky command bar (score · potential · actions) + dimension chips that filter
 * the issue list + a split layout — annotated file editor on the left, the
 * impact-ordered issue panel on the right, bidirectionally linked by line.
 */
export function ValidatorScreen() {
  const [text, setText] = useState(SAMPLE);
  const [filter, setFilter] = useState<Filter>("all");
  const [dimension, setDimension] = useState<ScoreDimension | null>(null);
  const [sort, setSort] = useState<IssueSort>("impact");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /** Which pane is visible below `lg` (desktop always shows both). */
  const [mobilePane, setMobilePane] = useState<MobilePane>("file");
  /** Snapshots of the text before each applied fix (most recent last) — for Undo. */
  const [undoStack, setUndoStack] = useState<string[]>([]);
  /** The most recent fix's before/after, shown as a diff until the next manual edit. */
  const [lastFix, setLastFix] = useState<{ before: string; after: string } | null>(null);
  /** Overall scores across this session's fixes (e.g. 78 → 84 → 91). */
  const [trend, setTrend] = useState<number[]>([]);

  const file = useMemo(() => parseRobots(text), [text]);
  const result = useMemo(() => validateRobots(file), [file]);
  const audit = useMemo(() => buildAudit(result.issues), [result]);
  const aiStatuses = useMemo(() => getAiCrawlerStatuses(file), [file]);

  const visible = useMemo(() => {
    const filtered = result.issues.filter(
      (i) =>
        (filter === "all" || i.severity === filter) &&
        (dimension === null || affectsDimension(i, dimension)),
    );
    return sortIssues(filtered, sort);
  }, [result, filter, dimension, sort]);

  const selected = result.issues.find((i) => i.id === selectedId) ?? null;
  const activeLine = selected ? issueLine(selected) : undefined;
  /** Ghost diff: preview the selected issue's pending fix in the editor itself. */
  const pendingEdits = selected?.fix?.edits;
  const safeCount = safelyFixableIssues(result.issues).length;
  const fixableCount = fixableIssues(result.issues).length;

  const annotations: EditorAnnotation[] = useMemo(
    () =>
      result.issues.flatMap((i) => {
        const line = issueLine(i);
        return line === undefined ? [] : [{ line, severity: i.severity }];
      }),
    [result],
  );

  // If the user arrived from another tool ("Validate this"), load their file.
  useEffect(() => {
    const handed = takeHandoff();
    if (handed) editText(handed);
  }, []);

  /** Manual edits (typing / fetch / handoff) reset the fix session. */
  function editText(next: string) {
    setText(next);
    setUndoStack([]);
    setLastFix(null);
    setTrend([]);
    setSelectedId(null);
  }

  /** Apply a batch of edits as one undoable operation, surfacing a diff + trend. */
  function applyEdits(
    edits: readonly TextEdit[],
    meta: { mode: "single" | "all-safe"; code?: string; safe?: boolean; count: number },
  ) {
    const before = text;
    const after = applyTextEdits(before, edits);
    if (after === before) return;
    const beforeOverall = audit.overall.value;
    const afterOverall = buildAudit(validateRobots(parseRobots(after)).issues).overall.value;
    setUndoStack((s) => [...s, before]);
    setTrend((t) => (t.length === 0 ? [beforeOverall, afterOverall] : [...t, afterOverall]));
    setText(after);
    setLastFix({ before, after });
    setSelectedId(null);
    trackFixApplied({ ...meta, scoreDelta: afterOverall - beforeOverall });
  }

  const onFix = (issue: ValidationIssue) => {
    if (issue.fix?.edits?.length) {
      applyEdits(issue.fix.edits, {
        mode: "single",
        code: issue.code,
        safe: issue.fix.safe === true,
        count: 1,
      });
    }
  };

  const fixAllSafe = () => {
    const edits = collectSafeEdits(result.issues);
    if (edits.length) {
      applyEdits(edits, { mode: "all-safe", count: safelyFixableIssues(result.issues).length });
    }
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    setText(undoStack[undoStack.length - 1]!);
    setUndoStack((s) => s.slice(0, -1));
    setTrend((t) => t.slice(0, -1));
    setLastFix(null);
    setSelectedId(null);
    trackFixUndone();
  };

  /** Issue row clicked: select it and reveal its line in the editor. */
  const selectIssue = (issue: ValidationIssue) => {
    if (selectedId !== issue.id) trackIssueSelected(issue.code, "list");
    setSelectedId(selectedId === issue.id ? null : issue.id);
  };

  /** "L9" badge clicked: select + jump to the file (switches pane on mobile). */
  const jumpToLine = (issue: ValidationIssue) => {
    setSelectedId(issue.id);
    setMobilePane("file");
  };

  /** Gutter marker / heatmap dot clicked: select the issue on that line.
   *  Repeated clicks on a line with several issues cycle through them. */
  const selectLine = (line: number) => {
    const onLine = result.issues.filter((i) => issueLine(i) === line);
    if (onLine.length === 0) return;
    const idx = onLine.findIndex((i) => i.id === selectedId);
    const next = onLine[(idx + 1) % onLine.length]!;
    trackIssueSelected(next.code, "editor");
    setSelectedId(next.id);
    // Clear filters that would hide the issue the user just pointed at.
    if (filter !== "all" && next.severity !== filter) setFilter("all");
    if (dimension !== null && !affectsDimension(next, dimension)) setDimension(null);
    setMobilePane("issues");
  };

  const nextSteps: NextStep[] = [
    {
      kind: "link",
      icon: FileText,
      label: "Rebuild in the Generator",
      description: "Fix issues fast with guided crawler toggles and presets.",
      href: "/generate",
    },
    {
      kind: "handoff",
      icon: Megaphone,
      label: "Explain in plain English",
      description: "Understand exactly what these rules do.",
      href: "/explain",
      text,
    },
    {
      kind: "download",
      icon: Download,
      label: "Download robots.txt",
      description: "Save the current file to deploy.",
      text,
      filename: "robots.txt",
    },
  ];

  // Debounced: report a validation once the user stops editing (not per keystroke).
  useEffect(() => {
    const id = setTimeout(() => {
      trackValidationCompleted({
        healthScore: audit.overall.value,
        healthBand: result.health.band,
        errorCount: result.counts.error,
        warningCount: result.counts.warning,
        infoCount: result.counts.info,
        issueCodes: Array.from(new Set(result.issues.map((i) => i.code))),
      });
    }, 1500);
    return () => clearTimeout(id);
  }, [result, audit]);

  const editor = (
    <RobotsEditor
      value={text}
      onChange={editText}
      annotations={annotations}
      activeLine={activeLine}
      onLineSelect={selectLine}
      pendingEdits={pendingEdits}
      ariaLabel="robots.txt"
      // Large files scroll inside the editor so the sticky pane keeps the file,
      // the score, and the issue panel on screen together.
      className="max-h-[70vh] lg:max-h-[calc(100vh-16rem)]"
    />
  );

  return (
    <div>
      <PageHeader
        breadcrumb={["Robots.txt Studio", "Validate"]}
        title="Validate robots.txt"
        subtitle="Audit, jump to the exact line, fix in one click, and watch the score recover."
      />

      <CommandBar
        report={audit}
        fixableCount={fixableCount}
        safeCount={safeCount}
        canUndo={undoStack.length > 0}
        trend={trend}
        onFixAllSafe={fixAllSafe}
        onUndo={undo}
        onDownload={() => downloadText(text)}
      />

      <div className="mt-4 space-y-3">
        <p className="text-sm text-muted-foreground">{audit.summary.headline}</p>
        <DimensionChips
          report={audit}
          active={dimension}
          aiStatuses={aiStatuses}
          onToggle={(d) => setDimension((cur) => (cur === d ? null : d))}
        />
      </div>

      {/* Mobile pane switcher — desktop shows both panes side by side. */}
      <div className="mt-4 lg:hidden">
        <Segmented<MobilePane>
          value={mobilePane}
          onChange={setMobilePane}
          options={[
            { value: "file", label: "File" },
            { value: "issues", label: "Issues", count: result.issues.length },
          ]}
        />
      </div>

      <div className="mt-3 grid items-start gap-6 lg:mt-6 lg:grid-cols-[11fr_9fr]">
        {/* File pane — sticky on desktop so the file never scrolls away. */}
        <section
          aria-label="robots.txt file"
          className={cn(
            "space-y-3 lg:sticky lg:top-[7.25rem]",
            mobilePane === "file" ? "" : "hidden lg:block",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <SectionHeader>robots.txt</SectionHeader>
          </div>
          <RobotsSourceField value={text} onChange={editText} editor={editor} />
          {lastFix ? (
            <div aria-live="polite">
              <p className="mb-1.5 text-xs text-muted-foreground">
                Applied fix — review the change:
              </p>
              <DiffView before={lastFix.before} after={lastFix.after} />
            </div>
          ) : null}
        </section>

        {/* Issue panel — the remediation queue. */}
        <section
          aria-label="Issues"
          className={cn("space-y-3", mobilePane === "issues" ? "" : "hidden lg:block")}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <SectionHeader>Issues</SectionHeader>
            <Segmented<IssueSort>
              size="sm"
              value={sort}
              onChange={setSort}
              options={[
                { value: "impact", label: "By impact" },
                { value: "line", label: "By line" },
                { value: "severity", label: "By severity" },
              ]}
            />
          </div>
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

          {result.issues.length === 0 ? (
            <Callout status="allowed" title="No issues found">
              Your robots.txt is valid and follows best practices.
            </Callout>
          ) : visible.length === 0 ? (
            <EmptyState
              title="Nothing in this filter"
              description="No issues match the selected filters. Clear them to see the rest."
              action={
                <button
                  type="button"
                  onClick={() => {
                    setFilter("all");
                    setDimension(null);
                  }}
                  className="text-xs font-medium text-brand hover:underline"
                >
                  Show all issues
                </button>
              }
            />
          ) : (
            <IssueList
              issues={visible}
              selectedId={selectedId}
              sourceText={text}
              onSelect={selectIssue}
              onJumpToLine={jumpToLine}
              onFix={onFix}
            />
          )}
        </section>
      </div>

      {/* Next steps only once remediation settles — while in-app fixes remain,
          the workspace IS the next step. */}
      {fixableCount === 0 ? <NextSteps steps={nextSteps} /> : null}
    </div>
  );
}
