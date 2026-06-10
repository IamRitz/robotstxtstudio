/**
 * Minimal LCS line diff (Phase 15A) for the Validator's Before/After view.
 *
 * robots.txt files are tiny, so a quadratic LCS over lines is more than fast enough
 * and needs no dependency. Produces a unified row list: unchanged / removed / added.
 */
export type DiffRowType = "same" | "remove" | "add";

export interface DiffRow {
  readonly type: DiffRowType;
  readonly text: string;
  /** 1-based line number in the "before" text (for same/remove). */
  readonly beforeLine?: number;
  /** 1-based line number in the "after" text (for same/add). */
  readonly afterLine?: number;
}

/** Compute a line-level unified diff between two texts. */
export function diffLines(before: string, after: string): DiffRow[] {
  const a = before.split("\n");
  const b = after.split("\n");
  const m = a.length;
  const n = b.length;

  // LCS length table.
  const lcs: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      lcs[i]![j] = a[i] === b[j] ? lcs[i + 1]![j + 1]! + 1 : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!);
    }
  }

  // Backtrack into unified rows.
  const rows: DiffRow[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      rows.push({ type: "same", text: a[i]!, beforeLine: i + 1, afterLine: j + 1 });
      i++;
      j++;
    } else if (lcs[i + 1]![j]! >= lcs[i]![j + 1]!) {
      rows.push({ type: "remove", text: a[i]!, beforeLine: i + 1 });
      i++;
    } else {
      rows.push({ type: "add", text: b[j]!, afterLine: j + 1 });
      j++;
    }
  }
  while (i < m) rows.push({ type: "remove", text: a[i]!, beforeLine: ++i });
  while (j < n) rows.push({ type: "add", text: b[j]!, afterLine: ++j });
  return rows;
}

/** Counts of changed rows, for a compact summary ("2 removed · 1 added"). */
export function diffStats(rows: readonly DiffRow[]): { added: number; removed: number } {
  let added = 0;
  let removed = 0;
  for (const r of rows) {
    if (r.type === "add") added++;
    else if (r.type === "remove") removed++;
  }
  return { added, removed };
}
