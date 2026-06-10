"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Megaphone, Undo2, Wand2 } from "lucide-react";
import { parseRobots } from "@/parser";
import {
  applyTextEdits,
  buildAudit,
  collectSafeEdits,
  fixImpact,
  safelyFixableIssues,
  validateRobots,
} from "@/features/validator";
import type { ScoreDimension, Severity, TextEdit, ValidationIssue } from "@/types";
import { trackValidationCompleted } from "@/lib/analytics";
import { takeHandoff } from "@/lib/handoff";
import { PageHeader } from "@/components/page-header";
import { SectionHeader } from "@/components/section-header";
import { IssueCard } from "@/components/issue-card";
import { AuditDashboard } from "@/components/audit-dashboard";
import { DiffView } from "@/components/diff-view";
import { Callout } from "@/components/callout";
import { EmptyState } from "@/components/empty-state";
import { Segmented } from "@/components/segmented";
import { RobotsSourceField } from "@/components/robots-source-field";
import { NextSteps, type NextStep } from "@/components/next-steps";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SAMPLE = `User-agent: *
Allow: /
Disallow: /admin/
Crawl-delay: 0

User-agent: GPTBot
Disallow: /

Sitemap: http://example.com/sitemap.xml`;

type Filter = "all" | Severity;

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

export function ValidatorScreen() {
  const [text, setText] = useState(SAMPLE);
  const [filter, setFilter] = useState<Filter>("all");
  /** Snapshots of the text before each applied fix (most recent last) — for Undo. */
  const [undoStack, setUndoStack] = useState<string[]>([]);
  /** The most recent fix's before/after, shown as a diff until the next manual edit. */
  const [lastFix, setLastFix] = useState<{ before: string; after: string } | null>(null);
  /** Overall scores across this session's fixes (e.g. 78 → 84 → 91). */
  const [trend, setTrend] = useState<number[]>([]);

  const result = useMemo(() => validateRobots(parseRobots(text)), [text]);
  const audit = useMemo(() => buildAudit(result.issues), [result]);
  const visible = result.issues.filter((i) => filter === "all" || i.severity === filter);
  const safeCount = safelyFixableIssues(result.issues).length;

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
  }

  /** Apply a batch of edits as one undoable operation, surfacing a diff + trend. */
  function applyEdits(edits: readonly TextEdit[]) {
    const before = text;
    const after = applyTextEdits(before, edits);
    if (after === before) return;
    const beforeOverall = audit.overall.value;
    const afterOverall = buildAudit(validateRobots(parseRobots(after)).issues).overall.value;
    setUndoStack((s) => [...s, before]);
    setTrend((t) => (t.length === 0 ? [beforeOverall, afterOverall] : [...t, afterOverall]));
    setText(after);
    setLastFix({ before, after });
  }

  const onFix = (issue: ValidationIssue) => {
    if (issue.fix?.edits?.length) applyEdits(issue.fix.edits);
  };

  const fixAllSafe = () => {
    const edits = collectSafeEdits(result.issues);
    if (edits.length) applyEdits(edits);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    setText(undoStack[undoStack.length - 1]!);
    setUndoStack((s) => s.slice(0, -1));
    setTrend((t) => t.slice(0, -1));
    setLastFix(null);
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

  return (
    <div>
      <PageHeader
        breadcrumb={["Robots.txt Studio", "Validate"]}
        title="Validate robots.txt"
        subtitle="A full audit: multi-dimensional health, one-click fixes, and measurable improvement."
      />

      <Card className="p-4">
        <SectionHeader className="mb-3">robots.txt content</SectionHeader>
        <RobotsSourceField value={text} onChange={editText} rows={14} />
      </Card>

      <div className="mt-6">
        <AuditDashboard report={audit} trend={trend} />
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
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

        {/* Smart Fix toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={fixAllSafe} disabled={safeCount === 0}>
            <Wand2 aria-hidden /> Fix {safeCount} safe {safeCount === 1 ? "issue" : "issues"}
          </Button>
          {undoStack.length > 0 ? (
            <Button variant="secondary" size="sm" onClick={undo}>
              <Undo2 aria-hidden /> Undo
            </Button>
          ) : null}
          <Button variant="secondary" size="sm" onClick={() => downloadText(text)}>
            <Download aria-hidden /> Download robots.txt
          </Button>
        </div>

        {lastFix ? (
          <div aria-live="polite">
            <p className="mb-1.5 text-xs text-muted-foreground">Applied fix — review the change:</p>
            <DiffView before={lastFix.before} after={lastFix.after} />
          </div>
        ) : null}

        {result.issues.length === 0 ? (
          <Callout status="allowed" title="No issues found">
            Your robots.txt is valid and follows best practices.
          </Callout>
        ) : visible.length === 0 ? (
          <EmptyState
            title="Nothing in this filter"
            description="No issues match the selected severity. Try another filter to see the rest."
            action={
              <button
                type="button"
                onClick={() => setFilter("all")}
                className="text-xs font-medium text-brand hover:underline"
              >
                Show all issues
              </button>
            }
          />
        ) : (
          <div className="space-y-3" data-testid="issue-list">
            {visible.map((issue) => (
              <IssueCard key={issue.id} issue={issue} onFix={onFix} impact={impactLabel(issue)} />
            ))}
          </div>
        )}
      </div>

      <NextSteps steps={nextSteps} />
    </div>
  );
}
