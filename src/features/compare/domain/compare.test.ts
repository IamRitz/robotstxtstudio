import { describe, expect, it } from "vitest";
import { buildComparison } from "./compare";

const A = `User-agent: *
Allow: /
Disallow: /admin/
Crawl-delay: 0

Sitemap: http://example.com/sitemap.xml`;

// B fixes the no-op crawl-delay and upgrades the sitemap to https.
const B = `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: https://example.com/sitemap.xml`;

describe("buildComparison", () => {
  it("reports identical files with zero deltas", () => {
    const c = buildComparison(A, A);
    expect(c.identical).toBe(true);
    expect(c.overall.delta).toBe(0);
    expect(c.findingsAdded).toHaveLength(0);
    expect(c.findingsResolved).toHaveLength(0);
    expect(c.crawlerChanges).toHaveLength(0);
  });

  it("computes overall + dimension + visibility deltas (B improves on A)", () => {
    const c = buildComparison(A, B);
    expect(c.identical).toBe(false);
    expect(c.overall.after).toBeGreaterThan(c.overall.before);
    expect(c.overall.delta).toBe(c.overall.after - c.overall.before);
    expect(c.dimensions).toHaveLength(5);
    // SEO improves (http→https resolved) and Maintainability improves (crawl-delay:0 gone).
    const seo = c.dimensions.find((d) => d.key === "seo")!;
    const maint = c.dimensions.find((d) => d.key === "maintainability")!;
    expect(seo.delta).toBeGreaterThan(0);
    expect(maint.delta).toBeGreaterThan(0);
  });

  it("lists findings resolved (present in A, gone in B)", () => {
    const c = buildComparison(A, B);
    const resolved = c.findingsResolved.map((f) => f.code);
    expect(resolved).toContain("crawl-delay-zero");
    expect(resolved).toContain("sitemap-not-https");
    expect(c.findingsAdded.map((f) => f.code)).not.toContain("crawl-delay-zero");
  });

  it("detects per-crawler visibility changes (block → allow)", () => {
    const left = "User-agent: GPTBot\nDisallow: /";
    const right = "User-agent: GPTBot\nAllow: /";
    const c = buildComparison(left, right);
    const gpt = c.crawlerChanges.find((r) => r.id === "gptbot");
    expect(gpt).toBeDefined();
    expect(gpt!.before).toBe("blocked");
    expect(gpt!.after).toBe("allowed");
  });

  it("always returns a first-class AI crawler list (every AI crawler, both sides)", () => {
    const c = buildComparison("User-agent: GPTBot\nDisallow: /", "User-agent: *\nAllow: /");
    expect(c.aiCrawlers.length).toBeGreaterThan(0);
    expect(c.aiCrawlers.every((r) => r.before && r.after)).toBe(true);
    const gpt = c.aiCrawlers.find((r) => r.id === "gptbot")!;
    expect(gpt.before).toBe("blocked");
    expect(gpt.after).toBe("allowed");
  });

  // The README's "policy regression" example: a training block edited to also list an
  // AI search crawler must surface as an access change, and a search-engine block
  // must show up in the overall visibility delta.
  it("surfaces an AI search crawler newly caught by a training block", () => {
    const before = "User-agent: GPTBot\nDisallow: /\n\nUser-agent: *\nAllow: /";
    const after = "User-agent: GPTBot\nUser-agent: OAI-SearchBot\nDisallow: /\n\nUser-agent: *\nAllow: /";
    const c = buildComparison(before, after);
    const change = c.crawlerChanges.find((r) => r.id === "oai-searchbot");
    expect(change).toMatchObject({ category: "ai-search", before: "allowed", after: "blocked" });
    expect(c.aiCrawlers.find((r) => r.id === "oai-searchbot")?.changed).toBe(true);
    // A deliberate AI-search choice is not a search-visibility loss.
    expect(c.visibility.after).toBe(c.visibility.before);
  });

  it("drops search visibility when a staging Disallow: / ships", () => {
    const c = buildComparison("User-agent: *\nAllow: /", "User-agent: *\nDisallow: /");
    expect(c.crawlerChanges.some((r) => r.id === "googlebot" && r.after === "blocked")).toBe(true);
    expect(c.visibility.after).toBeLessThan(c.visibility.before);
  });
});
