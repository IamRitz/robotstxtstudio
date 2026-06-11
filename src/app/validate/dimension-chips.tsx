import Link from "next/link";
import { ArrowUpRight, Check, CircleAlert } from "lucide-react";
import type { AuditReport, DimensionScore, ScoreDimension } from "@/types";
import type { AiCrawlerStatus } from "@/features/validator";
import { DimensionChipStrip, pointsAvailable } from "@/components/dimension-chip-strip";
import { cn } from "@/lib/utils";

/**
 * The score-as-navigation strip. Each chip is a work queue, not a stat: it shows
 * the points still available in that dimension (`SEO 47 · +53`) and clicking it
 * filters the issue list to that work plus a recovery breakdown. "Why am I not
 * at 100?" and "what do I gain?" are both one click away.
 */
export function DimensionChips({
  report,
  active,
  aiStatuses,
  onToggle,
}: {
  report: AuditReport;
  active: ScoreDimension | null;
  /** Per-bot policy status, shown in the AI dimension's panel. */
  aiStatuses: readonly AiCrawlerStatus[];
  onToggle: (dimension: ScoreDimension) => void;
}) {
  const activeDim = report.dimensions.find((d) => d.dimension === active);
  return (
    <div>
      <DimensionChipStrip report={report} active={active} onToggle={onToggle} />

      {activeDim ? (
        activeDim.dimension === "ai" ? (
          <AiDecisionPanel d={activeDim} statuses={aiStatuses} />
        ) : (
          <RecoveryPanel d={activeDim} />
        )
      ) : null}
    </div>
  );
}

/** What's recoverable in this dimension — each row is work with a payoff. */
function RecoveryPanel({ d }: { d: DimensionScore }) {
  const available = pointsAvailable(d);
  return (
    <div className="mt-2 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold text-foreground">
          {available > 0 ? (
            <>
              Recover up to{" "}
              <span className="font-mono tabular-nums text-status-allowed-fg">
                +{available} pts
              </span>{" "}
              in {d.label}
            </>
          ) : (
            <>{d.label} — full marks</>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {d.value}/100
          {d.potential > d.value ? (
            <>
              {" "}
              →{" "}
              <span className="font-semibold tabular-nums text-status-allowed-fg">
                {d.potential}
              </span>{" "}
              with 1-click fixes
            </>
          ) : null}
        </p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{d.explanation}</p>
      {d.deductions.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {d.deductions.map((ded) => (
            <li key={ded.code} className="flex items-baseline justify-between gap-2 text-xs">
              <span className="text-foreground">
                {ded.label}
                {ded.count > 1 ? (
                  <span className="text-muted-foreground"> ×{ded.count}</span>
                ) : null}
              </span>
              <span className="shrink-0">
                <span className="font-mono font-semibold tabular-nums text-status-allowed-fg">
                  +{ded.points}
                </span>{" "}
                <span className="text-[10px] text-muted-foreground">
                  {ded.recoverable ? "1-click" : "manual"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs font-medium text-status-allowed-fg">
          No points left on the table here.
        </p>
      )}
      <p className="mt-3 border-t border-border pt-2 text-[11px] text-muted-foreground">
        Showing only {d.label} issues in the list. Click the chip again to clear.
      </p>
    </div>
  );
}

/** AI dimension: name the bots, show which still need a deliberate decision. */
function AiDecisionPanel({
  d,
  statuses,
}: {
  d: DimensionScore;
  statuses: readonly AiCrawlerStatus[];
}) {
  const needsDecision = statuses.filter((s) => s.status !== "explicit");
  const decided = statuses.filter((s) => s.status === "explicit");
  return (
    <div className="mt-2 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold text-foreground">
          {needsDecision.length > 0 ? (
            <>
              {needsDecision.length} of {statuses.length} AI bots need a decision
            </>
          ) : (
            <>All {statuses.length} major AI bots have explicit policies</>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {d.value}/100 · each decision recovers points
        </p>
      </div>
      <ul className="mt-3 space-y-1.5">
        {[...needsDecision, ...decided].map(({ crawler, status }) => (
          <li key={crawler.id} className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-foreground">
              {status === "explicit" ? (
                <Check className="size-3.5 shrink-0 text-status-allowed-fg" aria-hidden />
              ) : (
                <CircleAlert className="size-3.5 shrink-0 text-status-warning-fg" aria-hidden />
              )}
              <span className="font-medium">{crawler.name}</span>
              <span className="text-muted-foreground">({crawler.owner})</span>
            </span>
            <span
              className={cn(
                "shrink-0 text-[11px]",
                status === "explicit" ? "text-status-allowed-fg" : "text-status-warning-fg",
              )}
            >
              {status === "explicit"
                ? "policy set"
                : status === "inherited"
                  ? "follows catch-all — decide allow/block"
                  : "no policy at all — decide allow/block"}
            </span>
          </li>
        ))}
      </ul>
      {needsDecision.length > 0 ? (
        <Link
          href="/ai-crawlers"
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
        >
          Decide allow/block per bot in the AI Crawler Manager
          <ArrowUpRight className="size-3" aria-hidden />
        </Link>
      ) : null}
      <p className="mt-3 border-t border-border pt-2 text-[11px] text-muted-foreground">
        Showing only AI Crawlers issues in the list. Click the chip again to clear.
      </p>
    </div>
  );
}
