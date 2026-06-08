import { describe, expect, it } from "vitest";
import { parseRobots } from "@/parser";
import { classifyAccess } from "./access";

/** Parse a single group's rules for a terse test. */
const rules = (text: string) => parseRobots(`User-agent: *\n${text}`).groups[0]!.rules;

describe("classifyAccess", () => {
  it("is allowed when there are no disallows", () => {
    expect(classifyAccess(rules("Allow: /")).access).toBe("allowed");
    expect(classifyAccess([]).access).toBe("allowed");
  });

  it("treats an empty Disallow as allow-all", () => {
    expect(classifyAccess(rules("Disallow:")).access).toBe("allowed");
  });

  it("is blocked when Disallow: / has no exceptions", () => {
    const summary = classifyAccess(rules("Disallow: /"));
    expect(summary.access).toBe("blocked");
    expect(summary.blocksEntireSite).toBe(true);
  });

  it("is partial when Disallow: / has Allow exceptions", () => {
    expect(classifyAccess(rules("Disallow: /\nAllow: /public/")).access).toBe("partial");
  });

  it("is partial when specific sections are blocked", () => {
    const summary = classifyAccess(rules("Disallow: /admin/\nDisallow: /tmp/"));
    expect(summary.access).toBe("partial");
    expect(summary.blockedPaths).toEqual(["/admin/", "/tmp/"]);
  });
});
