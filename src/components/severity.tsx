import { AlertTriangle, CheckCircle2, Info, XCircle, type LucideIcon } from "lucide-react";
import type { Severity } from "@/types";

/** Status keys used by badges and severity visuals. */
export type StatusKey = "allowed" | "blocked" | "warning" | "info";

interface StatusVisual {
  readonly label: string;
  readonly icon: LucideIcon;
  /** Tailwind classes for a tinted icon chip. */
  readonly chip: string;
}

/** Shared visual config — keeps status colors/icons consistent everywhere. */
export const STATUS_VISUALS: Record<StatusKey, StatusVisual> = {
  allowed: { label: "Allowed", icon: CheckCircle2, chip: "bg-status-allowed-bg text-status-allowed-fg" },
  blocked: { label: "Blocked", icon: XCircle, chip: "bg-status-blocked-bg text-status-blocked-fg" },
  warning: { label: "Warning", icon: AlertTriangle, chip: "bg-status-warning-bg text-status-warning-fg" },
  info: { label: "Info", icon: Info, chip: "bg-status-info-bg text-status-info-fg" },
};

/** Map a validation {@link Severity} to a status key (error → blocked). */
export function severityToStatus(severity: Severity): StatusKey {
  return severity === "error" ? "blocked" : severity === "warning" ? "warning" : "info";
}
