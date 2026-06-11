import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./breadcrumb";

/** Page title block: optional breadcrumb, display heading, subtitle, and actions. */
export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: readonly string[];
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-8", className)}>
      {breadcrumb ? <Breadcrumb items={breadcrumb} className="mb-2" /> : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
