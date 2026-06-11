import { useEffect, useRef } from "react";
import { Check, ExternalLink, Wrench } from "lucide-react";
import type { Severity, ValidationIssue } from "@/types";
import { applyTextEdits, DEDUCTIONS, fixImpact, whyItMatters } from "@/features/validator";
import type { ScoreDimension } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DiffView } from "@/components/diff-view";
import { STATUS_VISUALS, severityToStatus } from "@/components/severity";

const DIM_SHORT: Record<ScoreDimension, string> = {
  syntax: "Syntax",
  seo: "SEO",
  ai: "AI",
  maintainability: "Maint.",
  security: "Security",
};

/** Total raw points an issue deducts across all dimensions (the impact ranking key). */
export function issuePoints(issue: ValidationIssue): number {
  return (DEDUCTIONS[issue.code] ?? []).reduce((s, h) => s + h.points, 0);
}

/** The 1-based line an issue anchors to in the editor, if any. */
export function issueLine(issue: ValidationIssue): number | undefined {
  return issue.line ?? issue.lineRange?.start;
}

/** Does this issue deduct from the given dimension? (chip filter predicate) */
export function affectsDimension(issue: ValidationIssue, dimension: ScoreDimension): boolean {
  return (DEDUCTIONS[issue.code] ?? []).some((h) => h.dimension === dimension);
}

/** "Recovers SEO +10 · Overall +3" — the per-fix score recovery preview. */
export function impactDetail(issue: ValidationIssue): string | null {
  const { dimensions, overall } = fixImpact(issue);
  if (dimensions.length === 0) return null;
  const parts = dimensions.map((h) => `${DIM_SHORT[h.dimension]} +${h.points}`);
  return `Recovers ${parts.join(" · ")}${overall > 0 ? ` · Overall +${overall}` : ""}`;
}

/**
 * One issue row in the workspace's problems panel. Collapsed: severity, title,
 * line jump, points at stake, and a quick Fix action (safe fixes apply directly;
 * "review" fixes open the row so the diff preview is seen first). Selected: expands
 * in place with the cause, why it matters, the exact before/after the fix would
 * produce, the score recovery, and Apply — context never leaves the panel.
 */
function IssueRow({
  issue,
  selected,
  sourceText,
  onSelect,
  onJumpToLine,
  onFix,
}: {
  issue: ValidationIssue;
  selected: boolean;
  /** Current file text — used to render the preview-before-apply diff. */
  sourceText: string;
  onSelect: (issue: ValidationIssue) => void;
  onJumpToLine: (issue: ValidationIssue) => void;
  onFix: (issue: ValidationIssue) => void;
}) {
  const status = severityToStatus(issue.severity);
  const { icon: Icon, chip } = STATUS_VISUALS[status];
  const line = issueLine(issue);
  const points = issuePoints(issue);
  const canFix = (issue.fix?.edits?.length ?? 0) > 0;
  const isSafe = issue.fix?.safe === true;
  const ref = useRef<HTMLDivElement>(null);

  // When selected from the editor (gutter/heatmap), bring the row into view.
  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  /** Quick action: safe fixes apply in one click; review fixes preview first. */
  const quickFix = () => {
    if (isSafe) onFix(issue);
    else onSelect(issue);
  };

  const previewAfter = canFix && selected ? applyTextEdits(sourceText, issue.fix!.edits!) : null;

  return (
    <div
      ref={ref}
      data-issue-id={issue.id}
      className={cn(
        "rounded-xl border bg-card transition-colors",
        selected ? "border-brand shadow-sm" : "border-border",
      )}
    >
      {/* Row click selects (pointer convenience); the title button is the
          keyboard-accessible control, so no interactive nesting. */}
      <div
        onClick={() => onSelect(issue)}
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl p-3 text-left"
      >
        <span
          className={cn("flex size-5 shrink-0 items-center justify-center rounded-full", chip)}
          aria-hidden
        >
          <Icon className="size-3" />
        </span>
        <button
          type="button"
          aria-expanded={selected}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(issue);
          }}
          className="min-w-0 flex-1 truncate text-left text-sm font-medium text-foreground"
        >
          {issue.title}
        </button>
        {points > 0 ? (
          <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
            +{points} pts
          </span>
        ) : null}
        {line !== undefined ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onJumpToLine(issue);
            }}
            className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground hover:border-brand hover:text-brand"
            title={`Show line ${line} in the file`}
          >
            L{line}
          </button>
        ) : null}
        {canFix ? (
          <Button
            variant="outline"
            size="sm"
            aria-label={`Fix this: ${issue.title}`}
            title={isSafe ? issue.fix!.description : "Review the change, then apply"}
            onClick={(e) => {
              e.stopPropagation();
              quickFix();
            }}
            className="shrink-0"
          >
            <Wrench aria-hidden /> Fix this
            {isSafe ? null : <span className="font-normal text-muted-foreground">· review</span>}
          </Button>
        ) : null}
      </div>

      {selected ? (
        <div className="space-y-2.5 border-t border-border px-3 py-2.5 pl-[42px]">
          <p className="text-xs text-muted-foreground">{issue.message}</p>
          <p className="text-xs leading-relaxed text-foreground">
            <span className="font-semibold">Why this matters: </span>
            {whyItMatters(issue.code)}
          </p>

          {previewAfter !== null && previewAfter !== sourceText ? (
            <div>
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                This fix would change
              </p>
              <DiffView before={sourceText} after={previewAfter} className="max-h-48 text-[11px]" />
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {canFix ? (
              <Button
                size="sm"
                onClick={() => onFix(issue)}
                title={issue.fix!.description}
                aria-label={`Apply fix: ${issue.title}`}
              >
                <Check aria-hidden /> Apply fix
              </Button>
            ) : null}
            {impactDetail(issue) ? (
              <span className="font-medium text-status-allowed-fg">{impactDetail(issue)}</span>
            ) : null}
            {issue.learnMoreUrl ? (
              <a
                href={issue.learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
              >
                Learn more <ExternalLink className="size-3" aria-hidden />
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export type IssueSort = "impact" | "line" | "severity";

const SEVERITY_RANK: Record<Severity, number> = { error: 0, warning: 1, info: 2 };

/** Order issues for the panel. Default: highest score recovery first. */
export function sortIssues(issues: readonly ValidationIssue[], sort: IssueSort): ValidationIssue[] {
  const byLine = (a: ValidationIssue, b: ValidationIssue) =>
    (issueLine(a) ?? Number.MAX_SAFE_INTEGER) - (issueLine(b) ?? Number.MAX_SAFE_INTEGER);
  const bySeverity = (a: ValidationIssue, b: ValidationIssue) =>
    SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
  const byImpact = (a: ValidationIssue, b: ValidationIssue) => issuePoints(b) - issuePoints(a);

  const cmp =
    sort === "impact"
      ? (a: ValidationIssue, b: ValidationIssue) =>
          byImpact(a, b) || bySeverity(a, b) || byLine(a, b)
      : sort === "line"
        ? (a: ValidationIssue, b: ValidationIssue) => byLine(a, b) || byImpact(a, b)
        : (a: ValidationIssue, b: ValidationIssue) =>
            bySeverity(a, b) || byImpact(a, b) || byLine(a, b);

  return [...issues].sort(cmp);
}

export function IssueList({
  issues,
  selectedId,
  sourceText,
  onSelect,
  onJumpToLine,
  onFix,
}: {
  issues: readonly ValidationIssue[];
  selectedId: string | null;
  sourceText: string;
  onSelect: (issue: ValidationIssue) => void;
  onJumpToLine: (issue: ValidationIssue) => void;
  onFix: (issue: ValidationIssue) => void;
}) {
  return (
    <div className="space-y-2" data-testid="issue-list">
      {issues.map((issue) => (
        <IssueRow
          key={issue.id}
          issue={issue}
          selected={issue.id === selectedId}
          sourceText={sourceText}
          onSelect={onSelect}
          onJumpToLine={onJumpToLine}
          onFix={onFix}
        />
      ))}
    </div>
  );
}
