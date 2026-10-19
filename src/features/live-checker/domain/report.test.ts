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
    expect(report.breakdown).toHaveLength(7);
    expect(report.policyStatus).toBe("verified");
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
    expect(report.visibility.aiTrainingAccess).toBe(0);
    expect(report.visibility.searchEngineAccess).toBe(100);
  });

  it("does not lower the visibility score for a deliberate AI training opt-out", () => {
    const base = "User-agent: *\nAllow: /\n\nSitemap: https://example.com/sitemap.xml\n";
    const optOut = [
      "User-agent: GPTBot",
      "User-agent: ClaudeBot",
      "User-agent: CCBot",
      "User-agent: Google-Extended",
      "User-agent: PerplexityBot",
      "Disallow: /",
      "",
      base,
    ].join("\n");
    const explicitAllow = optOut.replace("Disallow: /\n", "Allow: /\n");
    const blocked = buildAnalysisReport(okFetch(optOut), "example.com", AT);
    const allowed = buildAnalysisReport(okFetch(explicitAllow), "example.com", AT);
    expect(blocked.visibility.aiTrainingAccess).toBeLessThan(allowed.visibility.aiTrainingAccess);
    expect(blocked.visibility.aiSearchAccess).toBeLessThan(allowed.visibility.aiSearchAccess);
    expect(blocked.visibility.value).toBe(allowed.visibility.value);
  });

  it("reports AI search and AI training access separately", () => {
    const file = "User-agent: GPTBot\nUser-agent: ClaudeBot\nDisallow: /\n\nUser-agent: *\nAllow: /";
    const report = buildAnalysisReport(okFetch(file), "example.com", AT);
    expect(report.visibility.aiSearchAccess).toBe(100);
    expect(report.visibility.aiTrainingAccess).toBeLessThan(100);
  });

  it("lowers the score when search engines are blocked", () => {
    const report = buildAnalysisReport(okFetch("User-agent: *\nDisallow: /"), "example.com", AT);
    expect(report.visibility.searchEngineAccess).toBe(0);
    expect(report.visibility.band).toBe("poor");
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
    expect(report.policyStatus).toBe("absent");
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
    expect(report.policyStatus).toBe("unverified");
    expect(report.recommendations.some((r) => r.id === "fetch-timeout")).toBe(true);
  });

  it("marks a 5xx as unverified — the policy is unknown, not allow-all", () => {
    const fetch: FetchResult = {
      status: "network-error",
      requestedUrl: "https://example.com/robots.txt",
      httpStatus: 503,
      robotsExists: false,
      redirected: false,
      error: "Server responded 503",
    };
    expect(buildAnalysisReport(fetch, "example.com", AT).policyStatus).toBe("unverified");
  });

  it("parses rules served with the wrong content-type instead of assuming allow-all", () => {
    const fetch: FetchResult = {
      status: "invalid-content-type",
      requestedUrl: "https://example.com/robots.txt",
      httpStatus: 200,
      contentType: "text/html",
      body: "User-agent: *\nDisallow: /",
      robotsExists: true,
      redirected: false,
    };
    const report = buildAnalysisReport(fetch, "example.com", AT);
    expect(report.policyStatus).toBe("verified");
    expect(report.visibility.searchEngineAccess).toBe(0);
  });
});
