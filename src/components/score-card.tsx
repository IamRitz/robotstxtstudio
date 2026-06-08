import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { HealthGauge } from "./health-gauge";
import { SectionHeader } from "./section-header";

export interface ScoreMetric {
  readonly label: string;
  readonly value: string;
}

/** A gauge + title + optional sub-metrics — used for health/visibility scores. */
export function ScoreCard({
  eyebrow,
  title,
  description,
  value,
  metrics,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  value: number;
  metrics?: readonly ScoreMetric[];
  className?: string;
}) {
  return (
    <Card className={cn("p-6", className)}>
      {eyebrow ? <SectionHeader className="mb-4">{eyebrow}</SectionHeader> : null}
      <div className="flex items-center gap-5">
        <HealthGauge value={value} />
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      {metrics && metrics.length > 0 ? (
        <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4">
          {metrics.map((m) => (
            <div key={m.label}>
              <dt className="text-xs text-muted-foreground">{m.label}</dt>
              <dd className="text-sm font-semibold tabular-nums text-foreground">{m.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </Card>
  );
}
