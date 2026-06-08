/**
 * The shared context passed to every validation rule, plus the `Rule` type.
 * Precomputes derived data (AI statuses) once so rules and scoring don't recompute.
 */
import type { RobotsFile, ValidationIssue } from "@/types";
import type { AiCrawlerStatus } from "./ai-crawlers";

export interface ValidationContext {
  readonly file: RobotsFile;
  readonly aiStatuses: readonly AiCrawlerStatus[];
}

/** A validation rule: a pure function from context to zero or more issues. */
export type Rule = (ctx: ValidationContext) => ValidationIssue[];
