/**
 * Comparison engine (Phase 15C.3) — diff two robots.txt files semantically.
 *
 * Deliberately lightweight: it composes the EXISTING engines (parser → validator →
 * audit → breakdown → visibility → tester) and emits score deltas, findings
 * added/resolved, and per-crawler access changes. No new robots.txt logic, no AST
 * diffing (raw text diff is handled by the shared <DiffView>). Pure & deterministic.
 */
import { parseRobots } from "@/parser";
import { buildAudit, validateRobots } from "@/features/validator";
import { computeBreakdown, computeVisibility } from "@/features/live-checker";
import { isAllowed } from "@/features/tester";
import { ALL_CRAWLERS, isAiCategory } from "@/config/crawlers";
import { compareSeverity } from "@/types";
import type {
  CrawlerAccessDelta,
  FindingDelta,
  RobotsComparison,
  ScoreDelta,
  ValidationCode,
} from "@/types";

function analyzeOne(text: string) {
  const file = parseRobots(text);
  const validation = validateRobots(file);
  const audit = buildAudit(validation.issues);
  const breakdown = computeBreakdown(file);
  const visibility = computeVisibility(breakdown, validation.health);
  return { file, validation, audit, visibility };
}

const delta = (key: string, label: string, before: number, after: number): ScoreDelta => ({
  key,
  label,
  before,
  after,
  delta: after - before,
});

/** Compare two robots.txt sources (A = `before`/left, B = `after`/right). */
export function buildComparison(leftText: string, rightText: string): RobotsComparison {
  const a = analyzeOne(leftText);
  const b = analyzeOne(rightText);

  const overall = delta("overall", "Overall health", a.audit.overall.value, b.audit.overall.value);
  const visibility = delta("visibility", "Search visibility", a.visibility.value, b.visibility.value);
  const dimensions = a.audit.dimensions.map((da, i) =>
    delta(da.dimension, da.label, da.value, b.audit.dimensions[i]!.value),
  );

  // Findings compared by code (per-occurrence noise collapsed); keep a representative
  // title/severity from whichever side reported the code.
  const meta = new Map<ValidationCode, { title: string; severity: FindingDelta["severity"] }>();
  for (const issue of [...a.validation.issues, ...b.validation.issues]) {
    if (!meta.has(issue.code)) meta.set(issue.code, { title: issue.title, severity: issue.severity });
  }
  const aCodes = new Set(a.validation.issues.map((i) => i.code));
  const bCodes = new Set(b.validation.issues.map((i) => i.code));
  const toFinding = (code: ValidationCode): FindingDelta => ({ code, ...meta.get(code)! });
  const bySeverity = (x: FindingDelta, y: FindingDelta) => compareSeverity(x.severity, y.severity);
  const findingsAdded = [...bCodes].filter((c) => !aCodes.has(c)).map(toFinding).sort(bySeverity);
  const findingsResolved = [...aCodes].filter((c) => !bCodes.has(c)).map(toFinding).sort(bySeverity);

  // Per-crawler site-root access on each side.
  const rows: CrawlerAccessDelta[] = ALL_CRAWLERS.map((c) => {
    const before = isAllowed(a.file, "/", c.userAgent) ? "allowed" : "blocked";
    const after = isAllowed(b.file, "/", c.userAgent) ? "allowed" : "blocked";
    return { id: c.id, name: c.name, category: c.category, before, after, changed: before !== after };
  });
  const crawlerChanges = rows.filter((r) => r.changed);
  const aiCrawlers = rows.filter((r) => isAiCategory(r.category));

  return {
    overall,
    visibility,
    dimensions,
    findingsAdded,
    findingsResolved,
    crawlerChanges,
    aiCrawlers,
    identical: leftText.trimEnd() === rightText.trimEnd(),
  };
}
