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
} as const;

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
