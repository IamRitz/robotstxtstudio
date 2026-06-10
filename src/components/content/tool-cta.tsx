"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { TOOLS, type ToolId } from "@/config/content";
import { Card } from "@/components/ui/card";
import { classifyPath, trackCtaClicked } from "@/lib/analytics";

/** Prominent CTA card linking into a tool. The `compact` variant is a slim banner
 *  used above-the-fold and mid-article; the default is the full footer CTA. */
export function ToolCTA({ tool, variant = "full" }: { tool: ToolId; variant?: "full" | "compact" }) {
  const t = TOOLS[tool];
  const Icon = t.icon;
  const pathname = usePathname();
  const onCta = () => trackCtaClicked(tool, pathname ?? "", classifyPath(pathname ?? "/"), `tool-cta:${variant}`);

  if (variant === "compact") {
    return (
      <Link
        href={t.href}
        onClick={onCta}
        className="group flex items-center justify-between gap-3 rounded-xl border border-brand/30 bg-brand/5 p-3 hover:border-brand"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground">
            <Icon className="size-4" aria-hidden />
          </span>
          <span className="min-w-0 text-sm font-semibold text-foreground">{t.title}</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-brand">
          {t.cta} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </Link>
    );
  }

  return (
    <Card className="flex flex-col items-start gap-4 bg-surface-dark p-6 text-surface-dark-foreground sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground">
          <Icon className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-base font-semibold">{t.title}</h2>
          <p className="mt-0.5 text-sm text-surface-dark-foreground/70">{t.description}</p>
        </div>
      </div>
      <Link
        href={t.href}
        onClick={onCta}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-medium text-brand-foreground hover:opacity-90"
      >
        {t.cta} <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </Card>
  );
}
