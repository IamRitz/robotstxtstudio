import { describe, expect, it } from "vitest";
import { parseRobots } from "@/parser";
import { validateRobots } from "@/features/validator";
import type { GeneratorConfig, WebsiteType } from "@/types";
import { buildRobotsFile } from "./build";
import { generatePreview, generateRobots } from "./generate";
import { applyPreset } from "./presets";

const TEMPLATES: WebsiteType[] = ["blog", "saas", "ecommerce", "publisher", "documentation"];

describe("generateRobots — presets", () => {
  it.each(TEMPLATES)("produces a valid file for the %s preset", (template) => {
    const { file, text } = generateRobots(applyPreset(template));
    expect(text).toContain("User-agent: *");
    expect(text).toContain("User-agent: GPTBot"); // AI training blocked in every preset
    expect(text).toContain("Disallow: /");
    expect(validateRobots(file).isValid).toBe(true);
  });

  it("is deterministic", () => {
    const config = applyPreset("saas");
    expect(generateRobots(config).text).toBe(generateRobots(config).text);
  });
});

describe("generateRobots — round-trip fidelity", () => {
  it.each(TEMPLATES)("re-parsing the serialized %s output reproduces the AST exactly", (template) => {
    const file = buildRobotsFile(applyPreset(template));
    const text = file.directives.map((d) => d.raw).join("\n");
    const reparsed = parseRobots(text);
    expect(reparsed).toEqual(file);
    expect(reparsed.directives.map((d) => d.raw).join("\n")).toBe(text);
  });

  it("round-trips a fully custom config", () => {
    const config: GeneratorConfig = {
      crawlerPolicies: { gptbot: "block", claudebot: "block" },
      disallowPaths: ["/admin/", "/private/"],
      sitemapUrl: "https://example.com/sitemap.xml",
      crawlDelay: 5,
    };
    const file = buildRobotsFile(config);
    expect(parseRobots(file.source!)).toEqual(file);
  });
});

describe("generateRobots — scenarios", () => {
  it("emits explicit Disallow groups for blocked crawlers and a wildcard baseline", () => {
    const { text, file } = generateRobots({
      crawlerPolicies: { gptbot: "block", ccbot: "block" },
      disallowPaths: ["/admin/"],
    });
    expect(text).toContain("User-agent: GPTBot");
    expect(text).toContain("User-agent: CCBot");
    expect(text).not.toContain("Crawl-delay:"); // none provided
    const wildcard = file.groups.find((g) => g.userAgents.includes("*"))!;
    expect(wildcard.rules.map((r) => `${r.type} ${r.path}`)).toEqual(["allow /", "disallow /admin/"]);
  });

  it("does not give allowed crawlers their own group", () => {
    const { file } = generateRobots({ crawlerPolicies: { googlebot: "allow" }, disallowPaths: [] });
    expect(file.groups).toHaveLength(1); // only the wildcard baseline
    expect(file.groups[0]!.userAgents).toEqual(["*"]);
  });

  it("includes sitemap and crawl-delay when provided", () => {
    const { text } = generateRobots({
      crawlerPolicies: {},
      disallowPaths: [],
      sitemapUrl: "https://example.com/sitemap.xml",
      crawlDelay: 10,
    });
    expect(text).toContain("Crawl-delay: 10");
    expect(text).toContain("Sitemap: https://example.com/sitemap.xml");
  });

  it("ignores unknown crawler ids", () => {
    const { file } = generateRobots({ crawlerPolicies: { nope: "block" }, disallowPaths: [] });
    expect(file.groups).toHaveLength(1);
    expect(file.groups[0]!.userAgents).toEqual(["*"]);
  });

  it("generates a minimal valid file from an empty config", () => {
    const { file, text } = generateRobots({ crawlerPolicies: {}, disallowPaths: [] });
    expect(text).toContain("User-agent: *");
    expect(validateRobots(file).isValid).toBe(true);
  });
});

describe("generatePreview", () => {
  it("returns text, validation, explanation, and sample access checks", () => {
    const preview = generatePreview(applyPreset("blog"));
    expect(preview.validation.isValid).toBe(true);
    expect(preview.explanation.aiCrawlers).toHaveLength(5);
    expect(preview.samples).toHaveLength(3);
    // GPTBot blocked, Googlebot allowed at root, Googlebot blocked on /wp-admin/.
    expect(preview.samples[0]).toMatchObject({ userAgent: "GPTBot", decision: "blocked" });
    expect(preview.samples[1]).toMatchObject({ userAgent: "Googlebot", decision: "allowed" });
    expect(preview.samples[2]).toMatchObject({ url: "/wp-admin/", decision: "blocked" });
  });
});
