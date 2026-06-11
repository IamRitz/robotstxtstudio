/**
 * The shared working robots.txt (Phase 17D) — ONE active file across tools.
 *
 * Analyze, Validate, AI Manager, and Generator all operate on the same ambient
 * workspace: tools READ it on mount (so navigating between tools never needs
 * copy/paste) and WRITE it on committed changes (edits, applied fixes, explicit
 * "Apply to working file"). The text is the single source of truth — analysis,
 * scores, and queues are recomputed from it by the pure engines, never stored
 * (stored results would go stale on the first edit).
 *
 * Relationship to `recent-analyses` (17C): that store is the per-domain ARCHIVE
 * (up to 10 snapshots for the dashboard); the workspace is the single ACTIVE
 * pointer — "what I'm working on right now", which may have started from an
 * analysis, a paste, or a generated file.
 *
 * Local-only by design: localStorage, no accounts, no sync. Storage failures
 * degrade to per-screen state (navigation just won't carry the file).
 */

const KEY = "rs:workspace:v1";

export type WorkspaceSource = "analyzer" | "validator" | "generator" | "ai-manager";

export interface Workspace {
  /** Source domain when the file came from the Analyzer. */
  readonly domain?: string;
  /** The file as it FIRST entered the workspace (fetch/paste/generation). */
  readonly originalText: string;
  /** The current working robots.txt. */
  readonly text: string;
  /** Issue codes resolved via Smart Fix in this workspace (a provenance log). */
  readonly appliedFixes: readonly string[];
  /** The tool that last wrote the workspace. */
  readonly source: WorkspaceSource;
  /** ISO timestamp of the last write. */
  readonly updatedAt: string;
}

export function getWorkspace(): Workspace | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Workspace;
    return typeof parsed?.text === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function setWorkspace(ws: Omit<Workspace, "updatedAt">): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...ws, updatedAt: new Date().toISOString() }));
  } catch {
    // Private mode / quota — tools fall back to their own state.
  }
}

/**
 * Update the working text in place (creating a workspace if none exists).
 * `appliedFixes` are appended to the provenance log.
 */
export function updateWorkspaceText(
  text: string,
  source: WorkspaceSource,
  appliedFixes: readonly string[] = [],
): void {
  const current = getWorkspace();
  setWorkspace({
    domain: current?.domain,
    originalText: current?.originalText ?? text,
    text,
    appliedFixes: [...(current?.appliedFixes ?? []), ...appliedFixes],
    source,
  });
}

export function clearWorkspace(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

/** A workspace is dirty when the working text has diverged from the original. */
export function isWorkspaceDirty(ws: Workspace | null): boolean {
  return ws !== null && ws.text !== ws.originalText;
}

/** Display label for the active workspace ("example.com" / "untitled robots.txt"). */
export function workspaceLabel(ws: Workspace): string {
  return ws.domain ?? "untitled robots.txt";
}

/** Human name of the tool that last wrote the workspace. */
export const WORKSPACE_SOURCE_LABEL: Record<WorkspaceSource, string> = {
  analyzer: "Analyzer",
  validator: "Validate",
  generator: "Generator",
  "ai-manager": "AI Manager",
};
