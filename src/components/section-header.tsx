import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Uppercase, tracked eyebrow label that introduces a card/section. */
export function SectionHeader({
  children,
  icon,
  className,
}: {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {icon ? <span className="text-muted-foreground [&_svg]:size-4" aria-hidden>{icon}</span> : null}
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {children}
      </span>
    </div>
  );
}
