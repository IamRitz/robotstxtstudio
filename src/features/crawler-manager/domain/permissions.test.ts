import { describe, expect, it } from "vitest";
import {
  allowAllAiCrawlers,
  blockAllAiCrawlers,
  emptyPolicySet,
  fromWebsitePreset,
  getPermission,
  setCategoryPermission,
  setPermission,
  setSitemapUrl,
} from "./permissions";

describe("policy set construction", () => {
  it("defaults every crawler to inherit", () => {
    expect(getPermission(emptyPolicySet(), "gptbot")).toBe("inherit");
  });

  it("setPermission is immutable", () => {
    const base = emptyPolicySet();
    const next = setPermission(base, "gptbot", "block");
    expect(getPermission(next, "gptbot")).toBe("block");
    expect(getPermission(base, "gptbot")).toBe("inherit");
  });

  it("setCategoryPermission updates every crawler in the category", () => {
    const set = setCategoryPermission(emptyPolicySet(), "ai-training", "block");
    for (const id of ["gptbot", "claudebot", "ccbot", "bytespider", "meta-externalagent"]) {
      expect(getPermission(set, id)).toBe("block");
    }
    expect(getPermission(set, "googlebot")).toBe("inherit"); // unaffected
  });

  it("seeds from a website preset", () => {
    const set = fromWebsitePreset("blog");
    expect(set.template).toBe("blog");
    expect(getPermission(set, "googlebot")).toBe("allow");
    expect(getPermission(set, "gptbot")).toBe("block");
    expect(set.disallowPaths).toEqual(["/wp-admin/"]);
  });

  it("block/allow all AI crawlers covers training and search only", () => {
    const blocked = blockAllAiCrawlers(emptyPolicySet());
    expect(getPermission(blocked, "gptbot")).toBe("block"); // training
    expect(getPermission(blocked, "perplexitybot")).toBe("block"); // search
    expect(getPermission(blocked, "googlebot")).toBe("inherit"); // search engine untouched

    const allowed = allowAllAiCrawlers(emptyPolicySet());
    expect(getPermission(allowed, "gptbot")).toBe("allow");
  });

  it("sets and clears the sitemap url", () => {
    const withMap = setSitemapUrl(emptyPolicySet(), "https://e.com/s.xml");
    expect(withMap.sitemapUrl).toBe("https://e.com/s.xml");
    expect(setSitemapUrl(withMap, undefined).sitemapUrl).toBeUndefined();
  });
});
