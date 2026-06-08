import { cn } from "@/lib/utils";

/** A category row with a proportional allowed/blocked bar and counts. */
export function CategoryBar({
  label,
  allowed,
  blocked,
  className,
}: {
  label: string;
  allowed: number;
  blocked: number;
  className?: string;
}) {
  const total = allowed + blocked;
  const allowedPct = total === 0 ? 0 : (allowed / total) * 100;

  return (
    <div className={cn("grid grid-cols-[1fr_auto_4rem] items-center gap-3", className)}>
      <span className="truncate text-sm font-medium text-foreground">{label}</span>
      <span className="flex items-center gap-2 text-xs tabular-nums">
        <span className="text-status-allowed-fg">{allowed} allowed</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-status-blocked-fg">{blocked} blocked</span>
      </span>
      <span className="flex h-1.5 overflow-hidden rounded-full bg-status-blocked-bg" aria-hidden>
        <span className="h-full bg-status-allowed-dot" style={{ width: `${allowedPct}%` }} />
      </span>
    </div>
  );
}
