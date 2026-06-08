import type { ReactNode } from "react";
import { AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Centered error state: icon, heading, message, optional retry. */
export function ErrorState({
  title = "Something went wrong",
  message,
  action,
  className,
}: {
  title?: string;
  message?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center",
        className,
      )}
    >
      <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-status-blocked-bg text-status-blocked-fg" aria-hidden>
        <AlertOctagon className="size-5" />
      </span>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {message ? <p className="mt-1 max-w-sm text-xs text-muted-foreground">{message}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
