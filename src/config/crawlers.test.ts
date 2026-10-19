import { describe, expect, it } from "vitest";
import { crawlerCatalogSchema } from "@/schemas";
import { ALL_CRAWLERS, crawlersByCategory, getCrawler, isAiCategory } from "./crawlers";
import { AI_CRAWLERS } from "./ai-crawler-directory";

describe("crawler catalog", () => {
  it("conforms to the crawler catalog schema (shape + unique ids)", () => {
    expect(crawlerCatalogSchema.safeParse(ALL_CRAWLERS).success).toBe(true);
  });

  it("contains the documented crawlers including the major AI crawlers", () => {
    expect(ALL_CRAWLERS).toHaveLength(22);
    for (const id of ["gptbot", "claudebot", "perplexitybot", "ccbot", "google-extended"]) {
      expect(getCrawler(id)).toBeDefined();
    }
  });

  it("looks crawlers up by id and category", () => {
    expect(getCrawler("googlebot")?.userAgent).toBe("Googlebot");
    expect(getCrawler("nope")).toBeUndefined();
    expect(crawlersByCategory("search-engine")).toHaveLength(3);
  });

  it("separates AI search crawlers, AI training crawlers, and control tokens", () => {
    // Operator docs: these surface/link pages in AI answers and are not training bots.
    for (const id of ["oai-searchbot", "claude-searchbot", "perplexitybot"]) {
      expect(getCrawler(id)?.category).toBe("ai-search");
    }
    for (const id of ["gptbot", "claudebot", "ccbot"]) {
      expect(getCrawler(id)?.category).toBe("ai-training");
    }
    // Google-Extended / Applebot-Extended never fetch pages — they are usage controls.
    for (const id of ["google-extended", "applebot-extended"]) {
      expect(getCrawler(id)?.category).toBe("ai-control");
    }
    expect(isAiCategory("ai-control")).toBe(true);
    expect(isAiCategory("search-engine")).toBe(false);
  });

  it("covers every crawler in the AI Crawler Directory (no catalog drift)", () => {
    for (const entry of AI_CRAWLERS) {
      expect(getCrawler(entry.id), entry.id).toBeDefined();
    }
  });

  it("agrees with the directory on training vs search usage", () => {
    for (const entry of AI_CRAWLERS) {
      const crawler = getCrawler(entry.id)!;
      if (crawler.category === "ai-search") expect(entry.search, entry.id).toBe("yes");
      if (crawler.category === "ai-training") expect(entry.training, entry.id).not.toBe("no");
    }
  });
});
