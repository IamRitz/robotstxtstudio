"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { ArrowRight, Download, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/section-header";
import { setHandoff } from "@/lib/handoff";
import { cn } from "@/lib/utils";

/** A single suggested next action after a tool produces a result. */
export type NextStep =
  /** Navigate to another tool/guide. */
  | { kind: "link"; label: string; description: string; icon: LucideIcon; href: Route }
  /** Carry the current robots.txt into another tool, then navigate. */
  | { kind: "handoff"; label: string; description: string; icon: LucideIcon; href: Route; text: string }
  /** Download the current robots.txt as a file. */
  | { kind: "download"; label: string; description: string; icon?: LucideIcon; text: string; filename?: string };

const CARD = "group h-full p-4 transition-colors hover:border-brand/40 hover:bg-muted/40";

function ActionFooter({ label }: { label: string }) {
  return (
    <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand">
      {label} <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </span>
  );
}

function downloadText(text: string, filename = "robots.txt") {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * "Next steps" rail (Phase 14E). Renders contextual follow-on actions so every tool
 * result leads naturally into another tool — increasing multi-tool sessions instead
 * of dead-ending. Handoff steps carry the user's robots.txt to the next tool.
 */
export function NextSteps({
  steps,
  title = "Next steps",
  className,
}: {
  steps: readonly NextStep[];
  title?: string;
  className?: string;
}) {
  const router = useRouter();

  return (
    <section aria-label="Next steps" className={cn("mt-8", className)}>
      <SectionHeader className="mb-3">{title}</SectionHeader>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon ?? Download;
          const head = (
            <>
              <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-foreground">
                <Icon className="size-4" aria-hidden />
              </span>
              <p className="mt-3 text-sm font-semibold text-foreground">{step.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
            </>
          );

          if (step.kind === "link") {
            return (
              <Link key={step.label} href={step.href} className="block">
                <Card className={CARD}>
                  {head}
                  <ActionFooter label="Open" />
                </Card>
              </Link>
            );
          }

          if (step.kind === "handoff") {
            return (
              <button
                key={step.label}
                type="button"
                className="block w-full text-left"
                onClick={() => {
                  setHandoff(step.text);
                  router.push(step.href);
                }}
              >
                <Card className={CARD}>
                  {head}
                  <ActionFooter label="Open" />
                </Card>
              </button>
            );
          }

          return (
            <button
              key={step.label}
              type="button"
              className="block w-full text-left"
              onClick={() => downloadText(step.text, step.filename)}
            >
              <Card className={CARD}>
                {head}
                <ActionFooter label="Download" />
              </Card>
            </button>
          );
        })}
      </div>
    </section>
  );
}
