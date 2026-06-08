import { describe, expect, it } from "vitest";
import type { Crawler, GeneratorConfig } from "@/types";
import {
  absoluteUrlSchema,
  crawlerCatalogSchema,
  crawlerSchema,
  domainSchema,
  generatorConfigSchema,
  robotsPathSchema,
  urlTestRequestSchema,
} from "./index";

describe("primitives", () => {
  it("domainSchema accepts bare and full domains, rejects non-domains", () => {
    expect(domainSchema.safeParse("example.com").success).toBe(true);
    expect(domainSchema.safeParse("https://example.com/robots.txt").success).toBe(true);
    expect(domainSchema.safeParse("sub.example.co.uk").success).toBe(true);
    expect(domainSchema.safeParse("not a domain").success).toBe(false);
    expect(domainSchema.safeParse("localhost").success).toBe(false);
    expect(domainSchema.safeParse("").success).toBe(false);
  });

  it("absoluteUrlSchema requires an http(s) protocol", () => {
    expect(absoluteUrlSchema.safeParse("https://example.com/sitemap.xml").success).toBe(true);
    expect(absoluteUrlSchema.safeParse("http://example.com/sitemap.xml").success).toBe(true);
    expect(absoluteUrlSchema.safeParse("example.com/sitemap.xml").success).toBe(false);
    expect(absoluteUrlSchema.safeParse("ftp://example.com").success).toBe(false);
  });

  it("robotsPathSchema requires a root-relative path", () => {
    expect(robotsPathSchema.safeParse("/admin/").success).toBe(true);
    expect(robotsPathSchema.safeParse("admin").success).toBe(false);
    expect(robotsPathSchema.safeParse("").success).toBe(false);
  });
});

describe("generatorConfigSchema", () => {
  const valid = {
    template: "ecommerce",
    crawlerPolicies: { googlebot: "allow", gptbot: "block" },
    disallowPaths: ["/checkout/", "/admin/"],
    sitemapUrl: "https://example.com/sitemap.xml",
    crawlDelay: 10,
  };

  it("parses a valid config and stays assignable to the domain type", () => {
    const parsed = generatorConfigSchema.parse(valid);
    // Compile-time alignment: schema output must satisfy the domain model.
    const config: GeneratorConfig = parsed;
    expect(config.template).toBe("ecommerce");
    expect(config.crawlerPolicies.gptbot).toBe("block");
  });

  it("rejects unknown templates, bad paths, and negative crawl-delay", () => {
    expect(generatorConfigSchema.safeParse({ ...valid, template: "news" }).success).toBe(false);
    expect(generatorConfigSchema.safeParse({ ...valid, disallowPaths: ["nope"] }).success).toBe(
      false,
    );
    expect(generatorConfigSchema.safeParse({ ...valid, crawlDelay: -1 }).success).toBe(false);
  });

  it("allows optional fields to be omitted", () => {
    const minimal = { crawlerPolicies: {}, disallowPaths: [] };
    expect(generatorConfigSchema.safeParse(minimal).success).toBe(true);
  });
});

describe("crawlerSchema", () => {
  const googlebot = {
    id: "googlebot",
    name: "Googlebot",
    owner: "Google",
    userAgent: "Googlebot",
    category: "search-engine",
    description: "Indexes your site for Google Search.",
    defaultRecommendation: "allow",
  };

  it("parses a valid crawler and stays assignable to the domain type", () => {
    const parsed = crawlerSchema.parse(googlebot);
    const crawler: Crawler = parsed;
    expect(crawler.category).toBe("search-engine");
  });

  it("rejects an unknown category", () => {
    expect(crawlerSchema.safeParse({ ...googlebot, category: "spaceship" }).success).toBe(false);
  });

  it("rejects a catalog with duplicate ids", () => {
    const dupe = crawlerCatalogSchema.safeParse([googlebot, googlebot]);
    expect(dupe.success).toBe(false);
  });
});

describe("urlTestRequestSchema", () => {
  it("accepts a domain source and a raw source", () => {
    expect(
      urlTestRequestSchema.safeParse({
        source: { kind: "domain", domain: "example.com" },
        url: "/admin/login",
        userAgent: "GPTBot",
      }).success,
    ).toBe(true);

    expect(
      urlTestRequestSchema.safeParse({
        source: { kind: "raw", content: "User-agent: *\nDisallow: /" },
        url: "/",
        userAgent: "*",
      }).success,
    ).toBe(true);
  });

  it("rejects a missing url and an unknown source kind", () => {
    expect(
      urlTestRequestSchema.safeParse({
        source: { kind: "domain", domain: "example.com" },
        url: "",
        userAgent: "GPTBot",
      }).success,
    ).toBe(false);

    expect(
      urlTestRequestSchema.safeParse({
        source: { kind: "carrier-pigeon", domain: "example.com" },
        url: "/x",
        userAgent: "GPTBot",
      }).success,
    ).toBe(false);
  });
});
