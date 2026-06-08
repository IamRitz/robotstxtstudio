import * as React from "react";
import { cn } from "@/lib/utils";

/** Accessible on/off toggle (no Radix): button[role=switch] + aria-checked. */
export function Switch({
  checked,
  onCheckedChange,
  disabled,
  "aria-label": ariaLabel,
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "inline-flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50",
        checked ? "justify-end bg-brand" : "justify-start bg-input",
        className,
      )}
    >
      <span className={cn("size-4 rounded-full bg-card shadow-sm transition", !checked && "bg-muted-foreground/70")} />
    </button>
  );
}
