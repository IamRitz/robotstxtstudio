import { describe, expect, it } from "vitest";
import { parseRobots } from "@/parser";
import type { TextEdit, ValidationIssue } from "@/types";
import { applyTextEdits, collectSafeEdits, fixableIssues, safelyFixableIssues } from "./apply-fix";
import { validateRobots } from "./validate";

const issue = (over: Partial<ValidationIssue>): ValidationIssue => ({
  id: over.id ?? "x",
  severity: "warning",
  code: "duplicate-rule",
  title: "t",
  message: "m",
  ...over,
});

describe("applyTextEdits", () => {
  const src = "a\nb\nc";

  it("returns source unchanged for no edits", () => {
    expect(applyTextEdits(src, [])).toBe(src);
  });

  it("removes a line when replacement is empty", () => {
    expect(applyTextEdits(src, [{ line: 2, replacement: "" }])).toBe("a\nc");
  });

  it("replaces a line's content", () => {
    expect(applyTextEdits(src, [{ line: 2, replacement: "B" }])).toBe("a\nB\nc");
  });

  it("appends when the line is past EOF", () => {
    expect(applyTextEdits(src, [{ line: 99, replacement: "d" }])).toBe("a\nb\nc\nd");
  });

  it("resolves multiple edits against original line numbers (order-independent)", () => {
    const edits: TextEdit[] = [
      { line: 1, replacement: "" },
      { line: 3, replacement: "C" },
    ];
    expect(applyTextEdits(src, edits)).toBe("b\nC");
    // Same edits, reversed input order → identical result.
    expect(applyTextEdits(src, [...edits].reverse())).toBe("b\nC");
  });

  it("is deterministic when two edits hit the same line: deletion wins, either order", () => {
    const del = { line: 2, replacement: "" };
    const rep = { line: 2, replacement: "B" };
    expect(applyTextEdits(src, [rep, del])).toBe("a\nc");
    expect(applyTextEdits(src, [del, rep])).toBe("a\nc");
  });

  it("keeps the first replacement when two non-delete edits hit the same line", () => {
    expect(
      applyTextEdits(src, [
        { line: 2, replacement: "X" },
        { line: 2, replacement: "Y" },
      ]),
    ).toBe("a\nX\nc");
  });
});

describe("issue selectors", () => {
  const issues = [
    issue({
      id: "1",
      fix: { description: "d", edits: [{ line: 1, replacement: "" }], safe: true },
    }),
    issue({
      id: "2",
      fix: { description: "d", edits: [{ line: 2, replacement: "" }], safe: false },
    }),
    issue({ id: "3", fix: { description: "advice only" } }), // no edits
    issue({ id: "4" }), // no fix
  ];

  it("fixableIssues requires edits", () => {
    expect(fixableIssues(issues).map((i) => i.id)).toEqual(["1", "2"]);
  });

  it("safelyFixableIssues requires safe + edits", () => {
    expect(safelyFixableIssues(issues).map((i) => i.id)).toEqual(["1"]);
  });

  it("collectSafeEdits flattens only safe edits", () => {
    expect(collectSafeEdits(issues)).toEqual([{ line: 1, replacement: "" }]);
  });
});

describe("end-to-end safe fixes resolve their issues", () => {
  it("removes crawl-delay:0 and upgrades http sitemap, clearing both findings", () => {
    const src = [
      "User-agent: *",
      "Disallow: /admin/",
      "Crawl-delay: 0",
      "",
      "Sitemap: http://example.com/sitemap.xml",
    ].join("\n");

    const before = validateRobots(parseRobots(src));
    expect(before.issues.some((i) => i.code === "crawl-delay-zero")).toBe(true);
    expect(before.issues.some((i) => i.code === "sitemap-not-https")).toBe(true);

    const fixed = applyTextEdits(src, collectSafeEdits(before.issues));
    const after = validateRobots(parseRobots(fixed));

    expect(after.issues.some((i) => i.code === "crawl-delay-zero")).toBe(false);
    expect(after.issues.some((i) => i.code === "sitemap-not-https")).toBe(false);
    expect(fixed).toContain("https://example.com/sitemap.xml");
    // The fix must not have damaged the rest of the file.
    expect(after.health.value).toBeGreaterThanOrEqual(before.health.value);
  });
});
