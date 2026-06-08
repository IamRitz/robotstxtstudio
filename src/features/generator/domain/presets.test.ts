import { describe, expect, it } from "vitest";
import { ALL_CRAWLERS } from "@/config/crawlers";
import { PRESETS, applyPreset } from "./presets";

describe("presets", () => {
  it("locks the approved set and excludes news/portfolio", () => {
    expect(Object.keys(PRESETS).sort()).toEqual([
      "blog",
      "documentation",
      "ecommerce",
      "publisher",
      "saas",
    ]);
  });

  it("applyPreset assigns a policy to every catalog crawler", () => {
    const config = applyPreset("blog");
    expect(config.template).toBe("blog");
    expect(Object.keys(config.crawlerPolicies)).toHaveLength(ALL_CRAWLERS.length);
  });

  it("blog allows search engines and blocks AI training", () => {
    const { crawlerPolicies, disallowPaths } = applyPreset("blog");
    expect(crawlerPolicies["googlebot"]).toBe("allow");
    expect(crawlerPolicies["gptbot"]).toBe("block");
    expect(disallowPaths).toEqual(["/wp-admin/"]);
  });

  it("ecommerce allows AI-search crawlers but blocks AI-training", () => {
    const { crawlerPolicies } = applyPreset("ecommerce");
    expect(crawlerPolicies["perplexitybot"]).toBe("allow"); // ai-search
    expect(crawlerPolicies["gptbot"]).toBe("block"); // ai-training
  });
});
