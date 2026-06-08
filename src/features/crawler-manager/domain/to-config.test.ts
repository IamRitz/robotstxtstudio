import { describe, expect, it } from "vitest";
import type { PolicySet } from "./types";
import { toGeneratorConfig } from "./to-config";

describe("toGeneratorConfig", () => {
  it("maps block→block, allow→allow, and omits inherit", () => {
    const set: PolicySet = {
      permissions: { gptbot: "block", googlebot: "allow", claudebot: "inherit" },
      disallowPaths: ["/admin/"],
    };
    const config = toGeneratorConfig(set);
    expect(config.crawlerPolicies).toEqual({ gptbot: "block", googlebot: "allow" });
    expect(config.disallowPaths).toEqual(["/admin/"]);
  });

  it("carries template, sitemap, and crawl-delay through", () => {
    const set: PolicySet = {
      template: "saas",
      permissions: {},
      disallowPaths: [],
      sitemapUrl: "https://e.com/s.xml",
      crawlDelay: 5,
    };
    expect(toGeneratorConfig(set)).toMatchObject({
      template: "saas",
      sitemapUrl: "https://e.com/s.xml",
      crawlDelay: 5,
    });
  });
});
