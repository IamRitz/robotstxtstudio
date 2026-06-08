import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { STATUS_VISUALS, type StatusKey } from "./severity";

/** Inline message with an icon — success/info/warning/error feedback. */
export function Callout({
  status,
  title,
  children,
  className,
}: {
  status: StatusKey;
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  const { icon: Icon, chip } = STATUS_VISUALS[status];
  return (
    <div role="status" className={cn("flex items-start gap-3 rounded-xl border border-border bg-card p-4", className)}>
      <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full", chip)} aria-hidden>
        <Icon className="size-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {children ? <div className="mt-0.5 text-xs text-muted-foreground">{children}</div> : null}
      </div>
    </div>
  );
}
