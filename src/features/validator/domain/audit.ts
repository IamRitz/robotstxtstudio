/**
 * Audit scoring engine (Phase 15B — Validator 2.0).
 *
 * Deliberately simple and transparent: each of the five dimensions starts at 100 and
 * every validation issue subtracts a FIXED, documented number of points (the
 * `DEDUCTIONS` table below) from one or more dimensions. A dimension score is
 * `100 − Σ points` (clamped). The overall score is a fixed weighted average of the
 * five. There are no learned/opaque numbers — every deduction is traceable to a
 * specific rule and shown to the user, so "why is this 72 and not 84?" always has a
 * concrete, additive answer.
 *
 * Pure and deterministic. The same issues always produce the same report.
 */
import { healthBand } from "@/types";
import type {
  AuditPriority,
  AuditReport,
  AuditSummary,
  DimensionDeduction,
  DimensionScore,
  ScoreDimension,
  ValidationCode,
  ValidationIssue,
} from "@/types";

/** A single dimension hit: how many points a code removes from a dimension. */
interface Hit {
  readonly dimension: ScoreDimension;
  readonly points: number;
}

/**
 * THE deduction table. Per-occurrence points each rule removes, by dimension. A code
 * may affect more than one dimension (e.g. a malformed Sitemap URL is both a syntax
 * error and an SEO/discovery problem). Keep these round and few — this table IS the
 * scoring model and is documented 1:1 in docs/VALIDATOR.md.
 */
export const DEDUCTIONS: Partial<Record<ValidationCode, readonly Hit[]>> = {
  // Syntax — validity / parseability.
  "missing-colon": [{ dimension: "syntax", points: 15 }],
  "empty-user-agent": [{ dimension: "syntax", points: 15 }],
  "directive-before-user-agent": [{ dimension: "syntax", points: 10 }],
  "invalid-crawl-delay": [{ dimension: "syntax", points: 8 }],
  "conflicting-rules": [{ dimension: "syntax", points: 12 }],
  "invalid-sitemap-url": [
    { dimension: "syntax", points: 8 },
    { dimension: "seo", points: 6 },
  ],
  "quoted-directive": [{ dimension: "syntax", points: 10 }],
  "path-missing-leading-slash": [{ dimension: "syntax", points: 6 }],
  "redundant-wildcard": [{ dimension: "syntax", points: 3 }],
  // SEO — rendering / indexing impact.
  "blocks-rendering-assets": [{ dimension: "seo", points: 12 }],
  "noindex-unsupported": [{ dimension: "seo", points: 6 }],
  // Maintainability.
  "duplicate-user-agent-group": [{ dimension: "maintainability", points: 6 }],
  // SEO — discoverability.
  "missing-sitemap": [
    { dimension: "seo", points: 10 },
    { dimension: "maintainability", points: 2 },
  ],
  "overly-broad-disallow": [{ dimension: "seo", points: 25 }],
  "sitemap-not-https": [{ dimension: "seo", points: 4 }],
  // AI — deliberate AI-crawler decisions (per crawler).
  "missing-ai-crawler-policy": [{ dimension: "ai", points: 10 }],
  "ai-crawler-inherits-default": [{ dimension: "ai", points: 5 }],
  // Maintainability — clarity / future-proofing.
  "duplicate-rule": [{ dimension: "maintainability", points: 5 }],
  "excessive-rules": [{ dimension: "maintainability", points: 10 }],
  "unsupported-directive": [{ dimension: "maintainability", points: 4 }],
  "crawl-delay-zero": [{ dimension: "maintainability", points: 4 }],
  "crawl-delay-ignored-by-google": [{ dimension: "maintainability", points: 3 }],
  "no-default-group": [{ dimension: "maintainability", points: 6 }],
  "no-crawler-specific-groups": [{ dimension: "maintainability", points: 3 }],
  "no-comments": [{ dimension: "maintainability", points: 3 }],
  // Security — public information disclosure.
  "sensitive-path-disclosure": [{ dimension: "security", points: 12 }],
};

/** Short labels per code for the breakdown rows. */
const CODE_LABEL: Partial<Record<ValidationCode, string>> = {
  "missing-colon": "Malformed line",
  "quoted-directive": "Quoted path",
  "path-missing-leading-slash": "Path missing leading slash",
  "redundant-wildcard": "Redundant wildcard",
  "blocks-rendering-assets": "Blocks rendering assets (CSS/JS)",
  "noindex-unsupported": "Noindex is ignored",
  "duplicate-user-agent-group": "Duplicate user-agent group",
  "empty-user-agent": "Empty User-agent",
  "directive-before-user-agent": "Rule before User-agent",
  "invalid-crawl-delay": "Invalid Crawl-delay",
  "conflicting-rules": "Conflicting rules",
  "invalid-sitemap-url": "Malformed Sitemap URL",
  "missing-sitemap": "Missing sitemap",
  "overly-broad-disallow": "Disallow: / blocks everything",
  "sitemap-not-https": "Sitemap not HTTPS",
  "missing-ai-crawler-policy": "AI crawler has no policy",
  "ai-crawler-inherits-default": "AI crawler inherits default",
  "duplicate-rule": "Duplicate rules",
  "excessive-rules": "Excessive rule count",
  "unsupported-directive": "Unsupported directive",
  "crawl-delay-zero": "Crawl-delay: 0 (no-op)",
  "crawl-delay-ignored-by-google": "Crawl-delay ignored by Google",
  "no-default-group": "No default group",
  "no-crawler-specific-groups": "No crawler-specific groups",
  "no-comments": "No comments",
  "sensitive-path-disclosure": "Sensitive path disclosed",
};

/** Short human label for an issue code (falls back to the code itself). */
export function codeLabel(code: ValidationCode): string {
  return CODE_LABEL[code] ?? code;
}

/** Dimension metadata: order, label, weight, and what the score means. */
export const DIMENSIONS: ReadonlyArray<{
  readonly key: ScoreDimension;
  readonly label: string;
  readonly weight: number;
  readonly explanation: string;
}> = [
  {
    key: "syntax",
    label: "Syntax",
    weight: 0.3,
    explanation:
      "Is the file valid and parseable? Errors here can break how crawlers read your rules.",
  },
  {
    key: "seo",
    label: "SEO",
    weight: 0.25,
    explanation:
      "Can search engines discover and crawl your site, with a sitemap and no over-blocking?",
  },
  {
    key: "ai",
    label: "AI Crawlers",
    weight: 0.2,
    explanation: "Have you made a deliberate allow/block decision for each major AI crawler?",
  },
  {
    key: "maintainability",
    label: "Maintainability",
    weight: 0.15,
    explanation: "Is the file clean, documented, and free of duplicate or dead rules?",
  },
  {
    key: "security",
    label: "Security",
    weight: 0.1,
    explanation: "robots.txt is public — does it avoid advertising sensitive admin/secret paths?",
  },
];

const clamp = (n: number): number => Math.max(0, Math.min(100, Math.round(n)));

/** Does this issue have an in-app fix the tool can apply? */
const isRecoverable = (i: ValidationIssue): boolean => (i.fix?.edits?.length ?? 0) > 0;
/** Is this issue resolvable by the one-click "Fix All Safe"? */
const isSafe = (i: ValidationIssue): boolean => i.fix?.safe === true && isRecoverable(i);

/**
 * The per-dimension point recoveries from resolving a single issue — drives the
 * Fix Impact Preview. Returns each affected dimension's points plus the weighted
 * overall delta. Reads straight from {@link DEDUCTIONS}, so it always matches the
 * scoreboard math.
 */
export function fixImpact(issue: ValidationIssue): {
  readonly dimensions: readonly Hit[];
  readonly overall: number;
} {
  const hits = DEDUCTIONS[issue.code] ?? [];
  const overall = hits.reduce((sum, h) => {
    const weight = DIMENSIONS.find((d) => d.key === h.dimension)?.weight ?? 0;
    return sum + h.points * weight;
  }, 0);
  return { dimensions: hits, overall: Math.round(overall) };
}

/** Compute one dimension's score from the issues that affect it. */
function scoreDimension(
  meta: (typeof DIMENSIONS)[number],
  issues: readonly ValidationIssue[],
): DimensionScore {
  // Aggregate by code for this dimension.
  const byCode = new Map<
    ValidationCode,
    { perOccurrence: number; count: number; recoverable: boolean }
  >();
  let lostNonRecoverable = 0;
  for (const issue of issues) {
    const hit = (DEDUCTIONS[issue.code] ?? []).find((h) => h.dimension === meta.key);
    if (!hit) continue;
    const entry = byCode.get(issue.code) ?? {
      perOccurrence: hit.points,
      count: 0,
      recoverable: false,
    };
    entry.count += 1;
    entry.recoverable = entry.recoverable || isRecoverable(issue);
    byCode.set(issue.code, entry);
    if (!isRecoverable(issue)) lostNonRecoverable += hit.points;
  }

  const deductions: DimensionDeduction[] = [...byCode.entries()]
    .map(([code, e]) => ({
      code,
      label: CODE_LABEL[code] ?? code,
      perOccurrence: e.perOccurrence,
      count: e.count,
      points: e.perOccurrence * e.count,
      recoverable: e.recoverable,
    }))
    .sort((a, b) => b.points - a.points);

  const totalLost = deductions.reduce((s, d) => s + d.points, 0);
  const value = clamp(100 - totalLost);
  const potential = clamp(100 - lostNonRecoverable);

  return {
    dimension: meta.key,
    label: meta.label,
    explanation: meta.explanation,
    value,
    band: healthBand(value),
    deductions,
    potential,
  };
}

/** Weighted average of dimension scores (using a per-dimension value selector). */
function weightedOverall(
  dimensions: readonly DimensionScore[],
  select: (d: DimensionScore) => number,
): number {
  return clamp(
    dimensions.reduce((sum, d) => {
      const weight = DIMENSIONS.find((m) => m.key === d.dimension)!.weight;
      return sum + select(d) * weight;
    }, 0),
  );
}

/** Build the executive summary from the scored dimensions + issues. */
function buildSummary(
  dimensions: readonly DimensionScore[],
  issues: readonly ValidationIssue[],
  estimatedAfterSafeFixes: number,
): AuditSummary {
  const strengths = dimensions
    .filter((d) => d.value >= 85)
    .map((d) => `${d.label} is solid (${d.value}/100).`);

  const weaknesses = dimensions
    .filter((d) => d.value < 85)
    .sort((a, b) => a.value - b.value)
    .map((d) => `${d.label} needs attention (${d.value}/100).`);

  // Priorities: every deduction, biggest point-impact first, de-duplicated by code.
  const seen = new Set<ValidationCode>();
  const priorities: AuditPriority[] = [];
  for (const issue of [...issues].sort((a, b) => impactPoints(b) - impactPoints(a))) {
    if (seen.has(issue.code) || impactPoints(issue) === 0) continue;
    seen.add(issue.code);
    const primary = (DEDUCTIONS[issue.code] ?? [])[0];
    if (!primary) continue;
    priorities.push({
      code: issue.code,
      title: issue.title,
      dimension: primary.dimension,
      severity: issue.severity,
      points: impactPoints(issue),
      recoverable: isRecoverable(issue),
    });
  }

  const headline = buildHeadline(dimensions, weaknesses.length === 0);

  return {
    headline,
    strengths,
    weaknesses,
    priorities: priorities.slice(0, 4),
    estimatedAfterSafeFixes,
  };
}

/** Total raw points an issue removes across all dimensions (for ranking). */
function impactPoints(issue: ValidationIssue): number {
  return (DEDUCTIONS[issue.code] ?? []).reduce((s, h) => s + h.points, 0);
}

/** Compose a deterministic, plain-English verdict from the dimension scores. */
function buildHeadline(dimensions: readonly DimensionScore[], allHealthy: boolean): string {
  const syntax = dimensions.find((d) => d.dimension === "syntax")!;
  const valid = syntax.value >= 85;
  const validClause = valid
    ? "Your robots.txt is technically valid"
    : "Your robots.txt has syntax problems that can affect how crawlers read it";

  if (allHealthy) {
    return `${validClause} and follows best practices across syntax, SEO, AI, maintainability, and security.`;
  }

  const worst = [...dimensions].sort((a, b) => a.value - b.value)[0]!;
  const opportunity: Record<ScoreDimension, string> = {
    syntax: "the syntax errors above should be fixed first",
    seo: "SEO discoverability is the biggest opportunity (sitemap and crawl access)",
    ai: "AI-crawler coverage is the biggest gap — decide allow/block per crawler",
    maintainability: "maintainability can be improved (duplicate or undocumented rules)",
    security: "it discloses sensitive paths publicly, which is the biggest concern",
  };
  return `${validClause}, but ${opportunity[worst.dimension]}.`;
}

/**
 * Build the full multi-dimensional {@link AuditReport} from validation issues.
 * Pure and deterministic.
 */
export function buildAudit(issues: readonly ValidationIssue[]): AuditReport {
  const dimensions = DIMENSIONS.map((meta) => scoreDimension(meta, issues));

  const value = weightedOverall(dimensions, (d) => d.value);
  const potential = weightedOverall(dimensions, (d) => d.potential);

  // Estimated overall after only the *safe* one-click fixes.
  const safeDimensions = DIMENSIONS.map((meta) => {
    let lostNonSafe = 0;
    for (const issue of issues) {
      const hit = (DEDUCTIONS[issue.code] ?? []).find((h) => h.dimension === meta.key);
      if (hit && !isSafe(issue)) lostNonSafe += hit.points;
    }
    return clamp(100 - lostNonSafe);
  });
  const estimatedAfterSafeFixes = clamp(
    DIMENSIONS.reduce((sum, meta, i) => sum + safeDimensions[i]! * meta.weight, 0),
  );

  return {
    overall: { value, band: healthBand(value), potential },
    dimensions,
    summary: buildSummary(dimensions, issues, estimatedAfterSafeFixes),
  };
}
