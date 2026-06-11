import { Download, MoveRight, Undo2, Wand2 } from "lucide-react";
import type { FetchResult, ScoreBand } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BAND_CHIP: Record<ScoreBand, string> = {
  good: "bg-status-allowed-bg text-status-allowed-fg",
  moderate: "bg-status-warning-bg text-status-warning-fg",
  poor: "bg-status-blocked-bg text-status-blocked-fg",
};

const BAND_TEXT: Record<ScoreBand, string> = {
  good: "High visibility",
  moderate: "Moderate visibility",
  poor: "Low visibility",
};

/** "200 OK · text/plain · 0.2 KB · 14:02 UTC · redirected" — fetch provenance. */
function fetchMeta(fetch: FetchResult, fetchedAt: string, sourceBytes: number): string {
  const parts: string[] = [];
  if (fetch.httpStatus !== undefined)
    parts.push(fetch.httpStatus === 200 ? "200 OK" : `HTTP ${fetch.httpStatus}`);
  if (fetch.contentType) parts.push(fetch.contentType.split(";")[0]!.trim());
  parts.push(`${(sourceBytes / 1024).toFixed(1)} KB`);
  const time = new Date(fetchedAt);
  if (!Number.isNaN(time.getTime())) parts.push(`fetched ${time.toISOString().slice(11, 16)} UTC`);
  if (fetch.redirected) parts.push("redirected");
  return parts.join(" · ");
}

/**
 * The Analyzer's executive summary (Phase 17A) — the ONE score surface. Visibility
 * is the headline with the recovery-first reading (`67 NOW → 81 POTENTIAL`); file
 * health is a contributing metric, never a second hero. The primary action carries
 * its payoff, and fetch provenance replaces the old success callout.
 */
export function VerdictBand({
  domain,
  now,
  potential,
  band,
  searchAllowed,
  searchTotal,
  aiAllowed,
  aiTotal,
  healthNow,
  healthPotential,
  fixableCount,
  safeCount,
  safeDelta,
  canUndo,
  fetch,
  fetchedAt,
  sourceBytes,
  crossToolNote,
  onFixAllSafe,
  onUndo,
  onDownload,
}: {
  domain: string;
  /** Visibility score now / if every in-app fix were applied. */
  now: number;
  potential: number;
  band: ScoreBand;
  searchAllowed: number;
  searchTotal: number;
  aiAllowed: number;
  aiTotal: number;
  /** File health (feeds visibility at 0.3 weight) — contributing metric only. */
  healthNow: number;
  healthPotential: number;
  fixableCount: number;
  safeCount: number;
  /** Visibility points the one-click batch recovers. */
  safeDelta: number;
  canUndo: boolean;
  fetch: FetchResult;
  fetchedAt: string;
  sourceBytes: number;
  /** Workspace provenance cue, e.g. "includes changes from Validate" (17F.4). */
  crossToolNote?: string | null;
  onFixAllSafe: () => void;
  onUndo: () => void;
  onDownload: () => void;
}) {
  const recoverable = potential - now;
  const aiBlocked = aiTotal - aiAllowed;

  // The one-sentence verdict: who's in, who's out, what it costs.
  const sentence = [
    searchAllowed === searchTotal
      ? "Search engines see everything"
      : `${searchAllowed} of ${searchTotal} search engines get in`,
    aiBlocked === 0
      ? `all ${aiTotal} AI bots allowed`
      : `${aiBlocked} of ${aiTotal} AI bots blocked`,
    fixableCount > 0
      ? `${fixableCount} fixable ${fixableCount === 1 ? "issue" : "issues"}${
          recoverable > 0
            ? ` cost${fixableCount === 1 ? "s" : ""} ${recoverable} ${recoverable === 1 ? "pt" : "pts"}`
            : ""
        }`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="sticky top-14 z-30 -mx-4 border-b border-border bg-background/95 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1" aria-live="polite">
          {/* Name the number — "93" alone doesn't say what is being scored. */}
          <span className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Crawler Visibility
            </span>
            <span className="flex items-end gap-2" data-testid="score-current">
              <span className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tabular-nums leading-none text-foreground">
                  {now}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  now
                </span>
              </span>
              {recoverable > 0 ? (
                <>
                  <MoveRight className="mb-0.5 size-4 text-status-allowed-fg" aria-hidden />
                  <span className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold tabular-nums leading-none text-status-allowed-fg">
                      {potential}
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-status-allowed-fg/80">
                      potential
                    </span>
                  </span>
                </>
              ) : (
                <span className="mb-0.5 text-xs text-muted-foreground">/100</span>
              )}
            </span>
          </span>
          <span
            className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", BAND_CHIP[band])}
          >
            {BAND_TEXT[band]}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* No button at zero — "Fix 0 safe issues" reads as a bug on a clean file. */}
          <Button
            size="sm"
            onClick={onFixAllSafe}
            className={safeCount === 0 ? "hidden" : undefined}
          >
            <Wand2 aria-hidden /> Fix {safeCount} safe {safeCount === 1 ? "issue" : "issues"}
            {safeDelta > 0 ? (
              <span className="font-semibold">
                +{safeDelta} {safeDelta === 1 ? "pt" : "pts"}
              </span>
            ) : null}
          </Button>
          {canUndo ? (
            <Button variant="secondary" size="sm" onClick={onUndo}>
              <Undo2 aria-hidden /> Undo
            </Button>
          ) : null}
          <Button
            variant="secondary"
            size="sm"
            onClick={onDownload}
            aria-label="Download robots.txt"
          >
            <Download aria-hidden />
            <span className="hidden sm:inline">Download robots.txt</span>
          </Button>
        </div>
      </div>

      <p className="mt-1 hidden text-xs text-muted-foreground sm:block">{sentence}.</p>

      <div className="mt-1 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="tabular-nums">
          Search {searchAllowed}/{searchTotal} · AI {aiAllowed}/{aiTotal} · File health {healthNow}
          {healthPotential > healthNow ? (
            <>
              {" "}
              → <span className="font-semibold text-status-allowed-fg">{healthPotential}</span>
            </>
          ) : null}
          {crossToolNote ? <span className="text-brand"> · {crossToolNote}</span> : null}
        </span>
        <span className="hidden md:inline">
          {domain} · {fetchMeta(fetch, fetchedAt, sourceBytes)}
        </span>
      </div>
    </div>
  );
}
