import { useEffect, useMemo, useRef } from "react";
import type { Severity, TextEdit } from "@/types";
import { cn } from "@/lib/utils";

/** One line-anchored marker shown in the editor gutter (and the heatmap strip). */
export interface EditorAnnotation {
  /** 1-based line the marker sits on. */
  readonly line: number;
  readonly severity: Severity;
}

export interface RobotsEditorProps {
  value: string;
  /** Omit (or set `readOnly`) for a display-only view — selection/copy still work. */
  onChange?: (value: string) => void;
  readOnly?: boolean;
  /** Line markers (issue locations). Lines may carry several annotations. */
  annotations?: readonly EditorAnnotation[];
  /** 1-based line to emphasize and scroll into view (the selected issue's line). */
  activeLine?: number;
  /** A gutter marker / heatmap dot / annotated line was clicked. */
  onLineSelect?: (line: number) => void;
  /**
   * Ghost diff: the selected issue's pending fix, previewed in place. Removed lines
   * render struck-through; replaced lines render `old → new`. Display only — the
   * underlying text is untouched until the fix is applied.
   */
  pendingEdits?: readonly TextEdit[];
  /** Accessible name of the underlying textbox. */
  ariaLabel?: string;
  /** Minimum visible rows when the file is short. */
  minRows?: number;
  /** Constrain height (the file scrolls inside; the heatmap stays pinned). */
  className?: string;
}

const SEVERITY_RANK: Record<Severity, number> = { error: 0, warning: 1, info: 2 };

const MARKER_DOT: Record<Severity, string> = {
  error: "bg-status-blocked-dot",
  warning: "bg-status-warning-dot",
  info: "bg-status-info-dot",
};

const LINE_TINT: Record<Severity, string> = {
  error: "bg-status-blocked-bg/60",
  warning: "bg-status-warning-bg/60",
  info: "bg-status-info-bg/50",
};

/** Most severe annotation per line (a line can host several issues). */
function markersByLine(annotations: readonly EditorAnnotation[]): Map<number, Severity> {
  const map = new Map<number, Severity>();
  for (const a of annotations) {
    const current = map.get(a.line);
    if (current === undefined || SEVERITY_RANK[a.severity] < SEVERITY_RANK[current]) {
      map.set(a.line, a.severity);
    }
  }
  return map;
}

/**
 * Annotated robots.txt editor (the Validator workspace's file pane).
 *
 * Abstraction boundary: consumers pass text + line annotations and receive edits +
 * line selections — they never know how editing is implemented. The current
 * implementation is the classic "overlay" technique (a transparent `<textarea>`
 * stacked over a styled render layer), chosen because robots.txt files are tiny;
 * it can be swapped for a plain textarea or CodeMirror without touching callers.
 *
 * Pieces: line-number gutter with severity markers (clickable), per-line severity
 * tints, an active-line highlight that scrolls into view, an optional ghost diff
 * preview of a pending fix, and an issue heatmap strip pinned to the editor's
 * right edge — a whole-file density overview even while the file scrolls.
 */
export function RobotsEditor({
  value,
  onChange,
  readOnly = false,
  annotations = [],
  activeLine,
  onLineSelect,
  pendingEdits,
  ariaLabel = "robots.txt",
  minRows = 12,
  className,
}: RobotsEditorProps) {
  const lines = useMemo(() => value.split("\n"), [value]);
  const markers = useMemo(() => markersByLine(annotations), [annotations]);
  const ghosts = useMemo(() => {
    const map = new Map<number, string>();
    for (const e of pendingEdits ?? []) if (e.line <= lines.length) map.set(e.line, e.replacement);
    return map;
  }, [pendingEdits, lines.length]);
  const rowCount = Math.max(lines.length, minRows);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Keep the active line visible (within the pane and the page).
  useEffect(() => {
    if (activeLine === undefined) return;
    const el = scrollerRef.current?.querySelector<HTMLElement>(`[data-line="${activeLine}"]`);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [activeLine]);

  /** Map a click/caret position inside the textarea to its 1-based line. */
  function lineAtCaret(textarea: HTMLTextAreaElement): number {
    const upto = textarea.value.slice(0, textarea.selectionStart ?? 0);
    return upto.split("\n").length;
  }

  return (
    <div
      className={cn(
        "relative flex overflow-hidden rounded-lg border border-input bg-card font-mono text-xs",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 focus-within:ring-offset-background",
        className,
      )}
    >
      {/* ONE scroll container for both axes: the gutter and the code live in the
          same scrolling flow so they can never drift apart vertically (separate
          scroll boxes desync when the browser scrolls the caret into view, even
          with overflow hidden). Horizontally the gutter pins via sticky left-0. */}
      <div ref={scrollerRef} className="min-w-0 flex-1 overflow-auto">
        <div className="flex w-max min-w-full items-stretch">
          {/* Line-number gutter with severity markers. */}
          <div
            className="sticky left-0 z-10 shrink-0 select-none border-r border-border bg-muted py-2.5 text-right"
            aria-hidden
          >
            {Array.from({ length: rowCount }, (_, i) => {
              const line = i + 1;
              const severity = markers.get(line);
              return (
                <div key={line} className="flex h-6 items-center justify-end gap-1.5 pl-2 pr-2">
                  {severity && onLineSelect ? (
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => onLineSelect(line)}
                      className="flex size-4 items-center justify-center rounded hover:bg-muted"
                      title={`Issue on line ${line}`}
                    >
                      <span className={cn("size-1.5 rounded-full", MARKER_DOT[severity])} />
                    </button>
                  ) : severity ? (
                    <span className={cn("size-1.5 rounded-full", MARKER_DOT[severity])} />
                  ) : null}
                  <span
                    className={cn(
                      "w-7 tabular-nums leading-6",
                      line === activeLine
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground/70",
                    )}
                  >
                    {line <= lines.length ? line : ""}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Code area: styled render layer underneath, transparent textarea on
              top. Not a scroll box — it sizes to its content; all scrolling
              happens in the shared scroller above. */}
          <div className="relative flex-1">
            <div aria-hidden className="py-2.5 pr-4">
              {Array.from({ length: rowCount }, (_, i) => {
                const line = i + 1;
                const severity = markers.get(line);
                const active = line === activeLine;
                const ghost = ghosts.get(line);
                return (
                  <div
                    key={line}
                    data-line={line}
                    className={cn(
                      "h-6 whitespace-pre px-3 leading-6 text-foreground",
                      ghost === undefined && severity && !active && LINE_TINT[severity],
                      active && "bg-brand-muted shadow-[inset_2px_0_0_0_var(--brand)]",
                      ghost !== undefined && !active && "bg-status-allowed-bg/40",
                    )}
                  >
                    {ghost === undefined ? (
                      lines[i] || " "
                    ) : ghost === "" ? (
                      <span className="text-status-blocked-fg line-through decoration-status-blocked-fg/60">
                        {lines[i] || " "}
                      </span>
                    ) : (
                      <>
                        <span className="text-status-blocked-fg line-through decoration-status-blocked-fg/60">
                          {lines[i] || " "}
                        </span>
                        <span className="text-muted-foreground">{"  →  "}</span>
                        <span className="font-semibold text-status-allowed-fg">{ghost}</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <textarea
              value={value}
              readOnly={readOnly || !onChange}
              onChange={(e) => onChange?.(e.target.value)}
              onClick={(e) => {
                const line = lineAtCaret(e.currentTarget);
                if (onLineSelect && markers.has(line)) onLineSelect(line);
              }}
              aria-label={ariaLabel}
              wrap="off"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              className="absolute inset-0 h-full w-full resize-none overflow-hidden whitespace-pre bg-transparent px-3 py-2.5 font-mono text-xs leading-6 text-transparent caret-foreground outline-none"
            />
          </div>
        </div>
      </div>

      {/* Issue heatmap: whole-file density overview, pinned while the file scrolls. */}
      {markers.size > 0 ? (
        <div className="relative w-3 shrink-0 border-l border-border bg-muted/40" aria-hidden>
          {[...markers.entries()].map(([line, severity]) => (
            <button
              key={line}
              type="button"
              tabIndex={-1}
              onClick={() => onLineSelect?.(line)}
              title={`Issue on line ${line}`}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 p-1"
              style={{ top: `${((line - 0.5) / rowCount) * 100}%` }}
            >
              <span className={cn("block size-1.5 rounded-full", MARKER_DOT[severity])} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
