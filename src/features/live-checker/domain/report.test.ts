import { describe, expect, it } from "vitest";
import type { FetchResult } from "@/types";
import { buildAnalysisReport } from "./report";

const okFetch = (body: string): FetchResult => ({
  status: "ok",
  requestedUrl: "https://example.com/robots.txt",
  finalUrl: "https://example.com/robots.txt",
  httpStatus: 200,
  contentType: "text/plain",
  body,
  robotsExists: true,
  redirected: false,
});

const AT = "2026-01-01T00:00:00.000Z";

describe("buildAnalysisReport — successful fetch", () => {
  it("composes the existing engines into a full report", () => {
    const report = buildAnalysisReport(okFetch("User-agent: *\nDisallow: /admin/\nSitemap: https://example.com/s.xml"), "example.com", AT);
    expect(report.domain).toBe("example.com");
    expect(report.fetch.status).toBe("ok");
    expect(report.file.groups).toHaveLength(1);
    expect(report.validation).toBeDefined();
    expect(report.explanation?.aiCrawlers).toHaveLength(5);
    expect(report.breakdown).toHaveLength(6);
    expect(report.visibility.band).toBeDefined();
  });

  it("reflects an AI-heavy (block-all-AI) file in the breakdown and visibility", () => {
    const aiHeavy = [
      "User-agent: GPTBot",
      "User-agent: ClaudeBot",
      "User-agent: CCBot",
      "User-agent: Bytespider",
      "User-agent: meta-externalagent",
      "Disallow: /",
      "",
      "User-agent: PerplexityBot",
      "User-agent: Google-Extended",
      "User-agent: Applebot-Extended",
      "Disallow: /",
      "",
      "User-agent: *",
      "Allow: /",
    ].join("\n");
    const report = buildAnalysisReport(okFetch(aiHeavy), "example.com", AT);
    const aiTraining = report.breakdown.find((b) => b.category === "ai-training")!;
    expect(aiTraining.blocked).toBe(aiTraining.total);
    expect(report.visibility.aiCrawlerAccess).toBe(0);
    expect(report.visibility.searchEngineAccess).toBe(100);
  });

  it("splits findings (errors+warnings) from recommendations (info)", () => {
    const report = buildAnalysisReport(okFetch("User-agent: *\nAllow: /x\nDisallow: /x"), "example.com", AT);
    expect(report.findings.some((f) => f.code === "conflicting-rules")).toBe(true);
    expect(report.findings.every((f) => f.severity !== "info")).toBe(true);
    expect(report.recommendations.every((r) => r.severity === "info" || r.id.startsWith("fetch-"))).toBe(true);
  });
});

describe("buildAnalysisReport — missing robots.txt", () => {
  it("analyzes an empty allow-all file and recommends creating one", () => {
    const fetch: FetchResult = {
      status: "not-found",
      requestedUrl: "https://example.com/robots.txt",
      httpStatus: 404,
      robotsExists: false,
      redirected: false,
    };
    const report = buildAnalysisReport(fetch, "example.com", AT);
    expect(report.fetch.status).toBe("not-found");
    expect(report.file.groups).toEqual([]);
    expect(report.visibility.searchEngineAccess).toBe(100);
    expect(report.recommendations.find((r) => r.id === "fetch-not-found")?.action).toEqual({
      kind: "open-generator",
    });
  });
});

describe("buildAnalysisReport — failed fetch", () => {
  it("still produces a well-formed report for a timeout", () => {
    const fetch: FetchResult = {
      status: "timeout",
      requestedUrl: "https://example.com/robots.txt",
      robotsExists: false,
      redirected: false,
      error: "timed out",
    };
    const report = buildAnalysisReport(fetch, "example.com", AT);
    expect(report.fetch.status).toBe("timeout");
    expect(report.recommendations.some((r) => r.id === "fetch-timeout")).toBe(true);
  });
});
