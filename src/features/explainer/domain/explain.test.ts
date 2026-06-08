import { describe, expect, it } from "vitest";
import { parseRobots } from "@/parser";
import { validateRobots } from "@/features/validator";
import { explainRobots } from "./explain";

const explain = (text: string, withValidation = false) => {
  const file = parseRobots(text);
  return explainRobots(file, withValidation ? { validation: validateRobots(file) } : {});
};

const ai = (text: string, id: string) => explain(text).aiCrawlers.find((c) => c.id === id)!;

describe("explainRobots — common files", () => {
  it("explains an allow-all wildcard file", () => {
    const result = explain("User-agent: *\nAllow: /");
    expect(result.summary).toContain("By default, crawlers are allowed to access your entire site");
    expect(result.groups[0]).toMatchObject({ access: "allowed" });
    expect(result.aiCrawlers).toHaveLength(5);
  });

  it("explains a section block in plain language", () => {
    const result = explain("User-agent: *\nDisallow: /admin/");
    const group = result.groups[0]!;
    expect(group.access).toBe("partial");
    expect(group.summary).toContain("/admin/");
    expect(group.summary.toLowerCase()).toContain("blocked");
  });

  it("describes a crawl-delay in plain language", () => {
    const result = explain("User-agent: *\nCrawl-delay: 5\nDisallow: /x");
    expect(result.groups[0]!.bullets).toContain("Asked to wait 5 seconds between requests.");
  });

  it("notes when a sitemap is missing", () => {
    const result = explain("User-agent: *\nDisallow: /x");
    expect(result.sitemaps[0]).toContain("No sitemap was found");
  });
});

describe("explainRobots — AI crawlers", () => {
  it("explains an explicitly blocked AI crawler", () => {
    const gpt = ai("User-agent: GPTBot\nDisallow: /\nUser-agent: *\nAllow: /", "gptbot");
    expect(gpt).toMatchObject({ access: "blocked", configurationSource: "explicit" });
    expect(gpt.statusText).toBe("OpenAI's GPTBot is blocked from your entire site.");
    expect(gpt.purpose).toContain("OpenAI");
    expect(gpt.recommendation).toBeUndefined();
  });

  it("explains an AI crawler that only inherits the default group", () => {
    const claude = ai("User-agent: *\nAllow: /", "claudebot");
    expect(claude).toMatchObject({ access: "allowed", configurationSource: "inherited-default" });
    expect(claude.statusText).toContain("follows your default settings");
    expect(claude.recommendation).toContain("ClaudeBot");
  });

  it("explains an AI crawler with no policy and no default", () => {
    const perplexity = ai("User-agent: Googlebot\nDisallow: /private/", "perplexitybot");
    expect(perplexity).toMatchObject({ access: "allowed", configurationSource: "none" });
    expect(perplexity.statusText).toContain("freely access your entire site");
    expect(perplexity.recommendation).toBeDefined();
  });

  it("summarizes how many AI crawlers are blocked", () => {
    const result = explain(
      [
        "User-agent: GPTBot",
        "User-agent: ClaudeBot",
        "User-agent: PerplexityBot",
        "User-agent: CCBot",
        "User-agent: Google-Extended",
        "Disallow: /",
        "",
        "User-agent: *",
        "Allow: /",
      ].join("\n"),
    );
    expect(result.summary).toContain("5 of 5 major AI crawlers are blocked");
  });
});

describe("explainRobots — empty & comments-only files", () => {
  it("explains an empty file as allow-all", () => {
    const result = explain("");
    expect(result.summary).toContain("No crawler rules are defined");
    expect(result.groups).toEqual([]);
    expect(result.aiCrawlers.every((c) => c.access === "allowed")).toBe(true);
  });

  it("treats a comments-only file as having no rules", () => {
    const result = explain("# nothing here");
    expect(result.summary).toContain("No crawler rules are defined");
  });
});

describe("explainRobots — misconfigured files (with validation)", () => {
  it("adds a conflict note and a score line", () => {
    const result = explain("User-agent: *\nAllow: /x\nDisallow: /x", true);
    expect(result.notes.some((n) => n.includes("conflict"))).toBe(true);
    expect(result.summary).toMatch(/scores \d+\/100/);
  });

  it("flags unparseable lines via a friendly note", () => {
    const result = explain("User-agent: *\nDisallow /admin", true);
    expect(result.notes.some((n) => n.includes("aren't valid robots.txt"))).toBe(true);
  });

  it("produces no notes when no validation is supplied", () => {
    expect(explain("User-agent: *\nAllow: /x\nDisallow: /x").notes).toEqual([]);
  });
});

describe("explainRobots — large files", () => {
  it("explains every rule without throwing", () => {
    const text = ["User-agent: *", ...Array.from({ length: 60 }, (_, i) => `Disallow: /p${i}`)].join("\n");
    const result = explain(text);
    expect(result.groups[0]!.bullets).toHaveLength(60);
    expect(result.groups[0]!.access).toBe("partial");
  });
});
