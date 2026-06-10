import { describe, expect, it } from "vitest";
import { diffLines, diffStats } from "./diff";

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
