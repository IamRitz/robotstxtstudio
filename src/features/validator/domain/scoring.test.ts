import { describe, expect, it } from "vitest";
import type { ValidationIssue } from "@/types";
import type { AiCrawlerStatus } from "./ai-crawlers";
import { MAJOR_AI_CRAWLERS } from "./constants";
import { aiConfigScore, computeHealth } from "./scoring";

function statuses(status: AiCrawlerStatus["status"]): AiCrawlerStatus[] {
  return MAJOR_AI_CRAWLERS.map((crawler) => ({ crawler, status }));
}

function issue(
  severity: ValidationIssue["severity"],
  code: ValidationIssue["code"],
): ValidationIssue {
  return { id: `${code}`, severity, code, title: code, message: code };
}

describe("aiConfigScore", () => {
  it("scores explicit 100, inherited 50, missing 0", () => {
    expect(aiConfigScore(statuses("explicit"))).toBe(100);
    expect(aiConfigScore(statuses("inherited"))).toBe(50);
    expect(aiConfigScore(statuses("missing"))).toBe(0);
  });

  it("returns 100 when no crawlers are tracked", () => {
    expect(aiConfigScore([])).toBe(100);
  });
});

describe("computeHealth", () => {
  it("is a perfect 100 with no issues and all AI explicit", () => {
    const health = computeHealth([], statuses("explicit"));
    expect(health).toMatchObject({
      value: 100,
      band: "good",
      subscores: { syntax: 100, aiCrawlerConfig: 100, bestPractices: 100 },
    });
  });

  it("drops the syntax sub-score for each error", () => {
    const health = computeHealth([issue("error", "missing-colon")], statuses("explicit"));
    expect(health.subscores.syntax).toBe(80);
  });

  it("drops the best-practices sub-score for warnings and non-AI infos", () => {
    const health = computeHealth(
      [issue("warning", "missing-sitemap"), issue("info", "no-comments")],
      statuses("explicit"),
    );
    expect(health.subscores.bestPractices).toBe(100 - 12 - 5);
  });

  it("does not penalize best-practices for AI recommendation infos", () => {
    const health = computeHealth(
      [issue("info", "ai-crawler-inherits-default")],
      statuses("inherited"),
    );
    expect(health.subscores.bestPractices).toBe(100);
  });

  it("lowers the overall band as problems accumulate", () => {
    const errors: ValidationIssue[] = Array.from({ length: 4 }, () =>
      issue("error", "conflicting-rules"),
    );
    const health = computeHealth(errors, statuses("missing"));
    expect(health.value).toBeLessThan(60);
    expect(health.band).toBe("poor");
  });
});
