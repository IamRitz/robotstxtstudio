import { Check } from "lucide-react";
import type { AuditReport, DimensionScore, HealthBand, ScoreDimension } from "@/types";
import { cn } from "@/lib/utils";

const BAND_DOT: Record<HealthBand, string> = {
  excellent: "bg-status-allowed-dot",
  good: "bg-status-allowed-dot",
  "needs-attention": "bg-status-warning-dot",
  poor: "bg-status-blocked-dot",
};

/** Points still on the table in a dimension (its total deductions). */
export function pointsAvailable(d: DimensionScore): number {
  return d.deductions.reduce((s, ded) => s + ded.points, 0);
}

/**
 * The score-as-navigation chip row (Phase 16, lifted to shared in 17B.3). Each chip
 * is a work queue, not a stat: `SEO 96 +4` = the points still recoverable there.
 * Clicking toggles a dimension filter; what renders under an active chip (recovery
 * panel, nothing, …) is the caller's business.
 */
export function DimensionChipStrip({
  report,
  active,
  onToggle,
}: {
  report: AuditReport;
  active: ScoreDimension | null;
  onToggle: (dimension: ScoreDimension) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Score by dimension">
      {report.dimensions.map((d) => {
        const available = pointsAvailable(d);
        const isActive = d.dimension === active;
        return (
          <button
            key={d.dimension}
            type="button"
            aria-pressed={isActive}
            title={
              available > 0
                ? `${available} points to recover in ${d.label} — show the work`
                : `${d.label} is at full marks`
            }
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
            {available > 0 ? (
              <span className="font-mono font-semibold tabular-nums text-status-allowed-fg">
                +{available}
              </span>
            ) : (
              <Check className="size-3 text-status-allowed-fg" aria-label="full marks" />
            )}
          </button>
        );
      })}
    </div>
  );
}
