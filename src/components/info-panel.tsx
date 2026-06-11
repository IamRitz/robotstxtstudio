import type { ReactNode } from "react";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

/** Blue impact/info panel with a left accent border (e.g. "what this does"). */
export function InfoPanel({
  title,
  children,
  icon,
  className,
}: {
  title?: string;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border-l-4 border-brand bg-brand-muted p-4", className)}>
      {title ? (
        <div className="mb-1 flex items-center gap-2">
          <span className="text-brand [&_svg]:size-3.5" aria-hidden>
            {icon ?? <Zap />}
          </span>
          <span className="text-xs font-semibold text-brand">{title}</span>
        </div>
      ) : null}
      <div className="text-xs text-brand">{children}</div>
    </div>
  );
}
