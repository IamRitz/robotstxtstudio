import { describe, expect, it } from "vitest";
import { parseRobots } from "@/parser";
import { evaluateAccess, isAllowed } from "./evaluate";
import { testUrl } from "./test-url";

const run = (robots: string, url: string, ua: string) => testUrl(parseRobots(robots), url, ua);

describe("testUrl — standard cases", () => {
  it("blocks a disallowed path and allows others", () => {
    const robots = "User-agent: *\nDisallow: /admin/";
    expect(run(robots, "/admin/login", "GPTBot").decision).toBe("blocked");
    expect(run(robots, "/public", "GPTBot").decision).toBe("allowed");
  });

  it("reports the matched rule and user-agent", () => {
    const result = run("User-agent: *\nDisallow: /admin/", "/admin/x", "GPTBot");
    expect(result.matchedRule).toMatchObject({ type: "disallow", path: "/admin/" });
    expect(result.matchedUserAgent).toBe("*");
    expect(result.reason).toContain("blocked");
  });
});

describe("testUrl — precedence", () => {
  it("longest matching pattern wins", () => {
    const robots = "User-agent: *\nDisallow: /\nAllow: /blog/";
    expect(run(robots, "/blog/post", "GPTBot").decision).toBe("allowed");
    expect(run(robots, "/about", "GPTBot").decision).toBe("blocked");
  });

  it("Allow beats Disallow on an equal-length tie", () => {
    expect(run("User-agent: *\nDisallow: /x\nAllow: /x", "/x", "GPTBot").decision).toBe("allowed");
  });

  it("a more specific Allow overrides a broad Disallow", () => {
    const robots = "User-agent: *\nDisallow: /admin/\nAllow: /admin/public/";
    expect(run(robots, "/admin/public/page", "GPTBot").decision).toBe("allowed");
    expect(run(robots, "/admin/secret", "GPTBot").decision).toBe("blocked");
  });
});

describe("testUrl — wildcards and end markers", () => {
  it("matches wildcard patterns", () => {
    const robots = "User-agent: *\nDisallow: /*.pdf";
    expect(run(robots, "/files/a.pdf", "GPTBot").decision).toBe("blocked");
    expect(run(robots, "/files/a.txt", "GPTBot").decision).toBe("allowed");
  });

  it("honors the $ end-of-path anchor", () => {
    const robots = "User-agent: *\nDisallow: /page$";
    expect(run(robots, "/page", "GPTBot").decision).toBe("blocked");
    expect(run(robots, "/page/sub", "GPTBot").decision).toBe("allowed");
  });
});

describe("testUrl — AI crawlers and multiple groups", () => {
  const robots = "User-agent: GPTBot\nDisallow: /\n\nUser-agent: *\nAllow: /";

  it("applies the AI crawler's specific group, not the default", () => {
    expect(run(robots, "/anything", "GPTBot").decision).toBe("blocked");
    expect(run(robots, "/anything", "Googlebot").decision).toBe("allowed");
  });

  it("matches the crawler case-insensitively", () => {
    expect(run(robots, "/anything", "gptbot").decision).toBe("blocked");
  });

  it("lets a specific group's Allow override the default's Disallow", () => {
    const r = "User-agent: *\nDisallow: /\n\nUser-agent: Googlebot\nAllow: /";
    expect(run(r, "/x", "Googlebot").decision).toBe("allowed");
    expect(run(r, "/x", "Bingbot").decision).toBe("blocked");
  });
});

describe("testUrl — edge cases", () => {
  it("allows everything when no group matches and there is no default", () => {
    const result = run("User-agent: Googlebot\nDisallow: /", "/x", "Bingbot");
    expect(result.decision).toBe("allowed");
    expect(result.matchedUserAgent).toBeUndefined();
  });

  it("allows everything for an empty robots.txt", () => {
    expect(run("", "/x", "GPTBot").decision).toBe("allowed");
  });

  it("treats an empty Disallow as allow-all", () => {
    expect(run("User-agent: *\nDisallow:", "/x", "GPTBot").decision).toBe("allowed");
  });

  it("extracts the path from a full URL and normalizes a bare path", () => {
    const robots = "User-agent: *\nDisallow: /admin/";
    expect(run(robots, "https://example.com/admin/login?x=1", "GPTBot").decision).toBe("blocked");
    expect(run(robots, "admin/login", "GPTBot").decision).toBe("blocked");
  });
});

describe("testUrl — trace", () => {
  it("produces a numbered trace ending in the decision", () => {
    const result = run("User-agent: *\nDisallow: /admin/", "/admin/x", "GPTBot");
    expect(result.trace.map((s) => s.step)).toEqual([1, 2, 3, 4]);
    expect(result.trace.at(-1)).toMatchObject({ label: "Decision", status: "blocked" });
    expect(result.trace.some((s) => s.label === "Apply precedence")).toBe(true);
  });

  it("omits the precedence step when no rule matches", () => {
    const result = run("User-agent: *\nDisallow: /admin/", "/public", "GPTBot");
    expect(result.trace.some((s) => s.label === "Apply precedence")).toBe(false);
    expect(result.trace.at(-1)).toMatchObject({ status: "allowed" });
  });
});

describe("evaluateAccess / isAllowed primitives", () => {
  it("expose the trace-free decision and a boolean helper", () => {
    const file = parseRobots("User-agent: *\nDisallow: /admin/");
    expect(evaluateAccess(file, "/admin/x", "GPTBot").decision).toBe("blocked");
    expect(isAllowed(file, "/public", "GPTBot")).toBe(true);
    expect(isAllowed(file, "/admin/x", "GPTBot")).toBe(false);
  });
});
