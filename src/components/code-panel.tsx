import type { ReactNode } from "react";
import { Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";

/**
 * Dark monospace code panel (robots.txt previews / rule blocks). Optional title bar
 * with a copy button and extra actions.
 */
export function CodePanel({
  code,
  title,
  actions,
  showCopy = true,
  className,
}: {
  code: string;
  title?: string;
  actions?: ReactNode;
  showCopy?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-xl bg-primary text-primary-foreground", className)}>
      {(title || showCopy || actions) && (
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-2">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/60">
            <Terminal className="size-3.5" aria-hidden />
            {title ?? "robots.txt"}
          </span>
          <div className="flex items-center gap-2">
            {actions}
            {showCopy ? <CopyButton value={code} /> : null}
          </div>
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-xs leading-5">
        <code className="font-mono text-white/90 whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}
