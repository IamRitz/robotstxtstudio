import { describe, expect, it } from "vitest";
import { parseRobots } from "@/parser";
import { policySetFromFile } from "./from-file";

describe("policySetFromFile", () => {
  it("reads explicit blocks, explicit allows, and inheritance", () => {
    const file = parseRobots(
      [
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin/",
        "",
        "User-agent: GPTBot",
        "Disallow: /",
        "",
        "User-agent: ClaudeBot",
        "Allow: /",
      ].join("\n"),
    );
    const set = policySetFromFile(file);
    expect(set.permissions["gptbot"]).toBe("block");
    expect(set.permissions["claudebot"]).toBe("allow");
    // No explicit group → inherit (absent from the map).
    expect(set.permissions["perplexitybot"]).toBeUndefined();
    expect(set.permissions["googlebot"]).toBeUndefined();
  });

  it("carries the * baseline: disallow paths, sitemap, crawl-delay", () => {
    const file = parseRobots(
      [
        "User-agent: *",
        "Disallow: /admin/",
        "Disallow: /tmp/",
        "Disallow: /admin/", // duplicate — de-duped
        "Crawl-delay: 5",
        "",
        "Sitemap: https://example.com/sitemap.xml",
      ].join("\n"),
    );
    const set = policySetFromFile(file);
    expect(set.disallowPaths).toEqual(["/admin/", "/tmp/"]);
    expect(set.sitemapUrl).toBe("https://example.com/sitemap.xml");
    expect(set.crawlDelay).toBe(5);
  });

  it("ignores full-site and empty disallows in the baseline paths", () => {
    const file = parseRobots(["User-agent: *", "Disallow: /", "Disallow:"].join("\n"));
    expect(policySetFromFile(file).disallowPaths).toEqual([]);
  });

  it("handles an empty file (everything inherits, nothing configured)", () => {
    const set = policySetFromFile(parseRobots(""));
    expect(Object.keys(set.permissions)).toHaveLength(0);
    expect(set.disallowPaths).toEqual([]);
    expect(set.sitemapUrl).toBeUndefined();
    expect(set.crawlDelay).toBeUndefined();
  });

  it("matches user-agent tokens case-insensitively", () => {
    const file = parseRobots(["User-agent: gptbot", "Disallow: /"].join("\n"));
    expect(policySetFromFile(file).permissions["gptbot"]).toBe("block");
  });
});
