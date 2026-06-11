import { Download, TrendingUp, Undo2, Wand2 } from "lucide-react";
import type { AuditReport } from "@/types";
import { HEALTH_BAND_LABEL, type HealthBand } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BAND_CHIP: Record<HealthBand, string> = {
  excellent: "bg-status-allowed-bg text-status-allowed-fg",
  good: "bg-status-allowed-bg text-status-allowed-fg",
  "needs-attention": "bg-status-warning-bg text-status-warning-fg",
  poor: "bg-status-blocked-bg text-status-blocked-fg",
};

/**
 * Sticky command bar — the workspace scoreboard. Always visible while fixing:
 * current score + band, the potential score with how many fixes reach it, and the
 * global actions (Fix All Safe / Undo / Download). Sits just below the site header.
 */
export function CommandBar({
  report,
  fixableCount,
  safeCount,
  canUndo,
  trend,
  onFixAllSafe,
  onUndo,
  onDownload,
}: {
  report: AuditReport;
  /** Issues with any in-app fix (safe or review) — the path to `potential`. */
  fixableCount: number;
  /** Issues resolvable by the one-click "Fix All Safe" batch. */
  safeCount: number;
  canUndo: boolean;
  /** Session score trail across applied fixes, e.g. [71, 75, 84]. */
  trend: readonly number[];
  onFixAllSafe: () => void;
  onUndo: () => void;
  onDownload: () => void;
}) {
  const { value, band, potential } = report.overall;
  const recoverable = potential - value;

  return (
    <div className="sticky top-14 z-30 -mx-4 border-b border-border bg-background/95 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1" aria-live="polite">
          <span className="flex items-baseline gap-1" data-testid="score-current">
            <span className="text-2xl font-bold tabular-nums leading-none text-foreground">
              {value}
            </span>
            <span className="text-xs text-muted-foreground">/100</span>
          </span>
          <span
            className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", BAND_CHIP[band])}
          >
            {HEALTH_BAND_LABEL[band]}
          </span>
          {recoverable > 0 ? (
            <span className="text-xs text-muted-foreground">
              Potential{" "}
              <span className="font-semibold tabular-nums text-status-allowed-fg">{potential}</span>
              <span className="hidden sm:inline">
                {" "}
                — fix {fixableCount} {fixableCount === 1 ? "issue" : "issues"} to recover{" "}
                <span className="font-medium tabular-nums">+{recoverable}</span> pts
              </span>
              <span className="sm:hidden"> · +{recoverable} pts</span>
            </span>
          ) : null}
          {trend.length > 1 ? (
            <span className="hidden items-center gap-1 text-xs text-muted-foreground md:inline-flex">
              <TrendingUp className="size-3.5 text-status-allowed-fg" aria-hidden />
              {trend.join(" → ")}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onFixAllSafe} disabled={safeCount === 0}>
            <Wand2 aria-hidden /> Fix {safeCount} safe {safeCount === 1 ? "issue" : "issues"}
          </Button>
          {canUndo ? (
            <Button variant="secondary" size="sm" onClick={onUndo}>
              <Undo2 aria-hidden /> Undo
            </Button>
          ) : null}
          <Button
            variant="secondary"
            size="sm"
            onClick={onDownload}
            aria-label="Download robots.txt"
          >
            <Download aria-hidden />
            <span className="hidden sm:inline">Download robots.txt</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
