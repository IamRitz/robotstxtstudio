import { Minus, Plus } from "lucide-react";
import { diffLines, diffStats } from "@/lib/diff";
import { cn } from "@/lib/utils";

/**
 * Before/After unified line diff (Phase 15A). Removed lines tint with the "blocked"
 * status color, added lines with "allowed" — consistent with the status palette and
 * legible in both themes (the status tokens are theme-aware). Decorative gutters are
 * `aria-hidden`; screen readers get the +/- via visually-hidden text.
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
      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-xs">
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className={cn(
                  row.type === "remove" && "bg-status-blocked-bg/60",
                  row.type === "add" && "bg-status-allowed-bg/60",
                )}
              >
                <td className="w-8 select-none px-2 py-0.5 text-right text-muted-foreground" aria-hidden>
                  {row.type === "add" ? (
                    <Plus className="ml-auto size-3 text-status-allowed-fg" />
                  ) : row.type === "remove" ? (
                    <Minus className="ml-auto size-3 text-status-blocked-fg" />
                  ) : null}
                </td>
                <td
                  className={cn(
                    "whitespace-pre px-2 py-0.5",
                    row.type === "remove" && "text-status-blocked-fg",
                    row.type === "add" && "text-status-allowed-fg",
                    row.type === "same" && "text-muted-foreground",
                  )}
                >
                  <span className="sr-only">
                    {row.type === "add" ? "Added: " : row.type === "remove" ? "Removed: " : ""}
                  </span>
                  {row.text || " "}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
