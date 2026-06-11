import { Download, MoveRight, TrendingUp, Undo2, Wand2 } from "lucide-react";
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
 * Sticky command bar — the workspace scoreboard, with recovery as the headline.
 * The dominant reading is "57 → 86": where you are and where the fixes take you.
 * The primary action carries its own payoff ("Fix 7 safe issues · +12 pts").
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
  const safeDelta = report.summary.estimatedAfterSafeFixes - value;

  return (
    <div className="sticky top-14 z-30 -mx-4 border-b border-border bg-background/95 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1" aria-live="polite">
          {/* The headline: current → potential. Recovery is the dominant reading. */}
          <span className="flex items-end gap-2" data-testid="score-current">
            <span className="flex items-baseline gap-1">
              <span className="text-2xl font-bold tabular-nums leading-none text-foreground">
                {value}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                now
              </span>
            </span>
            {recoverable > 0 ? (
              <>
                <MoveRight className="mb-0.5 size-4 text-status-allowed-fg" aria-hidden />
                <span className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold tabular-nums leading-none text-status-allowed-fg">
                    {potential}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-status-allowed-fg/80">
                    potential
                  </span>
                </span>
              </>
            ) : (
              <span className="mb-0.5 text-xs text-muted-foreground">/100</span>
            )}
          </span>
          <span
            className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", BAND_CHIP[band])}
          >
            {HEALTH_BAND_LABEL[band]}
          </span>
          {recoverable > 0 ? (
            <span className="hidden text-xs text-muted-foreground sm:inline">
              <span className="font-semibold tabular-nums text-status-allowed-fg">
                +{recoverable} pts
              </span>{" "}
              recoverable · {fixableCount} {fixableCount === 1 ? "fix" : "fixes"}
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
            {safeDelta > 0 ? <span className="font-semibold">+{safeDelta} pts</span> : null}
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
