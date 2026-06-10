import { describe, expect, it } from "vitest";
import { collapseDiff, diffLines, diffStats } from "./diff";

describe("diffLines", () => {
  it("marks identical text as all 'same'", () => {
    const rows = diffLines("a\nb", "a\nb");
    expect(rows.every((r) => r.type === "same")).toBe(true);
    expect(rows.map((r) => r.text)).toEqual(["a", "b"]);
  });

  it("detects an added line", () => {
    const rows = diffLines("a\nc", "a\nb\nc");
    expect(rows.filter((r) => r.type === "add").map((r) => r.text)).toEqual(["b"]);
    expect(rows.filter((r) => r.type === "remove")).toHaveLength(0);
  });

  it("detects a removed line", () => {
    const rows = diffLines("a\nb\nc", "a\nc");
    expect(rows.filter((r) => r.type === "remove").map((r) => r.text)).toEqual(["b"]);
    expect(rows.filter((r) => r.type === "add")).toHaveLength(0);
  });

  it("models a replacement as remove + add", () => {
    const rows = diffLines("a\nb\nc", "a\nB\nc");
    const stats = diffStats(rows);
    expect(stats).toEqual({ added: 1, removed: 1 });
  });

  it("carries 1-based line numbers", () => {
    const rows = diffLines("a\nb", "a\nb");
    expect(rows[0]).toMatchObject({ beforeLine: 1, afterLine: 1 });
    expect(rows[1]).toMatchObject({ beforeLine: 2, afterLine: 2 });
  });
});

describe("collapseDiff (large-file readability)", () => {
  it("collapses long unchanged runs to a gap, keeping context around a change", () => {
    // 100 unchanged lines, then one removed line, then 100 unchanged.
    const before = [...Array(100).fill("x"), "DELETE_ME", ...Array(100).fill("y")].join("\n");
    const after = [...Array(100).fill("x"), ...Array(100).fill("y")].join("\n");
    const segments = collapseDiff(diffLines(before, after), 3);

    // The whole 201-line diff collapses to a handful of rows.
    expect(segments.length).toBeLessThan(12);
    // Exactly one removed row survives, with context.
    expect(segments.filter((s) => s.type === "remove")).toHaveLength(1);
    // Gaps account for the hidden lines.
    const gaps = segments.filter((s): s is { type: "gap"; count: number } => s.type === "gap");
    expect(gaps.length).toBeGreaterThan(0);
    expect(gaps.reduce((n, g) => n + g.count, 0)).toBeGreaterThan(180);
  });

  it("keeps short diffs fully expanded (no gaps)", () => {
    const segments = collapseDiff(diffLines("a\nb\nc", "a\nB\nc"), 3);
    expect(segments.some((s) => s.type === "gap")).toBe(false);
  });
});
