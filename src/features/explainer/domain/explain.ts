/**
 * Explainer orchestrator: RobotsFile (+ optional ValidationResult / AI statuses)
 * → ExplanationResult. Pure; the single entry point reused across features.
 */
import { getAiCrawlerStatuses } from "@/features/validator";
import type { AiCrawlerStatus } from "@/features/validator";
import type { ExplanationResult, RobotsFile, ValidationResult } from "@/types";
import { explainAiCrawlers } from "./ai-explainer";
import { explainGroup } from "./group-explainer";
import { buildNotes, explainSitemaps } from "./notes";
import { buildSummary } from "./summary";

export interface ExplainOptions {
  /** When provided, drives advisory notes and the score line in the summary. */
  readonly validation?: ValidationResult;
  /** AI crawler statuses; defaults to computing them from the file. */
  readonly aiStatuses?: readonly AiCrawlerStatus[];
}

/** Produce a plain-English explanation of a parsed robots.txt file. */
export function explainRobots(file: RobotsFile, options: ExplainOptions = {}): ExplanationResult {
  const aiStatuses = options.aiStatuses ?? getAiCrawlerStatuses(file);

  const groups = file.groups.map(explainGroup);
  const aiCrawlers = explainAiCrawlers(file, aiStatuses);
  const sitemaps = explainSitemaps(file);
  const notes = buildNotes(options.validation);
  const summary = buildSummary(file, groups, aiCrawlers, options.validation);

  return { summary, groups, aiCrawlers, sitemaps, notes };
}
