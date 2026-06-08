import { describe, expect, it } from "vitest";
import { parseRobots } from "./parser";
import { AI_CRAWLER_STYLE, GOOGLE_STYLE, LARGE_MULTI_GROUP, PUBLISHER_STYLE } from "./fixtures";

describe("compatibility — real-world robots.txt", () => {
  it("parses a Google-style file", () => {
    const file = parseRobots(GOOGLE_STYLE);
    expect(file.groups.map((g) => g.userAgents)).toEqual([["*"], ["Googlebot"]]);
    expect(file.groups[0]!.rules.map((r) => r.path)).toEqual(["/search", "/*?*", "/search/about"]);
    expect(file.groups[0]!.rules[1]).toMatchObject({ hasWildcard: true });
    expect(file.sitemaps).toEqual([{ url: "https://example.com/sitemap.xml", line: 11 }]);
  });

  it("parses a publisher-style file (allow SE, block AI, crawl-delay, host)", () => {
    const file = parseRobots(PUBLISHER_STYLE);
    expect(file.groups).toHaveLength(3);
    expect(file.groups[0]!.crawlDelay).toBe(5);
    const aiBlocked = file.groups.filter(
      (g) => g.userAgents.some((ua) => ua === "GPTBot" || ua === "CCBot") && g.rules[0]?.path === "/",
    );
    expect(aiBlocked).toHaveLength(2);
    expect(file.host).toBe("news.example.com");
  });

  it("parses an AI-crawler-focused file with a 7-agent shared block", () => {
    const file = parseRobots(AI_CRAWLER_STYLE);
    expect(file.groups).toHaveLength(2);
    expect(file.groups[0]!.userAgents).toEqual([
      "GPTBot",
      "ClaudeBot",
      "PerplexityBot",
      "CCBot",
      "Google-Extended",
      "Applebot-Extended",
      "Bytespider",
    ]);
    expect(file.groups[0]!.rules).toEqual([
      expect.objectContaining({ type: "disallow", path: "/" }),
    ]);
    expect(file.groups[1]!.userAgents).toEqual(["*"]);
  });

  it("parses a large multi-group file with mixed casing and vendor directives", () => {
    const file = parseRobots(LARGE_MULTI_GROUP);
    expect(file.groups.map((g) => g.userAgents)).toEqual([
      ["Googlebot"],
      ["Bingbot"],
      ["AhrefsBot"],
      ["SemrushBot"],
      ["*"],
    ]);
    expect(file.groups[0]!.crawlDelay).toBe(2);
    // Vendor directive preserved, not dropped.
    expect(file.unknownDirectives.map((d) => d.raw)).toContain("Clean-param: sessionid /");
    expect(file.sitemaps).toHaveLength(2);
    // The "/*.json$" rule carries wildcard + end-anchor metadata.
    const wildcardRule = file.groups[4]!.rules.find((r) => r.path === "/*.json$");
    expect(wildcardRule).toMatchObject({ hasWildcard: true, hasEndAnchor: true });
  });

  it("round-trips every fixture without losing a single line", () => {
    for (const sample of [GOOGLE_STYLE, PUBLISHER_STYLE, AI_CRAWLER_STYLE, LARGE_MULTI_GROUP]) {
      const file = parseRobots(sample);
      expect(file.directives.map((d) => d.raw).join("\n")).toBe(sample);
    }
  });
});
