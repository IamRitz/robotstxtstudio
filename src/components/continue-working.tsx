"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import type { ScoreBand } from "@/types";
import {
  clearRecentAnalyses,
  listRecentAnalyses,
  removeRecentAnalysis,
  type RecentAnalysis,
} from "@/lib/recent-analyses";
import { trackDashboardHistoryCleared, trackDashboardResumeClicked } from "@/lib/analytics";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/section-header";
import { buttonVariants, Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BAND_DOT: Record<ScoreBand, string> = {
  good: "bg-status-allowed-dot",
  moderate: "bg-status-warning-dot",
  poor: "bg-status-blocked-dot",
};

/** "2h ago" — coarse on purpose; the dashboard is a resume list, not a log. */
function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "just now";
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function Delta({ entry }: { entry: RecentAnalysis }) {
  if (entry.previousVisibility === undefined) return null;
  const delta = entry.visibility.value - entry.previousVisibility;
  if (delta === 0) return null;
  return (
    <span
      className={cn(
        "font-mono text-xs font-semibold tabular-nums",
        delta > 0 ? "text-status-allowed-fg" : "text-status-blocked-fg",
      )}
      title={`Was ${entry.previousVisibility} on the previous check`}
    >
      {delta > 0 ? `▲ +${delta}` : `▼ ${delta}`}
    </span>
  );
}

/**
 * The homepage "Continue working" dashboard (Phase 17C). Returning users see their
 * recent analyses — score, delta since last check, fixes left, age — and reopen
 * one in a single click (the Analyzer restores from the local snapshot, no
 * refetch). Strangers see `fallback` (the locked-report teaser) untouched.
 * History lives only in this browser's localStorage.
 */
export function ContinueWorking({ fallback }: { fallback: ReactNode }) {
  // null = not yet read (render the stranger view; avoids hydration mismatch).
  const [entries, setEntries] = useState<RecentAnalysis[] | null>(null);
  useEffect(() => {
    setEntries(listRecentAnalyses());
  }, []);

  if (entries === null || entries.length === 0) return <>{fallback}</>;

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <SectionHeader>Continue working</SectionHeader>
        <button
          type="button"
          onClick={() => {
            trackDashboardHistoryCleared();
            clearRecentAnalyses();
            setEntries([]);
          }}
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          Clear history
        </button>
      </div>
      <Card className="divide-y divide-border p-0" data-testid="continue-working">
        {entries.map((e) => (
          <div key={e.domain} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold uppercase text-foreground"
              aria-hidden
            >
              {e.domain.charAt(0)}
            </span>
            <div className="min-w-0 flex-1 basis-36">
              <p className="truncate text-sm font-medium text-foreground">{e.domain}</p>
              <p className="text-xs text-muted-foreground">
                {e.safeFixCount > 0
                  ? `${e.safeFixCount} quick ${e.safeFixCount === 1 ? "fix" : "fixes"} available`
                  : e.findingCount > 0
                    ? `${e.findingCount} open ${e.findingCount === 1 ? "finding" : "findings"}`
                    : "no findings"}{" "}
                · {relativeTime(e.fetchedAt)}
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-1.5">
              <span
                className={cn("size-1.5 rounded-full", BAND_DOT[e.visibility.band])}
                aria-hidden
              />
              <span className="font-mono text-sm font-bold tabular-nums text-foreground">
                {e.visibility.value}
              </span>
              <Delta entry={e} />
            </span>
            <span className="ml-auto flex shrink-0 items-center gap-1">
              <Link
                href={`/analyze?domain=${encodeURIComponent(e.domain)}`}
                onClick={() => {
                  const ageHours = (Date.now() - new Date(e.fetchedAt).getTime()) / 3_600_000;
                  trackDashboardResumeClicked(
                    Math.round(ageHours * 10) / 10,
                    e.previousVisibility !== undefined,
                  );
                }}
                className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "shrink-0")}
              >
                Continue <ArrowRight className="size-3" aria-hidden />
              </Link>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Remove ${e.domain} from history`}
                onClick={() => {
                  removeRecentAnalysis(e.domain);
                  setEntries((cur) => (cur ?? []).filter((x) => x.domain !== e.domain));
                }}
                className="shrink-0 px-2 text-muted-foreground"
              >
                <X aria-hidden />
              </Button>
            </span>
          </div>
        ))}
        <p className="px-4 py-2 text-[11px] text-muted-foreground">
          History is stored only in this browser — nothing is uploaded.
        </p>
      </Card>
    </div>
  );
}
