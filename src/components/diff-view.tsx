import { Minus, Plus } from "lucide-react";
import { collapseDiff, diffLines, diffStats } from "@/lib/diff";
import { cn } from "@/lib/utils";

/**
 * Before/After unified line diff (Phase 15A). Removed lines tint with the "blocked"
 * status color, added lines with "allowed" — consistent with the status palette and
 * legible in both themes (the status tokens are theme-aware). Long runs of unchanged
 * lines collapse (so a one-line fix in a big file stays readable) and the whole view
 * is height-capped + scrollable so it never dominates the page on large files/mobile.
 * Decorative gutters are `aria-hidden`; screen readers get the +/- via sr-only text.
 */
export function DiffView({
  before,
  after,
  className,
}: {
  before: string;
  after: string;
  className?: string;
}) {
  const rows = diffLines(before, after);
  const { added, removed } = diffStats(rows);
  const segments = collapseDiff(rows);

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Before / After
        </span>
        <span className="flex items-center gap-3 font-mono text-xs">
          <span className="text-status-blocked-fg">−{removed}</span>
          <span className="text-status-allowed-fg">+{added}</span>
        </span>
      </div>
      <div className="max-h-96 overflow-auto">
        <table className="w-full border-collapse font-mono text-xs">
          <tbody>
            {segments.map((seg, idx) =>
              seg.type === "gap" ? (
                <tr key={idx}>
                  <td className="w-8" aria-hidden />
                  <td className="select-none px-2 py-1 text-[11px] italic text-muted-foreground">
                    ⋯ {seg.count} unchanged {seg.count === 1 ? "line" : "lines"}
                  </td>
                </tr>
              ) : (
                <tr
                  key={idx}
                  className={cn(
                    seg.type === "remove" && "bg-status-blocked-bg/60",
                    seg.type === "add" && "bg-status-allowed-bg/60",
                  )}
                >
                  <td className="w-8 select-none px-2 py-0.5 text-right text-muted-foreground" aria-hidden>
                    {seg.type === "add" ? (
                      <Plus className="ml-auto size-3 text-status-allowed-fg" />
                    ) : seg.type === "remove" ? (
                      <Minus className="ml-auto size-3 text-status-blocked-fg" />
                    ) : null}
                  </td>
                  <td
                    className={cn(
                      "whitespace-pre px-2 py-0.5",
                      seg.type === "remove" && "text-status-blocked-fg",
                      seg.type === "add" && "text-status-allowed-fg",
                      seg.type === "same" && "text-muted-foreground",
                    )}
                  >
                    <span className="sr-only">
                      {seg.type === "add" ? "Added: " : seg.type === "remove" ? "Removed: " : ""}
                    </span>
                    {seg.text || " "}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
