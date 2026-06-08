import { describe, expect, it } from "vitest";
import { parseRobots } from "./parser";

describe("parseRobots — happy path", () => {
  it("parses a standard single-group file", () => {
    const file = parseRobots("User-agent: *\nAllow: /\nDisallow: /admin/");
    expect(file.groups).toHaveLength(1);
    const group = file.groups[0]!;
    expect(group.userAgents).toEqual(["*"]);
    expect(group.rules).toEqual([
      { type: "allow", path: "/", hasWildcard: false, hasEndAnchor: false, raw: "Allow: /", line: 2 },
      {
        type: "disallow",
        path: "/admin/",
        hasWildcard: false,
        hasEndAnchor: false,
        raw: "Disallow: /admin/",
        line: 3,
      },
    ]);
    expect(group.lineRange).toEqual({ start: 1, end: 3 });
  });

  it("splits multiple groups and starts a new group on User-agent after rules", () => {
    const file = parseRobots(
      ["User-agent: Googlebot", "Disallow: /no-google/", "", "User-agent: Bingbot", "Disallow: /no-bing/"].join(
        "\n",
      ),
    );
    expect(file.groups.map((g) => g.userAgents)).toEqual([["Googlebot"], ["Bingbot"]]);
    expect(file.groups[1]!.rules[0]).toMatchObject({ path: "/no-bing/" });
  });

  it("merges consecutive User-agent lines into one group", () => {
    const file = parseRobots("User-agent: GPTBot\nUser-agent: CCBot\nDisallow: /");
    expect(file.groups).toHaveLength(1);
    expect(file.groups[0]!.userAgents).toEqual(["GPTBot", "CCBot"]);
  });

  it("collects sitemaps at file level regardless of position", () => {
    const file = parseRobots("Sitemap: https://a.com/s.xml\nUser-agent: *\nSitemap: https://a.com/s2.xml");
    expect(file.sitemaps).toEqual([
      { url: "https://a.com/s.xml", line: 1 },
      { url: "https://a.com/s2.xml", line: 3 },
    ]);
  });

  it("reads a numeric crawl-delay onto the group", () => {
    const file = parseRobots("User-agent: *\nCrawl-delay: 10");
    expect(file.groups[0]!.crawlDelay).toBe(10);
  });

  it("captures the host directive (first wins)", () => {
    const file = parseRobots("Host: example.com\nHost: other.com");
    expect(file.host).toBe("example.com");
  });
});

describe("parseRobots — real-world tolerance", () => {
  it("preserves unknown / vendor-specific directives without discarding them", () => {
    const file = parseRobots("User-agent: Yandex\nClean-param: ref /article\nDisallow: /tmp/");
    expect(file.unknownDirectives.map((d) => d.raw)).toContain("Clean-param: ref /article");
    // The supported rule in the same group is still parsed.
    expect(file.groups[0]!.rules.map((r) => r.path)).toEqual(["/tmp/"]);
  });

  it("preserves duplicate rules (no de-duplication)", () => {
    const file = parseRobots("User-agent: *\nDisallow: /admin/\nDisallow: /admin/");
    expect(file.groups[0]!.rules).toHaveLength(2);
  });

  it("tolerates mixed casing on field names", () => {
    const file = parseRobots("user-agent: *\nDISALLOW: /x");
    expect(file.groups[0]!.userAgents).toEqual(["*"]);
    expect(file.groups[0]!.rules[0]).toMatchObject({ type: "disallow", path: "/x" });
  });

  it("records malformed (no-colon) lines as unknown without throwing", () => {
    const file = parseRobots("User-agent *\nDisallow /admin");
    expect(file.groups).toHaveLength(0);
    expect(file.unknownDirectives).toHaveLength(2);
  });

  it("treats allow/disallow before any user-agent as orphan (unknown) directives", () => {
    const file = parseRobots("Disallow: /early\nUser-agent: *\nDisallow: /late");
    expect(file.unknownDirectives.map((d) => d.value)).toContain("/early");
    expect(file.groups[0]!.rules.map((r) => r.path)).toEqual(["/late"]);
  });

  it("treats a crawl-delay before any user-agent as an orphan directive", () => {
    const file = parseRobots("Crawl-delay: 5\nUser-agent: *\nDisallow: /");
    expect(file.groups).toHaveLength(1);
    expect(file.groups[0]!.crawlDelay).toBeUndefined();
    expect(file.unknownDirectives.map((d) => d.field)).toContain("crawl-delay");
  });

  it("leaves crawlDelay unset for a non-numeric value but keeps the directive", () => {
    const file = parseRobots("User-agent: *\nCrawl-delay: lots");
    expect(file.groups[0]!.crawlDelay).toBeUndefined();
    expect(file.directives.some((d) => d.field === "crawl-delay")).toBe(true);
  });
});

describe("parseRobots — edge cases", () => {
  it("returns an empty file for empty input", () => {
    const file = parseRobots("");
    expect(file.groups).toEqual([]);
    expect(file.directives).toEqual([]);
    expect(file.lineCount).toBe(0);
  });

  it("parses a comments-only file into zero groups", () => {
    const file = parseRobots("# just a note\n# another");
    expect(file.groups).toEqual([]);
    expect(file.directives.every((d) => d.field === "comment")).toBe(true);
  });

  it("computes wildcard and end-anchor metadata on rule paths", () => {
    const file = parseRobots("User-agent: *\nDisallow: /*.pdf$\nAllow: /public/");
    const [pdf, pub] = file.groups[0]!.rules;
    expect(pdf).toMatchObject({ hasWildcard: true, hasEndAnchor: true });
    expect(pub).toMatchObject({ hasWildcard: false, hasEndAnchor: false });
  });

  it("handles repeated user-agents across separate groups", () => {
    const file = parseRobots("User-agent: *\nDisallow: /a\nUser-agent: *\nDisallow: /b");
    expect(file.groups).toHaveLength(2);
    expect(file.groups.map((g) => g.rules[0]!.path)).toEqual(["/a", "/b"]);
  });

  it("preserves a very long path verbatim", () => {
    const longPath = `/${"segment/".repeat(200)}`;
    const file = parseRobots(`User-agent: *\nDisallow: ${longPath}`);
    expect(file.groups[0]!.rules[0]!.path).toBe(longPath);
  });
});

describe("parseRobots — fidelity", () => {
  it("round-trips: joining directive raw lines reconstructs the source", () => {
    const source = [
      "# robots for example.com",
      "User-agent: *",
      "Disallow: /admin/ # secret",
      "",
      "Sitemap: https://example.com/sitemap.xml",
    ].join("\n");
    const file = parseRobots(source);
    expect(file.directives.map((d) => d.raw).join("\n")).toBe(source);
  });

  it("records one directive per source line in order", () => {
    const source = "User-agent: *\n\n# note\nDisallow: /x";
    const file = parseRobots(source);
    expect(file.directives.map((d) => d.field)).toEqual(["user-agent", "blank", "comment", "disallow"]);
    expect(file.lineCount).toBe(4);
  });
});
