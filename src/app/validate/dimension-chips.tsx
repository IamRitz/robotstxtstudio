import type { AuditReport, DimensionScore, HealthBand, ScoreDimension } from "@/types";
import { cn } from "@/lib/utils";

const BAND_DOT: Record<HealthBand, string> = {
  excellent: "bg-status-allowed-dot",
  good: "bg-status-allowed-dot",
  "needs-attention": "bg-status-warning-dot",
  poor: "bg-status-blocked-dot",
};

/**
 * The score-as-navigation strip (replaces the Score Breakdown section). One compact
 * chip per dimension: `SEO 88 −12`. Clicking a chip filters the issue list to that
 * dimension and opens its deduction breakdown — "why am I not at 100?" is one click.
 */
export function DimensionChips({
  report,
  active,
  onToggle,
}: {
  report: AuditReport;
  active: ScoreDimension | null;
  onToggle: (dimension: ScoreDimension) => void;
}) {
  const activeDim = report.dimensions.find((d) => d.dimension === active);
  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Score by dimension">
        {report.dimensions.map((d) => {
          const lost = d.deductions.reduce((s, ded) => s + ded.points, 0);
          const isActive = d.dimension === active;
          return (
            <button
              key={d.dimension}
              type="button"
              aria-pressed={isActive}
              onClick={() => onToggle(d.dimension)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "border-brand bg-brand-muted text-foreground"
                  : "border-border bg-card text-foreground hover:border-muted-foreground/40",
              )}
            >
              <span className={cn("size-1.5 rounded-full", BAND_DOT[d.band])} aria-hidden />
              {d.label}
              <span className="font-mono font-bold tabular-nums">{d.value}</span>
              {lost > 0 ? (
                <span className="font-mono tabular-nums text-status-blocked-fg">−{lost}</span>
              ) : (
                <span className="text-status-allowed-fg" aria-label="full marks">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeDim ? <DeductionPanel d={activeDim} /> : null}
    </div>
  );
}

/** Why this dimension lost points — every row traceable to a rule. */
function DeductionPanel({ d }: { d: DimensionScore }) {
  return (
    <div className="mt-2 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold text-foreground">
          {d.label} — {d.value}/100
        </p>
        {d.potential > d.value ? (
          <p className="text-xs text-muted-foreground">
            Potential after fixes:{" "}
            <span className="font-semibold tabular-nums text-status-allowed-fg">{d.potential}</span>
          </p>
        ) : null}
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
                {ded.recoverable ? (
                  <span className="ml-1.5 text-[10px] font-medium text-status-allowed-fg">
                    fixable
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 font-mono tabular-nums text-status-blocked-fg">
                −{ded.points}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs font-medium text-status-allowed-fg">No issues — full marks.</p>
      )}
      <p className="mt-3 border-t border-border pt-2 text-[11px] text-muted-foreground">
        Showing only {d.label} issues in the list. Click the chip again to clear.
      </p>
    </div>
  );
}
