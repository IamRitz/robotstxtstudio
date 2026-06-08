/**
 * Live Analyzer model (Screen 2 — Crawler Visibility Audit).
 *
 * Composes the rest of the domain: a fetched file is parsed, validated, scored,
 * and summarized into an {@link AnalysisReport}. It introduces no duplicate
 * concepts — findings are {@link ValidationIssue}s, scores reuse {@link Score}.
 * The remote-fetch boundary is modeled by {@link FetchResult}; its request DTO is
 * validated by a Zod schema in `src/schemas`.
 */
import type { CrawlerCategory } from "./crawler";
import type { RobotsFile } from "./robots";
import type { Severity, ValidationIssue, ValidationResult } from "./validation";
import type { VisibilityScore } from "./score";
import type { ExplanationResult } from "./explanation";

/** Outcome of fetching a remote robots.txt. Distinguishes "missing" from "error". */
export type FetchStatus =
  | "ok"
  | "not-found" // 404 → treated as allow-all, shown explicitly (not an error)
  | "timeout"
  | "redirect-error"
  | "invalid-content-type"
  | "too-large"
  | "network-error";

/** The result of a server-side robots.txt fetch (Route Handler boundary). */
export interface FetchResult {
  readonly status: FetchStatus;
  /** The robots.txt URL that was requested. */
  readonly requestedUrl: string;
  /** The final URL after redirects, if any. */
  readonly finalUrl?: string;
  readonly httpStatus?: number;
  readonly contentType?: string;
  /** Raw body when {@link status} is `ok`. */
  readonly body?: string;
  /** True when a robots.txt was successfully retrieved. */
  readonly robotsExists: boolean;
  readonly redirected: boolean;
  /** Human-readable error detail for non-`ok` statuses. */
  readonly error?: string;
}

/** Per-category allowed/blocked tally for the crawler breakdown (Screen 2). */
export interface CategoryBreakdown {
  readonly category: CrawlerCategory;
  readonly allowed: number;
  readonly blocked: number;
  readonly total: number;
}

/** A recommended next action, deep-linking into a Control tool. */
export type RecommendedAction =
  | { readonly kind: "open-generator" }
  | { readonly kind: "open-crawler-manager" }
  | { readonly kind: "edit-rules" };

/** An actionable recommendation surfaced by the audit. */
export interface Recommendation {
  readonly id: string;
  readonly severity: Severity;
  readonly title: string;
  readonly description: string;
  readonly action?: RecommendedAction;
}

/** The full audit report for a live site. */
export interface AnalysisReport {
  readonly domain: string;
  /** ISO-8601 timestamp of when the audit ran. */
  readonly fetchedAt: string;
  readonly fetch: FetchResult;
  /** Parsed file (empty/allow-all when no robots.txt exists). */
  readonly file: RobotsFile;
  readonly validation: ValidationResult;
  readonly visibility: VisibilityScore;
  readonly breakdown: readonly CategoryBreakdown[];
  /** Audit findings (a curated/relabeled view over {@link ValidationResult.issues}). */
  readonly findings: readonly ValidationIssue[];
  readonly recommendations: readonly Recommendation[];
  /** Optional plain-English narrative (reuses the Explainer). */
  readonly explanation?: ExplanationResult;
}
