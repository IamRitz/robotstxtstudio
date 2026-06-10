import type { ReactNode } from "react";
import { ExternalLink, Wrench } from "lucide-react";
import type { ValidationIssue } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { STATUS_VISUALS, severityToStatus } from "./severity";

/**
 * A validation issue card: severity icon, title, line ref, message, actions.
 *
 * When the issue carries an applicable {@link ValidationIssue.fix} AND an `onFix`
 * handler is provided, a "Fix this" button is shown (Phase 15A Smart Fix). `onFix` is
 * omitted on read-only surfaces (e.g. the Analyzer today), so no button appears there.
 */
export function IssueCard({
  issue,
  onFix,
  impact,
  actions,
  className,
}: {
  issue: ValidationIssue;
  /** Apply this issue's fix. Only wired where edits can be applied (the Validator). */
  onFix?: (issue: ValidationIssue) => void;
  /** Score-impact preview shown next to the fix (e.g. "Recovers SEO +10 · Overall +3"). */
  impact?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  const status = severityToStatus(issue.severity);
  const { icon: Icon, chip } = STATUS_VISUALS[status];
  const canFix = onFix && (issue.fix?.edits?.length ?? 0) > 0;

  return (
    <div className={cn("flex items-start gap-3 rounded-xl border border-border bg-card p-4", className)}>
      <span className={cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full", chip)} aria-hidden>
        <Icon className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">{issue.title}</p>
          {issue.line !== undefined ? (
            <span className="shrink-0 font-mono text-xs text-muted-foreground">Line {issue.line}</span>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{issue.message}</p>
        {canFix || issue.learnMoreUrl || actions ? (
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
            {canFix ? (
              <Button variant="outline" size="sm" onClick={() => onFix!(issue)} title={issue.fix!.description}>
                <Wrench aria-hidden /> Fix this
                {issue.fix!.safe ? null : (
                  <span className="font-normal text-muted-foreground">· review</span>
                )}
              </Button>
            ) : null}
            {impact ? <span className="text-xs text-muted-foreground">{impact}</span> : null}
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
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
