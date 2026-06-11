import { Check, FileCode2, X } from "lucide-react";
import { codeLabel } from "@/features/validator";
import type { ValidationCode } from "@/types";
import {
  isWorkspaceDirty,
  WORKSPACE_SOURCE_LABEL,
  workspaceLabel,
  type Workspace,
} from "@/lib/workspace";
import { relativeTime } from "@/lib/relative-time";
import { Button } from "@/components/ui/button";

/** Human label for an applied fix's issue code (falls back to the code itself). */
function fixLabel(code: string): string {
  return codeLabel(code as ValidationCode);
}

/**
 * The ambient working-file indicator (Phase 17D, provenance-rich since 17F).
 * Always answers, without scrolling: which file is active, which tool last
 * changed it and when, and (expandable) the most recent Smart Fixes — the
 * receipts that changes really do carry across tools.
 */
export function WorkspaceBar({
  workspace,
  note,
  onDiscard,
}: {
  workspace: Workspace;
  /** Per-tool context line, e.g. "toggles seeded from this file". */
  note?: string;
  /** Drop the shared file and fall back to this tool's default state. */
  onDiscard: () => void;
}) {
  // Latest 3 applied fixes, newest first — receipts, not a history system.
  const recent = [...workspace.appliedFixes].slice(-3).reverse();
  const dirty = isWorkspaceDirty(workspace);

  /** Discarding resets every tool — make it a deliberate act (17F.3). */
  const confirmDiscard = () => {
    if (
      window.confirm(
        `Discard working file?\n\nThis removes the active workspace (${workspaceLabel(workspace)}) and resets Analyze, Validate, AI Manager, and Generator to their default state.`,
      )
    ) {
      onDiscard();
    }
  };

  return (
    <div
      className="mb-6 rounded-xl border border-brand/30 bg-brand-muted/40 px-4 py-2.5"
      data-testid="workspace-bar"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <FileCode2 className="size-4 shrink-0 text-brand" aria-hidden />
        <p className="min-w-0 text-sm text-foreground">
          <span className="font-semibold">Working file: {workspaceLabel(workspace)}</span>
          <span className="text-muted-foreground">
            {" "}
            · last changed in {WORKSPACE_SOURCE_LABEL[workspace.source]} ·{" "}
            {relativeTime(workspace.updatedAt)}
            {dirty ? " · edited" : ""}
            {note ? ` · ${note}` : ""}
          </span>
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={confirmDiscard}
          className="ml-auto shrink-0 px-2 text-muted-foreground"
        >
          <X aria-hidden /> Discard working file
        </Button>
      </div>

      {recent.length > 0 ? (
        <details className="mt-1">
          <summary className="cursor-pointer text-xs font-medium text-brand hover:underline">
            Recent changes ({workspace.appliedFixes.length})
          </summary>
          <ul className="mt-1.5 space-y-1">
            {recent.map((code, i) => (
              <li
                key={`${code}-${i}`}
                className="flex items-center gap-1.5 text-xs text-foreground"
              >
                <Check className="size-3 shrink-0 text-status-allowed-fg" aria-hidden />
                Fixed: {fixLabel(code)}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
