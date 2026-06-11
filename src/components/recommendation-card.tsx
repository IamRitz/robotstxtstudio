import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import type { Recommendation } from "@/types";
import { cn } from "@/lib/utils";
import { STATUS_VISUALS, severityToStatus } from "./severity";

/** A recommendation card with an optional deep-link action. */
export function RecommendationCard({
  recommendation,
  actionLabel,
  onAction,
  className,
}: {
  recommendation: Pick<Recommendation, "severity" | "title" | "description">;
  actionLabel?: string;
  onAction?: ReactNode;
  className?: string;
}) {
  const status = severityToStatus(recommendation.severity);
  const { icon: Icon, chip } = STATUS_VISUALS[status];

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-border bg-card p-4",
        className,
      )}
    >
      <span
        className={cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full", chip)}
        aria-hidden
      >
        <Icon className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{recommendation.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{recommendation.description}</p>
        {onAction ??
          (actionLabel ? (
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand">
              {actionLabel} <ArrowRight className="size-3" />
            </span>
          ) : null)}
      </div>
    </div>
  );
}
