import { scoreBand, type ScoreBand } from "@/types";
import { cn } from "@/lib/utils";

const BAND_COLOR: Record<ScoreBand, string> = {
  good: "var(--status-allowed-dot)",
  moderate: "var(--status-warning-dot)",
  poor: "var(--status-blocked-dot)",
};

const BAND_LABEL: Record<ScoreBand, string> = {
  good: "Good",
  moderate: "Moderate",
  poor: "Poor",
};

/**
 * Circular score gauge (0–100), colored by band (80+/60–79/0–59 = green/amber/red).
 * The numeric score is exposed as text (accessibility, not color-only).
 */
export function HealthGauge({
  value,
  size = 96,
  label,
  className,
}: {
  value: number;
  size?: number;
  label?: string;
  className?: string;
}) {
  const band = scoreBand(value);
  const clamped = Math.max(0, Math.min(100, value));
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Score ${Math.round(clamped)} of 100, ${BAND_LABEL[band]}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={BAND_COLOR[band]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-bold tabular-nums text-foreground">
          {Math.round(clamped)}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {label ?? "/100"}
        </span>
      </div>
    </div>
  );
}
