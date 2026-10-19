import { describe, expect, it } from "vitest";
import { parseRobots } from "@/parser";
import type { ValidationCode } from "@/types";
import { applyTextEdits } from "./apply-fix";
import { validateRobots } from "./validate";

const issuesFor = (src: string) => validateRobots(parseRobots(src)).issues;
const codesFor = (src: string) => issuesFor(src).map((i) => i.code);
const find = (src: string, code: ValidationCode) => issuesFor(src).find((i) => i.code === code);

/** Apply an issue's fix and return the resulting source. */
function applyFixFor(src: string, code: ValidationCode): string {
  const issue = find(src, code)!;
  return applyTextEdits(src, issue.fix!.edits!);
}

describe("Phase 15C.1 — additional mistake detectors", () => {
  it("quoted-directive: flags a quoted path and unquotes it (safe)", () => {
    const src = 'User-agent: *\nDisallow: "/admin"';
    expect(codesFor(src)).toContain("quoted-directive");
    expect(find(src, "quoted-directive")!.fix!.safe).toBe(true);
    const fixed = applyFixFor(src, "quoted-directive");
    expect(fixed).toContain("Disallow: /admin");
    expect(codesFor(fixed)).not.toContain("quoted-directive");
  });

  it("path-missing-leading-slash: flags and prepends '/' (safe)", () => {
    const src = "User-agent: *\nDisallow: admin/";
    expect(codesFor(src)).toContain("path-missing-leading-slash");
    expect(applyFixFor(src, "path-missing-leading-slash")).toContain("Disallow: /admin/");
  });

  it("does not flag a properly rooted or wildcard path", () => {
    expect(codesFor("User-agent: *\nDisallow: /ok/")).not.toContain("path-missing-leading-slash");
    expect(codesFor("User-agent: *\nDisallow: *.pdf")).not.toContain("path-missing-leading-slash");
  });

  it("redundant-wildcard: flags '**' and collapses to '*' (safe)", () => {
    const src = "User-agent: *\nDisallow: /a/**/b";
    expect(codesFor(src)).toContain("redundant-wildcard");
    expect(applyFixFor(src, "redundant-wildcard")).toContain("Disallow: /a/*/b");
  });

  it("duplicate-user-agent-group: flags the same UA across two groups", () => {
    const src = "User-agent: Googlebot\nDisallow: /a\n\nUser-agent: Googlebot\nDisallow: /b";
    expect(codesFor(src)).toContain("duplicate-user-agent-group");
  });

  it("blocks-rendering-assets: flags disallowed CSS/JS and core asset dirs", () => {
    expect(codesFor("User-agent: *\nDisallow: /style.css")).toContain("blocks-rendering-assets");
    expect(codesFor("User-agent: *\nDisallow: /app.js")).toContain("blocks-rendering-assets");
    expect(codesFor("User-agent: *\nDisallow: /wp-includes/")).toContain("blocks-rendering-assets");
    expect(codesFor("User-agent: *\nDisallow: /private/")).not.toContain("blocks-rendering-assets");
    // Wildcard + end anchor — the common real-world form.
    expect(codesFor("User-agent: *\nDisallow: /*.css$")).toContain("blocks-rendering-assets");
    expect(codesFor("User-agent: *\nDisallow: /*.js$")).toContain("blocks-rendering-assets");
  });

  it("noindex-unsupported: flags Noindex and is NOT double-counted as unsupported-directive", () => {
    const codes = codesFor("User-agent: *\nNoindex: /secret");
    expect(codes).toContain("noindex-unsupported");
    expect(codes).not.toContain("unsupported-directive");
    // It's a "review" fix (removing doesn't achieve the user's deindex intent).
    expect(find("User-agent: *\nNoindex: /secret", "noindex-unsupported")!.fix!.safe).toBe(false);
  });

  it("other vendor directives are still flagged generically", () => {
    expect(codesFor("User-agent: *\nClean-param: ref /page")).toContain("unsupported-directive");
  });
});
