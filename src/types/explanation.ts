/**
 * Explainer model.
 *
 * The Explainer turns a {@link RobotsFile} into deterministic plain-English prose
 * (no LLM in v1, per PRD §11 S7). The Analyzer reuses these structures for the
 * narrative parts of an audit.
 */
import type { UserAgentToken } from "./robots";

/** Plain-English explanation of a single {@link RobotsGroup}. */
export interface GroupExplanation {
  readonly userAgents: readonly UserAgentToken[];
  /** One-sentence summary of what this group does. */
  readonly summary: string;
  /** Bulleted specifics (per rule / crawl-delay). */
  readonly bullets: readonly string[];
}

/** The full plain-English explanation of a file. */
export interface ExplanationResult {
  /** One-paragraph overview of the whole file. */
  readonly summary: string;
  readonly groups: readonly GroupExplanation[];
  /** Plain-English notes about sitemaps. */
  readonly sitemaps: readonly string[];
  /** Any additional notes (e.g. unsupported directives present). */
  readonly notes: readonly string[];
}
