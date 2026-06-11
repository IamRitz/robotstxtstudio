import { describe, expect, it } from "vitest";
import { parseRobots } from "@/parser";
import { healthBand } from "@/types";
import { applyTextEdits, collectSafeEdits } from "./apply-fix";
import { buildAudit, fixImpact } from "./audit";
import { validateRobots } from "./validate";

const audit = (src: string) => buildAudit(validateRobots(parseRobots(src)).issues);
const dim = (src: string, d: string) => audit(src).dimensions.find((x) => x.dimension === d)!;

const SAMPLE = `User-agent: *
Allow: /
Disallow: /admin/
Crawl-delay: 0

User-agent: GPTBot
Disallow: /

Sitemap: http://example.com/sitemap.xml`;

// A file that triggers no issues at all (used as the 100/100 baseline).
const PERFECT = `# Crawl policy
User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: PerplexityBot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Google-Extended
Disallow: /

Sitemap: https://example.com/sitemap.xml`;

describe("health bands", () => {
  it("uses the standardized 95 / 85 / 70 thresholds", () => {
    expect(healthBand(100)).toBe("excellent");
    expect(healthBand(95)).toBe("excellent");
    expect(healthBand(94)).toBe("good");
    expect(healthBand(85)).toBe("good");
    expect(healthBand(84)).toBe("needs-attention");
    expect(healthBand(70)).toBe("needs-attention");
    expect(healthBand(69)).toBe("poor");
    expect(healthBand(0)).toBe("poor");
  });
});

describe("score calculation", () => {
  it("scores a clean file 100/100 across every dimension", () => {
    const report = audit(PERFECT);
    expect(report.overall.value).toBe(100);
    expect(report.overall.band).toBe("excellent");
    for (const d of report.dimensions) {
      expect(d.value).toBe(100);
      expect(d.deductions).toHaveLength(0);
    }
  });

  it("computes the sample's dimension scores from the documented deductions", () => {
    const report = audit(SAMPLE);
    // syntax 100 · seo 100-4 · ai 100-(4×5) · maint 100-4-3 · security 100-12
    expect(dim(SAMPLE, "syntax").value).toBe(100);
    expect(dim(SAMPLE, "seo").value).toBe(96); // sitemap-not-https −4
    expect(dim(SAMPLE, "ai").value).toBe(80); // 4 inherited crawlers × −5
    expect(dim(SAMPLE, "maintainability").value).toBe(93); // crawl-delay-zero −4, no-comments −3
    expect(dim(SAMPLE, "security").value).toBe(88); // /admin/ disclosed −12
    // Overall = fixed weighted average (0.30/0.25/0.20/0.15/0.10).
    expect(report.overall.value).toBe(93);
    expect(report.overall.band).toBe("good");
  });

  it("every deduction is traceable: dimension value = 100 − sum of its deductions", () => {
    for (const d of audit(SAMPLE).dimensions) {
      const lost = d.deductions.reduce((s, x) => s + x.points, 0);
      expect(d.value).toBe(Math.max(0, 100 - lost));
    }
  });
});

describe("category breakdowns", () => {
  it("aggregates repeated issues by code with a per-occurrence count", () => {
    const src = `User-agent: *\nDisallow: /a\nDisallow: /a\nDisallow: /b\nDisallow: /b\nDisallow: /b`;
    const maint = dim(src, "maintainability");
    const dup = maint.deductions.find((x) => x.code === "duplicate-rule")!;
    expect(dup.count).toBe(3); // /a once, /b twice → 3 duplicates
    expect(dup.perOccurrence).toBe(5);
    expect(dup.points).toBe(15);
    expect(dup.recoverable).toBe(true);
  });
});

describe("score changes after fixes", () => {
  it("raises the affected dimensions after Fix All Safe, leaving advisory ones", () => {
    const before = audit(SAMPLE);
    const fixed = applyTextEdits(
      SAMPLE,
      collectSafeEdits(validateRobots(parseRobots(SAMPLE)).issues),
    );
    const after = audit(fixed);

    expect(after.dimensions.find((d) => d.dimension === "seo")!.value).toBe(100); // http→https fixed
    expect(after.dimensions.find((d) => d.dimension === "maintainability")!.value).toBeGreaterThan(
      before.dimensions.find((d) => d.dimension === "maintainability")!.value,
    );
    expect(after.overall.value).toBeGreaterThan(before.overall.value);
    // Advisory security disclosure is NOT a safe fix → unchanged.
    expect(after.dimensions.find((d) => d.dimension === "security")!.value).toBe(88);
  });

  it("potential reflects only in-app fixes; estimatedAfterSafeFixes only safe ones", () => {
    const report = audit(SAMPLE);
    expect(report.overall.potential).toBeGreaterThanOrEqual(report.overall.value);
    expect(report.summary.estimatedAfterSafeFixes).toBeGreaterThanOrEqual(report.overall.value);
  });
});

describe("fix impact preview", () => {
  it("reports per-dimension and weighted overall recovery from the deduction table", () => {
    const issues = validateRobots(parseRobots(SAMPLE)).issues;
    const httpSitemap = issues.find((i) => i.code === "sitemap-not-https")!;
    const impact = fixImpact(httpSitemap);
    expect(impact.dimensions).toEqual([{ dimension: "seo", points: 4 }]);
    expect(impact.overall).toBe(1); // round(4 × 0.25)
  });
});

describe("audit summary", () => {
  it("lists strengths, weaknesses, priorities, and a verdict", () => {
    const { summary } = audit(SAMPLE);
    expect(summary.headline).toMatch(/technically valid/i);
    expect(summary.weaknesses.join(" ")).toMatch(/AI Crawlers/);
    expect(summary.strengths.length).toBeGreaterThan(0);
    // The biggest single-code point loss leads the priorities.
    expect(summary.priorities[0]!.code).toBe("sensitive-path-disclosure");
  });

  it("declares an all-healthy file a clean bill of health", () => {
    const { summary } = audit(PERFECT);
    expect(summary.weaknesses).toHaveLength(0);
    expect(summary.headline).toMatch(/follows best practices/i);
  });
});

describe("determinism", () => {
  it("produces identical reports for identical input", () => {
    expect(audit(SAMPLE)).toEqual(audit(SAMPLE));
  });
});
