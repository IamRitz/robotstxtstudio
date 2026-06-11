// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  canonicalDomain,
  clearRecentAnalyses,
  getRecentAnalysis,
  listRecentAnalyses,
  removeRecentAnalysis,
  saveRecentAnalysis,
  type RecentAnalysis,
} from "./recent-analyses";

function entry(
  domain: string,
  over: Partial<RecentAnalysis> = {},
): Omit<RecentAnalysis, "previousVisibility"> {
  return {
    domain,
    fetchedAt: "2026-06-11T10:00:00.000Z",
    visibility: { value: 80, band: "good" },
    health: 90,
    fetchStatus: "ok",
    findingCount: 2,
    safeFixCount: 1,
    fetch: {
      status: "ok",
      requestedUrl: `https://${domain}/robots.txt`,
      robotsExists: true,
      redirected: false,
    },
    source: "User-agent: *\nAllow: /",
    ...over,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe("canonicalDomain", () => {
  it("strips scheme, path, query, and case", () => {
    expect(canonicalDomain("https://Example.com/robots.txt?x=1")).toBe("example.com");
    expect(canonicalDomain("  example.com  ")).toBe("example.com");
    expect(canonicalDomain("example.com/path#frag")).toBe("example.com");
  });
});

describe("saveRecentAnalysis", () => {
  it("upserts newest-first and is LRU by domain", () => {
    saveRecentAnalysis(entry("a.com"));
    saveRecentAnalysis(entry("b.com"));
    saveRecentAnalysis(entry("a.com", { fetchedAt: "2026-06-11T11:00:00.000Z" }));
    expect(listRecentAnalyses().map((e) => e.domain)).toEqual(["a.com", "b.com"]);
  });

  it("caps at 10 entries", () => {
    for (let i = 0; i < 12; i++) saveRecentAnalysis(entry(`site${i}.com`));
    const domains = listRecentAnalyses().map((e) => e.domain);
    expect(domains).toHaveLength(10);
    expect(domains[0]).toBe("site11.com");
    expect(domains).not.toContain("site0.com");
  });

  it("records previousVisibility only across DIFFERENT fetches", () => {
    saveRecentAnalysis(entry("a.com", { visibility: { value: 70, band: "moderate" } }));
    // Same fetch (fix applied): no delta yet.
    saveRecentAnalysis(entry("a.com", { visibility: { value: 75, band: "moderate" } }));
    expect(getRecentAnalysis("a.com")?.previousVisibility).toBeUndefined();
    // New fetch: the old value becomes the baseline.
    saveRecentAnalysis(
      entry("a.com", {
        fetchedAt: "2026-06-12T10:00:00.000Z",
        visibility: { value: 82, band: "good" },
      }),
    );
    expect(getRecentAnalysis("a.com")?.previousVisibility).toBe(75);
  });

  it("omits oversized snapshots but keeps the entry", () => {
    saveRecentAnalysis(entry("big.com", { source: "x".repeat(200_000) }));
    const saved = getRecentAnalysis("big.com");
    expect(saved).toBeDefined();
    expect(saved?.source).toBeUndefined();
  });
});

describe("lookup & removal", () => {
  it("getRecentAnalysis matches canonicalized input", () => {
    saveRecentAnalysis(entry("example.com"));
    expect(getRecentAnalysis("https://Example.com/robots.txt")?.domain).toBe("example.com");
  });

  it("remove and clear work", () => {
    saveRecentAnalysis(entry("a.com"));
    saveRecentAnalysis(entry("b.com"));
    removeRecentAnalysis("a.com");
    expect(listRecentAnalyses().map((e) => e.domain)).toEqual(["b.com"]);
    clearRecentAnalyses();
    expect(listRecentAnalyses()).toEqual([]);
  });

  it("survives corrupt storage", () => {
    localStorage.setItem("rs:recent-analyses:v1", "{not json");
    expect(listRecentAnalyses()).toEqual([]);
    saveRecentAnalysis(entry("a.com")); // recovers by overwriting
    expect(listRecentAnalyses()).toHaveLength(1);
  });
});
