/**
 * Explainer model.
 *
 * The Explainer turns a {@link RobotsFile} (and optionally a {@link ValidationResult}
 * and AI crawler statuses) into deterministic plain-English prose — no LLM in v1
 * (PRD §11 S7). Reused by the Explainer screen, Validator recommendations, the
 * Analyzer narrative, the AI Manager, and SEO/educational content.
 */
import type { UserAgentToken } from "./robots";

/** A crawler/group's effective access posture, in plain terms. */
export type CrawlerAccess = "allowed" | "blocked" | "partial";

/** Where a crawler's policy comes from (mirrors AI policy status). */
export type ConfigurationSource = "explicit" | "inherited-default" | "none";

/** Plain-English explanation of a single {@link RobotsGroup}. */
export interface GroupExplanation {
  readonly userAgents: readonly UserAgentToken[];
  /** One-sentence summary of what this group does. */
  readonly summary: string;
  /** Bulleted specifics (per rule / crawl-delay). */
  readonly bullets: readonly string[];
  /** The group's overall access posture, for UI/reuse. */
  readonly access: CrawlerAccess;
}

/** Per-crawler explanation for a major AI crawler (Purpose/Status/Source/Action). */
export interface AiCrawlerExplanation {
  readonly id: string;
  readonly name: string;
  readonly owner: string;
  /** What the crawler does, in plain language. */
  readonly purpose: string;
  /** The crawler's current effective access to the site. */
  readonly access: CrawlerAccess;
  /** Whether the policy is explicit, inherited from the default group, or absent. */
  readonly configurationSource: ConfigurationSource;
  /** One-sentence plain-English status, e.g. "OpenAI's GPTBot is blocked…". */
  readonly statusText: string;
  /** Suggested action when the policy is not explicit. */
  readonly recommendation?: string;
}

/** The full plain-English explanation of a file. */
export interface ExplanationResult {
  /** One-paragraph overview of the whole file. */
  readonly summary: string;
  readonly groups: readonly GroupExplanation[];
  /** Per-crawler explanations for the major AI crawlers. */
  readonly aiCrawlers: readonly AiCrawlerExplanation[];
  /** Plain-English notes about sitemaps. */
  readonly sitemaps: readonly string[];
  /** Additional advisory notes (translated from validation findings, etc.). */
  readonly notes: readonly string[];
}
