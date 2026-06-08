import { describe, expect, it } from "vitest";
import { compilePattern, matchesPath } from "./pattern";

describe("matchesPath", () => {
  it("matches as a prefix by default", () => {
    expect(matchesPath("/admin", "/admin/login")).toBe(true);
    expect(matchesPath("/admin", "/administrator")).toBe(true);
    expect(matchesPath("/admin", "/x/admin")).toBe(false);
  });

  it("expands * to any run of characters", () => {
    expect(matchesPath("/*.pdf", "/files/report.pdf")).toBe(true);
    expect(matchesPath("/*.pdf", "/files/report.txt")).toBe(false);
    expect(matchesPath("/p/*/q", "/p/x/q")).toBe(true);
    expect(matchesPath("/p/*/q", "/p/q")).toBe(false);
  });

  it("anchors to the end of the path with a trailing $", () => {
    expect(matchesPath("/page$", "/page")).toBe(true);
    expect(matchesPath("/page$", "/page/sub")).toBe(false);
    expect(matchesPath("/*.php$", "/index.php")).toBe(true);
  });

  it("treats `*` alone as matching everything and empty as matching nothing", () => {
    expect(matchesPath("*", "/anything")).toBe(true);
    expect(matchesPath("", "/anything")).toBe(false);
    expect(compilePattern("")).toBeNull();
  });

  it("escapes regex metacharacters in literal segments", () => {
    expect(matchesPath("/a.b", "/axb")).toBe(false);
    expect(matchesPath("/a.b", "/a.b")).toBe(true);
  });
});
