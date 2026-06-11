/**
 * Event taxonomy (Phase 13B) — the single source of truth for event names and the
 * typed `track*` helpers every call site uses. Centralizing names + property keys here
 * keeps instrumentation consistent and the downstream dashboards stable.
 *
 * Design note: we model intent with ONE event + a discriminating property rather than
 * many near-duplicate names. `tool_clicked { tool }` yields the per-tool breakdowns
 * (analyze/generate/validate/tester/explain/ai_manager) the brief lists, without six
 * separate event names to maintain. Same for `pageview { page_type }`.
 */
import type { ToolId } from "@/config/content";
import { capture, pageview } from "./client";
import type { PageType } from "./classify";

/** Canonical event names. */
export const EVENTS = {
  pageview: "$pageview",
  toolClicked: "tool_clicked",
  ctaClicked: "cta_clicked",
  fetchRobots: "fetch_robots",
  analyzeCompleted: "analyze_completed",
  validationCompleted: "validation_completed",
  codeCopied: "code_copied",
  issueSelected: "issue_selected",
  fixApplied: "fix_applied",
  fixUndone: "fix_undone",
  actionQueueClicked: "action_queue_clicked",
  recentAnalysisSaved: "recent_analysis_saved",
  dashboardResumeClicked: "dashboard_resume_clicked",
  dashboardHistoryCleared: "dashboard_history_cleared",
} as const;

/** Which workspace a fix event came from (Validator vs. Analyzer queue). */
export type FixSurface = "validator" | "analyzer";

/** Where a click/conversion originated (a page_type, or an in-tool surface). */
export type SourceType = PageType | "rail" | "nav" | "footer";

/** Pageview with a classified page type (powers SEO top-page reporting). */
export function trackPageview(path: string, pageType: PageType): void {
  pageview(path, { page_type: pageType });
}

/** A user opened a tool (from a CTA, card, or nav). Breaks down by `tool`. */
export function trackToolClicked(tool: ToolId, sourcePath: string, sourceType: SourceType): void {
  capture(EVENTS.toolClicked, { tool, source_path: sourcePath, source_type: sourceType });
}

/** A conversion CTA into a tool was clicked. The core funnel event. */
export function trackCtaClicked(
  tool: ToolId,
  sourcePath: string,
  sourceType: SourceType,
  location?: string,
): void {
  capture(EVENTS.ctaClicked, { tool, source_path: sourcePath, source_type: sourceType, location });
}

/** A live robots.txt fetch was started. `source` = the tool that triggered it. */
export function trackFetchRobots(source: string): void {
  capture(EVENTS.fetchRobots, { source });
}

export interface AnalyzeCompletedProps {
  readonly fetchStatus: string;
  readonly visibilityScore: number;
  readonly visibilityBand: string;
  readonly healthScore: number;
  readonly errorCount: number;
  readonly warningCount: number;
  readonly findingCount: number;
  /** Distinct finding codes (answers "most common analyzer findings"). */
  readonly findingCodes: readonly string[];
}

/** An analysis finished and rendered a report. */
export function trackAnalyzeCompleted(p: AnalyzeCompletedProps): void {
  capture(EVENTS.analyzeCompleted, {
    fetch_status: p.fetchStatus,
    visibility_score: p.visibilityScore,
    visibility_band: p.visibilityBand,
    health_score: p.healthScore,
    error_count: p.errorCount,
    warning_count: p.warningCount,
    finding_count: p.findingCount,
    finding_codes: p.findingCodes,
  });
}

export interface ValidationCompletedProps {
  readonly healthScore: number;
  readonly healthBand: string;
  readonly errorCount: number;
  readonly warningCount: number;
  readonly infoCount: number;
  /** Distinct issue codes (answers "most common validation errors"). */
  readonly issueCodes: readonly string[];
}

/** A validation settled (debounced) and rendered results. */
export function trackValidationCompleted(p: ValidationCompletedProps): void {
  capture(EVENTS.validationCompleted, {
    health_score: p.healthScore,
    health_band: p.healthBand,
    error_count: p.errorCount,
    warning_count: p.warningCount,
    info_count: p.infoCount,
    issue_codes: p.issueCodes,
  });
}

/** A code snippet / template was copied. `context` = label or template id. */
export function trackCodeCopied(context: string, path: string): void {
  capture(EVENTS.codeCopied, { context, path });
}

/**
 * A validation issue was selected in the workspace (Phase 2A). `via` separates the
 * issue-list path from the editor path (gutter marker / heatmap / annotated line) —
 * answers whether the issue↔line linking is actually used.
 */
export function trackIssueSelected(code: string, via: "list" | "editor"): void {
  capture(EVENTS.issueSelected, { code, via });
}

export interface FixAppliedProps {
  /** "single" = one issue's Fix; "all-safe" = the batch action. */
  readonly mode: "single" | "all-safe";
  /** Issue code (single mode only). */
  readonly code?: string;
  /** Whether the applied fix was tagged safe (single mode only). */
  readonly safe?: boolean;
  /** Number of issues resolved by this apply. */
  readonly count: number;
  /** Overall score delta produced by the apply (after − before). */
  readonly scoreDelta: number;
  /** Originating workspace (omitted = validator, the original surface). */
  readonly surface?: FixSurface;
}

/** A fix (single or batch) was applied to the working file (Phase 2A). */
export function trackFixApplied(p: FixAppliedProps): void {
  capture(EVENTS.fixApplied, {
    mode: p.mode,
    code: p.code,
    safe: p.safe,
    count: p.count,
    score_delta: p.scoreDelta,
    surface: p.surface,
  });
}

/** The last applied fix was undone (Phase 2A) — measures fix trust/regret. */
export function trackFixUndone(surface?: FixSurface): void {
  capture(EVENTS.fixUndone, { surface });
}

/**
 * An Action Queue row's action was clicked on the Analyzer (Phase 17A). `kind`
 * separates in-app fixes from deep-links into Control tools — answers whether the
 * queue drives remediation, navigation, or both.
 */
export function trackActionQueueClicked(code: string, kind: "fix" | "deep-link"): void {
  capture(EVENTS.actionQueueClicked, { code, kind });
}

/** A fresh analysis was persisted to the local recent-analyses store (Phase 17C). */
export function trackRecentAnalysisSaved(findingCount: number): void {
  capture(EVENTS.recentAnalysisSaved, { finding_count: findingCount });
}

/** A homepage "Continue" was clicked — the session-continuity loop works (Phase 17C). */
export function trackDashboardResumeClicked(ageHours: number, hasDelta: boolean): void {
  capture(EVENTS.dashboardResumeClicked, { age_hours: ageHours, has_delta: hasDelta });
}

/** The local analysis history was cleared (Phase 17C). */
export function trackDashboardHistoryCleared(): void {
  capture(EVENTS.dashboardHistoryCleared, {});
}
