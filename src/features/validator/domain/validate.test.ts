import { describe, expect, it } from "vitest";
import { parseRobots } from "@/parser";
import type { ValidationCode } from "@/types";
import { validateRobots } from "./validate";

/** Convenience: the set of issue codes a file produces. */
function codesFor(text: string): ValidationCode[] {
  return validateRobots(parseRobots(text)).issues.map((i) => i.code);
}

describe("validateRobots — valid files", () => {
  const clean = [
    "# example.com robots",
    "User-agent: *",
    "Disallow: /drafts/",
    "Allow: /",
    "",
    "User-agent: GPTBot",
    "Disallow: /",
    "User-agent: ClaudeBot",
    "Disallow: /",
    "User-agent: PerplexityBot",
    "Disallow: /",
    "User-agent: CCBot",
    "Disallow: /",
    "User-agent: Google-Extended",
    "Disallow: /",
    "",
    "Sitemap: https://example.com/sitemap.xml",
  ].join("\n");

  it("reports a well-formed, fully-configured file as valid with no issues", () => {
    const result = validateRobots(parseRobots(clean));
    expect(result.isValid).toBe(true);
    expect(result.issues).toEqual([]);
    expect(result.health.value).toBe(100);
    expect(result.health.band).toBe("good");
  });

  it("does not flag Disallow: / for a named AI crawler (intentional block)", () => {
    expect(codesFor(clean)).not.toContain("overly-broad-disallow");
  });
});

describe("validateRobots — critical (error) rules", () => {
  it("missing-colon for a line without a colon", () => {
    expect(codesFor("User-agent: *\nDisallow /admin")).toContain("missing-colon");
  });
  it("directive-before-user-agent for an orphan rule", () => {
    expect(codesFor("Disallow: /early\nUser-agent: *\nAllow: /")).toContain(
      "directive-before-user-agent",
    );
  });
  it("empty-user-agent for `User-agent:` with no value", () => {
    expect(codesFor("User-agent:\nDisallow: /")).toContain("empty-user-agent");
  });
  it("invalid-crawl-delay for a non-numeric value", () => {
    expect(codesFor("User-agent: *\nCrawl-delay: soon")).toContain("invalid-crawl-delay");
  });
  it("invalid-sitemap-url for a non-URL sitemap", () => {
    expect(codesFor("User-agent: *\nDisallow:\nSitemap: not-a-url")).toContain(
      "invalid-sitemap-url",
    );
  });
  it("conflicting-rules when a path is both allowed and disallowed", () => {
    expect(codesFor("User-agent: *\nAllow: /x\nDisallow: /x")).toContain("conflicting-rules");
  });
  it("marks the result invalid when any error is present", () => {
    expect(validateRobots(parseRobots("User-agent: *\nCrawl-delay: nope")).isValid).toBe(false);
  });
});

describe("validateRobots — warning rules", () => {
  it("duplicate-rule for a repeated rule", () => {
    expect(codesFor("User-agent: *\nDisallow: /x\nDisallow: /x")).toContain("duplicate-rule");
  });
  it("missing-sitemap when no sitemap is declared", () => {
    expect(codesFor("User-agent: *\nDisallow: /x")).toContain("missing-sitemap");
  });
  it("overly-broad-disallow for `Disallow: /` on the wildcard group", () => {
    expect(codesFor("User-agent: *\nDisallow: /")).toContain("overly-broad-disallow");
  });
  it("excessive-rules for a very large group", () => {
    const many = [
      "User-agent: *",
      ...Array.from({ length: 51 }, (_, i) => `Disallow: /p${i}`),
    ].join("\n");
    expect(codesFor(many)).toContain("excessive-rules");
  });
  it("unsupported-directive for a vendor directive", () => {
    expect(codesFor("User-agent: Yandex\nClean-param: ref /x\nDisallow: /y")).toContain(
      "unsupported-directive",
    );
  });
  it("crawl-delay-zero for `Crawl-delay: 0`", () => {
    expect(codesFor("User-agent: Bingbot\nCrawl-delay: 0\nDisallow: /x")).toContain(
      "crawl-delay-zero",
    );
  });
});

describe("validateRobots — recommendation (info) rules", () => {
  it("no-default-group when there is no wildcard group", () => {
    expect(codesFor("User-agent: Googlebot\nDisallow: /x")).toContain("no-default-group");
  });
  it("no-crawler-specific-groups when only a wildcard group exists", () => {
    expect(codesFor("User-agent: *\nDisallow: /admin/")).toContain("no-crawler-specific-groups");
  });
  it("no-comments when the file has no comments", () => {
    expect(codesFor("User-agent: *\nDisallow: /x")).toContain("no-comments");
  });
  it("sitemap-not-https for an http sitemap", () => {
    expect(codesFor("User-agent: *\nDisallow:\nSitemap: http://example.com/s.xml")).toContain(
      "sitemap-not-https",
    );
  });
  it("crawl-delay-ignored-by-google for a crawl-delay on the wildcard group", () => {
    expect(codesFor("User-agent: *\nCrawl-delay: 5\nDisallow: /x")).toContain(
      "crawl-delay-ignored-by-google",
    );
  });
});

describe("validateRobots — AI crawler rules (differentiator)", () => {
  it("missing-ai-crawler-policy when no default group and no AI groups", () => {
    const codes = codesFor("User-agent: Googlebot\nDisallow: /x");
    expect(codes).toContain("missing-ai-crawler-policy");
    expect(codes).not.toContain("ai-crawler-inherits-default");
  });
  it("ai-crawler-inherits-default when AI crawlers only inherit the wildcard", () => {
    const codes = codesFor("User-agent: *\nDisallow: /admin/");
    expect(codes).toContain("ai-crawler-inherits-default");
    expect(codes).not.toContain("missing-ai-crawler-policy");
  });
  it("emits one AI issue per unconfigured major crawler (5)", () => {
    const issues = validateRobots(parseRobots("User-agent: *\nDisallow: /admin/")).issues;
    expect(issues.filter((i) => i.code === "ai-crawler-inherits-default")).toHaveLength(5);
  });
});

describe("validateRobots — structure & ordering", () => {
  it("produces severity counts and sorts errors before warnings before info", () => {
    const result = validateRobots(parseRobots("User-agent: *\nDisallow /bad\nDisallow: /"));
    expect(result.counts.error).toBeGreaterThanOrEqual(1);
    expect(result.counts.warning).toBeGreaterThanOrEqual(1);
    const severities = result.issues.map((i) => i.severity);
    const firstWarning = severities.indexOf("warning");
    const lastError = severities.lastIndexOf("error");
    expect(lastError).toBeLessThan(firstWarning);
  });

  it("gives every issue a stable, unique id", () => {
    const ids = validateRobots(parseRobots("User-agent: *\nDisallow: /")).issues.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("validateRobots — edge cases", () => {
  it("an empty file is valid but recommends configuration", () => {
    const result = validateRobots(parseRobots(""));
    expect(result.isValid).toBe(true);
    expect(result.issues.map((i) => i.code)).toEqual(
      expect.arrayContaining(["missing-sitemap", "missing-ai-crawler-policy", "no-default-group"]),
    );
  });

  it("a comments-only file does not raise the no-comments recommendation", () => {
    expect(codesFor("# just notes\n# more notes")).not.toContain("no-comments");
  });
});

describe("validateRobots — real-world publisher file", () => {
  it("flags AI inheritance and a Google crawl-delay but stays valid", () => {
    const publisher = [
      "User-agent: *",
      "Allow: /",
      "Disallow: /wp-admin/",
      "Crawl-delay: 5",
      "Sitemap: https://news.example.com/sitemap.xml",
    ].join("\n");
    const result = validateRobots(parseRobots(publisher));
    expect(result.isValid).toBe(true);
    const codes = result.issues.map((i) => i.code);
    expect(codes).toContain("ai-crawler-inherits-default");
    expect(codes).toContain("crawl-delay-ignored-by-google");
  });
});
