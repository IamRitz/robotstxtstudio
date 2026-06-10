/**
 * Cross-tool robots.txt handoff (Phase 14E — conversion flows).
 *
 * Tools that operate on robots.txt text (Analyzer, Validator, Explainer, Tester)
 * can pass the current file to the next tool via sessionStorage so a "Validate this"
 * / "Explain this" action lands the user in the next tool with their content already
 * loaded — turning dead-end results into multi-tool journeys.
 *
 * The Generator is intentionally excluded: it builds from structured config, not raw
 * text, so it cannot ingest an arbitrary file.
 */
const KEY = "rts:robots-handoff";

/** Stash robots.txt text for the destination tool, then it's safe to navigate. */
export function setHandoff(text: string): void {
  try {
    if (text.trim()) sessionStorage.setItem(KEY, text);
  } catch {
    // sessionStorage unavailable (private mode / SSR) — degrade to plain navigation.
  }
}

/** Read and clear any handed-off robots.txt. Returns null when there's nothing. */
export function takeHandoff(): string | null {
  try {
    const value = sessionStorage.getItem(KEY);
    if (value != null) sessionStorage.removeItem(KEY);
    return value;
  } catch {
    return null;
  }
}
