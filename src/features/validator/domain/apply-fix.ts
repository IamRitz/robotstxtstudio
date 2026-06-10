/**
 * Smart Fix engine (Phase 15A) — applies {@link SuggestedFix} edits to robots.txt
 * source text.
 *
 * Fixes are expressed as line-based {@link TextEdit}s (see the type for semantics):
 * remove a line (empty replacement), replace a line, or append (line past EOF).
 * Editing the raw text — keyed by the parser's 1-based line numbers — keeps fixes
 * trivially correct and reversible (the screen snapshots the previous text for undo).
 */
import type { TextEdit, ValidationIssue } from "@/types";

/**
 * Apply a batch of line edits to `source`. Edits are resolved against the ORIGINAL
 * line numbers (not re-indexed as lines are removed), so a set of edits collected from
 * a single validation pass always lands on the right lines.
 */
export function applyTextEdits(source: string, edits: readonly TextEdit[]): string {
  if (edits.length === 0) return source;
  const lines = source.split("\n");

  // Resolve edits to original line numbers. When two edits target the SAME line, the
  // outcome is deterministic and independent of edit order: a deletion ("") always
  // wins (the most conservative resolution — the offending line goes away), and among
  // competing replacements the first one wins. In practice the rule set never emits
  // conflicting edits for one line; this just guarantees a stable result if it ever does.
  const replacements = new Map<number, string>();
  const appends: string[] = [];
  for (const edit of edits) {
    if (edit.line > lines.length) {
      appends.push(edit.replacement);
      continue;
    }
    const existing = replacements.get(edit.line);
    if (existing === undefined) replacements.set(edit.line, edit.replacement);
    else if (existing !== "" && edit.replacement === "") replacements.set(edit.line, "");
  }

  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const lineNo = i + 1;
    if (replacements.has(lineNo)) {
      const replacement = replacements.get(lineNo)!;
      if (replacement === "") continue; // remove the line entirely
      out.push(replacement);
    } else {
      out.push(lines[i]!);
    }
  }
  out.push(...appends);
  return out.join("\n");
}

/** Issues that carry applicable edits (manual "Fix This" eligible). */
export function fixableIssues(issues: readonly ValidationIssue[]): ValidationIssue[] {
  return issues.filter((i) => (i.fix?.edits?.length ?? 0) > 0);
}

/** Issues whose fix is marked safe (eligible for "Fix All Safe Issues"). */
export function safelyFixableIssues(issues: readonly ValidationIssue[]): ValidationIssue[] {
  return fixableIssues(issues).filter((i) => i.fix?.safe === true);
}

/** All edits from every safe fix, ready for a single {@link applyTextEdits} pass. */
export function collectSafeEdits(issues: readonly ValidationIssue[]): TextEdit[] {
  return safelyFixableIssues(issues).flatMap((i) => i.fix!.edits!);
}
