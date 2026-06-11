import { FileCode2, X } from "lucide-react";
import { isWorkspaceDirty, workspaceLabel, type Workspace } from "@/lib/workspace";
import { Button } from "@/components/ui/button";

const SOURCE_LABEL: Record<Workspace["source"], string> = {
  analyzer: "Analyzer",
  validator: "Validator",
  generator: "Generator",
  "ai-manager": "AI Manager",
};

/**
 * The ambient working-file indicator (Phase 17D). Rendered by every tool that
 * reads the shared workspace, so the user always knows WHICH file they're acting
 * on, where it came from, and whether it has unsaved-against-original changes.
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
  return (
    <div
      className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-brand/30 bg-brand-muted/40 px-4 py-2.5"
      data-testid="workspace-bar"
    >
      <FileCode2 className="size-4 shrink-0 text-brand" aria-hidden />
      <p className="min-w-0 text-sm text-foreground">
        <span className="font-semibold">Working file: {workspaceLabel(workspace)}</span>
        <span className="text-muted-foreground">
          {" "}
          · from {SOURCE_LABEL[workspace.source]}
          {isWorkspaceDirty(workspace) ? " · edited" : ""}
          {note ? ` · ${note}` : ""}
        </span>
      </p>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDiscard}
        className="ml-auto shrink-0 px-2 text-muted-foreground"
      >
        <X aria-hidden /> Discard working file
      </Button>
    </div>
  );
}
