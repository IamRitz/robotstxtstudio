import type { ReactNode } from "react";
import type { ValidationIssue } from "@/types";
import { cn } from "@/lib/utils";
import { STATUS_VISUALS, severityToStatus } from "./severity";

/** A validation issue card: severity icon, title, line ref, message, actions. */
export function IssueCard({
  issue,
  actions,
  className,
}: {
  issue: Pick<ValidationIssue, "severity" | "title" | "message" | "line">;
  actions?: ReactNode;
  className?: string;
}) {
  const status = severityToStatus(issue.severity);
  const { icon: Icon, chip } = STATUS_VISUALS[status];

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
        {actions ? <div className="mt-2 flex items-center gap-3 text-xs">{actions}</div> : null}
      </div>
    </div>
  );
}
