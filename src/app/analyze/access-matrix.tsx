import { useMemo } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { isAllowed } from "@/features/tester";
import { CATEGORY_LABELS, CATEGORY_ORDER, crawlersByCategory } from "@/config/crawlers";
import type { Crawler, RobotsFile } from "@/types";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/section-header";
import { CrawlerBadge } from "@/components/crawler-badge";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";

/**
 * "Who can see {domain}" (Phase 17B.1) — the Analyzer's signature answer, in names
 * instead of percentages. One row per crawler category: an allowed/blocked split
 * bar, the count, and a chip for every BLOCKED crawler (the exceptions are the
 * information — a fully-allowed row needs no names). Each row expands into the
 * full per-crawler verdict list. Same data as ever: the Tester's
 * `isAllowed(file, "/", ua)` over the catalog — no new domain logic.
 */
export function AccessMatrix({ file, domain }: { file: RobotsFile; domain: string }) {
  const categories = useMemo(
    () =>
      CATEGORY_ORDER.map((category) => {
        const crawlers = crawlersByCategory(category).map((crawler: Crawler) => ({
          crawler,
          allowed: isAllowed(file, "/", crawler.userAgent),
        }));
        const blocked = crawlers.filter((c) => !c.allowed).map((c) => c.crawler);
        return {
          category,
          crawlers,
          blocked,
          allowed: crawlers.length - blocked.length,
          total: crawlers.length,
        };
      }),
    [file],
  );

  const totals = categories.reduce(
    (acc, c) => ({ allowed: acc.allowed + c.allowed, total: acc.total + c.total }),
    { allowed: 0, total: 0 },
  );

  return (
    <Card className="p-6" data-testid="access-matrix">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <SectionHeader>Who can see {domain}</SectionHeader>
        <p className="text-xs tabular-nums text-muted-foreground">
          {totals.allowed} of {totals.total} known crawlers get in
        </p>
      </div>
      <div className="space-y-2">
        {categories.map(({ category, crawlers, blocked, allowed, total }) => (
          <details key={category} className="group rounded-lg border border-border">
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
              <ChevronDown
                className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                aria-hidden
              />
              <span className="w-32 shrink-0 text-sm font-medium text-foreground">
                {CATEGORY_LABELS[category]}
              </span>
              {/* Allowed/blocked split bar — red is meant to be loud. */}
              <span
                className="flex h-2 w-24 shrink-0 overflow-hidden rounded-full bg-muted sm:w-32"
                role="img"
                aria-label={`${allowed} of ${total} allowed`}
              >
                <span
                  className="block h-full bg-status-allowed-dot"
                  style={{ width: `${total === 0 ? 0 : (allowed / total) * 100}%` }}
                />
                <span
                  className="block h-full bg-status-blocked-dot"
                  style={{ width: `${total === 0 ? 0 : ((total - allowed) / total) * 100}%` }}
                />
              </span>
              <span
                className={cn(
                  "shrink-0 text-xs tabular-nums",
                  blocked.length > 0
                    ? "font-semibold text-status-blocked-fg"
                    : "text-muted-foreground",
                )}
              >
                {blocked.length > 0 ? `${blocked.length} blocked` : `${allowed}/${total} allowed`}
              </span>
              {blocked.length > 0 ? (
                <span className="flex min-w-0 flex-wrap items-center gap-1.5">
                  {blocked.map((crawler) => (
                    <span
                      key={crawler.id}
                      className="inline-flex items-center gap-1 rounded-full bg-status-blocked-bg px-2 py-0.5 text-[11px] font-medium text-status-blocked-fg"
                    >
                      <X className="size-3" aria-hidden /> {crawler.name}
                    </span>
                  ))}
                </span>
              ) : (
                <Check
                  className="size-3.5 shrink-0 text-status-allowed-fg"
                  aria-label="all allowed"
                />
              )}
            </summary>
            <ul className="divide-y divide-border border-t border-border">
              {crawlers.map(({ crawler, allowed: isOk }) => (
                <li key={crawler.id} className="flex items-center gap-3 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <CrawlerBadge name={crawler.name} userAgent={crawler.userAgent} />
                  </div>
                  <StatusBadge status={isOk ? "allowed" : "blocked"} />
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </Card>
  );
}
