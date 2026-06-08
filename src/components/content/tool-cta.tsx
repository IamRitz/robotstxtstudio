import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TOOLS, type ToolId } from "@/config/content";
import { Card } from "@/components/ui/card";

/** Prominent CTA card linking into a tool. */
export function ToolCTA({ tool }: { tool: ToolId }) {
  const t = TOOLS[tool];
  const Icon = t.icon;
  return (
    <Card className="flex flex-col items-start gap-4 bg-primary p-6 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground">
          <Icon className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-base font-semibold">{t.title}</h2>
          <p className="mt-0.5 text-sm text-white/70">{t.description}</p>
        </div>
      </div>
      <Link
        href={t.href}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-medium text-brand-foreground hover:opacity-90"
      >
        {t.cta} <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </Card>
  );
}
