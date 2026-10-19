import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Premium locked-state surface (Phase 14C).
 *
 * Renders a realistic, blurred report preview behind a centered lock overlay with a
 * strong CTA — so the user instantly understands "run an analysis to unlock this"
 * instead of reading a weak line of text. The backdrop is decorative
 * (`aria-hidden` + non-interactive); pass a custom `backdrop` to blur real content.
 */
export function LockedReport({
  title = "Unlock your full crawler report",
  description = "Run a free analysis to reveal your visibility score, AI-crawler access, and every robots.txt issue — with one-click fixes.",
  action,
  backdrop,
  className,
}: {
  title?: string;
  description?: string;
  /** CTA node (button / form). Rendered inside the overlay card. */
  action?: ReactNode;
  /** Content to blur behind the lock. Defaults to a faux report preview. */
  backdrop?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-border", className)}>
      {/* Blurred backdrop — decorative only, never focusable or announced. */}
      <div aria-hidden className="pointer-events-none select-none blur-[6px]" inert>
        {backdrop ?? <ReportPreview />}
      </div>

      {/* Scrim so the blur clearly reads as "locked". */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background"
      />

      {/* Overlay card */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card/95 p-6 text-center shadow-lg backdrop-blur-sm">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-muted text-brand">
            <Lock className="size-5" aria-hidden />
          </span>
          <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
          <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted-foreground">{description}</p>
          {action ? <div className="mt-5 flex flex-col items-center gap-2">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}

/** Static, realistic report skeleton used as the default blurred backdrop. */
function ReportPreview() {
  return (
    <div className="space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <FauxScoreCard eyebrow="Search visibility" value={86} tone="bg-status-allowed-dot" />
        <FauxScoreCard eyebrow="Robots.txt Health" value={72} tone="bg-status-warning-dot" />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-3 h-2 w-28 rounded-full bg-muted" />
        <div className="space-y-2.5">
          {[
            { label: "Search engines", allowed: 9, blocked: 1 },
            { label: "AI crawlers", allowed: 4, blocked: 7 },
            { label: "SEO tools", allowed: 6, blocked: 0 },
          ].map((row) => {
            const total = row.allowed + row.blocked;
            return (
              <div key={row.label} className="flex items-center gap-3">
                <span className="w-28 text-xs font-medium text-foreground">{row.label}</span>
                <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className="bg-status-allowed-dot"
                    style={{ width: `${(row.allowed / total) * 100}%` }}
                  />
                  <span
                    className="bg-status-blocked-dot"
                    style={{ width: `${(row.blocked / total) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-3 h-2 w-24 rounded-full bg-muted" />
        <div className="space-y-3">
          {["bg-status-warning-dot", "bg-status-blocked-dot", "bg-status-info-dot"].map(
            (tone, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={cn("mt-0.5 size-5 shrink-0 rounded-full", tone)} />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2 w-2/3 rounded-full bg-muted" />
                  <div className="h-2 w-full rounded-full bg-muted/70" />
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function FauxScoreCard({ eyebrow, value, tone }: { eyebrow: string; value: number; tone: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
      <div className="relative flex size-16 items-center justify-center">
        <span className={cn("absolute inset-0 rounded-full opacity-20", tone)} />
        <span className="text-lg font-bold text-foreground">{value}</span>
      </div>
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {eyebrow}
        </p>
        <div className="h-2 w-16 rounded-full bg-muted/70" />
      </div>
    </div>
  );
}
