import { describe, expect, it } from "vitest";
import { crawlerCatalogSchema } from "@/schemas";
import { ALL_CRAWLERS, crawlersByCategory, getCrawler } from "./crawlers";

describe("crawler catalog", () => {
  it("conforms to the crawler catalog schema (shape + unique ids)", () => {
    expect(crawlerCatalogSchema.safeParse(ALL_CRAWLERS).success).toBe(true);
  });

  it("contains the documented crawlers including the major AI crawlers", () => {
    expect(ALL_CRAWLERS).toHaveLength(20);
    for (const id of ["gptbot", "claudebot", "perplexitybot", "ccbot", "google-extended"]) {
      expect(getCrawler(id)).toBeDefined();
    }
  });

  it("looks crawlers up by id and category", () => {
    expect(getCrawler("googlebot")?.userAgent).toBe("Googlebot");
    expect(getCrawler("nope")).toBeUndefined();
    expect(crawlersByCategory("search-engine")).toHaveLength(3);
  });
});
