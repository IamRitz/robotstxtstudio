"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, TrendingUp } from "lucide-react";
import type { AuditReport, DimensionScore, HealthBand } from "@/types";
import { HEALTH_BAND_LABEL } from "@/types";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/section-header";
import { cn } from "@/lib/utils";

/** Band → status palette (theme-aware tokens). Excellent/Good = green, Needs
 *  Attention = amber, Poor = red. Static class strings (Tailwind-safe). */
const BAND_VISUAL: Record<HealthBand, { ring: string; text: string; chip: string; bar: string }> = {
  excellent: {
    ring: "var(--status-allowed-dot)",
    text: "text-status-allowed-fg",
    chip: "bg-status-allowed-bg text-status-allowed-fg",
    bar: "bg-status-allowed-dot",
  },
  good: {
    ring: "var(--status-allowed-dot)",
    text: "text-status-allowed-fg",
    chip: "bg-status-allowed-bg text-status-allowed-fg",
    bar: "bg-status-allowed-dot",
  },
  "needs-attention": {
    ring: "var(--status-warning-dot)",
    text: "text-status-warning-fg",
    chip: "bg-status-warning-bg text-status-warning-fg",
    bar: "bg-status-warning-dot",
  },
  poor: {
    ring: "var(--status-blocked-dot)",
    text: "text-status-blocked-fg",
    chip: "bg-status-blocked-bg text-status-blocked-fg",
    bar: "bg-status-blocked-dot",
  },
};

/** Count a number up to `target` (skipped under prefers-reduced-motion). */
function useCountUp(target: number): number {
  const [value, setValue] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || prev.current === target) {
      setValue(target);
      prev.current = target;
      return;
    }
    const from = prev.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 600);
      setValue(Math.round(from + (target - from) * p));
      if (p < 1) raf = requestAnimationFrame(tick);
      else prev.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
}

function BandChip({ band }: { band: HealthBand }) {
  return (
    <span
      className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", BAND_VISUAL[band].chip)}
    >
      {HEALTH_BAND_LABEL[band]}
    </span>
  );
}

/** Animated circular score ring, colored by band. */
function OverallRing({ value, band }: { value: number; band: HealthBand }) {
  const display = useCountUp(value);
  const size = 132;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Overall health ${value} of 100, ${HEALTH_BAND_LABEL[band]}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={BAND_VISUAL[band].ring}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold tabular-nums text-foreground">{display}</span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          /100
        </span>
      </div>
    </div>
  );
}

/** Session trend of overall scores: 78 → 84 → 91. */
function Trend({ values }: { values: readonly number[] }) {
  return (
    <p className="mt-3 inline-flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
      <TrendingUp className="size-3.5 text-status-allowed-fg" aria-hidden />
      <span className="font-medium text-foreground">Session:</span>
      {values.map((v, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          {i > 0 ? <span aria-hidden>→</span> : null}
          <span
            className={cn(
              "tabular-nums",
              i === values.length - 1 && "font-semibold text-status-allowed-fg",
            )}
          >
            {v}
          </span>
        </span>
      ))}
    </p>
  );
}

function CategoryCard({ d }: { d: DimensionScore }) {
  const v = BAND_VISUAL[d.band];
  return (
    <details className="group rounded-xl border border-border bg-card p-4 open:shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{d.label}</span>
          <BandChip band={d.band} />
        </span>
        <span className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold tabular-nums text-foreground">
            {d.value}
          </span>
          <ChevronDown
            className="size-4 text-muted-foreground transition-transform group-open:rotate-180"
            aria-hidden
          />
        </span>
      </summary>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", v.bar)}
          style={{ width: `${d.value}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{d.explanation}</p>

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
              <span className="shrink-0 font-mono tabular-nums text-status-blocked-fg">
                −{ded.points}
              </span>
            </li>
          ))}
          {d.potential > d.value ? (
            <li className="flex items-baseline justify-between gap-2 border-t border-border pt-1.5 text-xs">
              <span className="font-medium text-status-allowed-fg">Potential after fixes</span>
              <span className="shrink-0 font-mono font-semibold tabular-nums text-foreground">
                {d.potential}
              </span>
            </li>
          ) : null}
        </ul>
      ) : (
        <p className="mt-3 text-xs font-medium text-status-allowed-fg">No issues — full marks.</p>
      )}
    </details>
  );
}

/**
 * Validator 2.0 audit dashboard (Phase 15B): overall health ring + five
 * deduction-based category scores, an executive summary, and the in-session score
 * trend. Every number is traceable to a rule (see the category breakdowns).
 */
export function AuditDashboard({
  report,
  trend,
}: {
  report: AuditReport;
  trend: readonly number[];
}) {
  const { overall, summary, dimensions } = report;
  return (
    <section className="space-y-6" aria-label="Audit report">
      <Card className="p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <OverallRing value={overall.value} band={overall.band} />
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <SectionHeader>Overall health</SectionHeader>
              <BandChip band={overall.band} />
            </div>
            <p className="mt-2 text-sm text-foreground">{summary.headline}</p>
            {trend.length > 1 ? <Trend values={trend} /> : null}
            {summary.estimatedAfterSafeFixes > overall.value ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Estimated{" "}
                <span className="font-semibold text-status-allowed-fg">
                  {summary.estimatedAfterSafeFixes}
                </span>{" "}
                after applying safe fixes.
              </p>
            ) : null}
          </div>
        </div>

        {summary.strengths.length > 0 || summary.weaknesses.length > 0 ? (
          <div className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Strengths
              </p>
              <ul className="mt-2 space-y-1 text-xs text-foreground">
                {summary.strengths.length > 0 ? (
                  summary.strengths.map((s, i) => <li key={i}>✓ {s}</li>)
                ) : (
                  <li className="text-muted-foreground">—</li>
                )}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Weaknesses
              </p>
              <ul className="mt-2 space-y-1 text-xs text-foreground">
                {summary.weaknesses.length > 0 ? (
                  summary.weaknesses.map((w, i) => <li key={i}>• {w}</li>)
                ) : (
                  <li className="text-muted-foreground">None — looking good.</li>
                )}
              </ul>
            </div>
          </div>
        ) : null}

        {summary.priorities.length > 0 ? (
          <div className="mt-5 border-t border-border pt-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Highest-priority fixes
            </p>
            <ol className="mt-2 space-y-1.5">
              {summary.priorities.map((p) => (
                <li key={p.code} className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="text-foreground">{p.title}</span>
                  <span className="shrink-0 font-mono tabular-nums text-muted-foreground">
                    +{p.points} {p.recoverable ? "· 1-click" : "· manual"}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </Card>

      <div>
        <SectionHeader className="mb-3">Score breakdown</SectionHeader>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dimensions.map((d) => (
            <CategoryCard key={d.dimension} d={d} />
          ))}
        </div>
      </div>
    </section>
  );
}
