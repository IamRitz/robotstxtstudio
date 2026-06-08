import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_VISUALS, type StatusKey } from "./severity";

const DOT: Record<StatusKey, string> = {
  allowed: "bg-status-allowed-dot",
  blocked: "bg-status-blocked-dot",
  warning: "bg-status-warning-dot",
  info: "bg-status-info-dot",
};

/** A pill badge with a status dot (Allowed / Blocked / Warning / Info). */
export function StatusBadge({
  status,
  label,
  className,
}: {
  status: StatusKey;
  label?: string;
  className?: string;
}) {
  return (
    <Badge variant={status} className={className}>
      <span className={cn("size-1.5 rounded-full", DOT[status])} aria-hidden />
      {label ?? STATUS_VISUALS[status].label}
    </Badge>
  );
}
