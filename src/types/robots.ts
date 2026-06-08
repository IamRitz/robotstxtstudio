/**
 * The canonical robots.txt representation (AST).
 *
 * This is THE single structured model for a robots.txt file. The parser produces
 * it from raw text; the generator produces it from a {@link GeneratorConfig}; and
 * the validator, tester, explainer, analyzer, and compare features all consume it.
 * Having one representation is the core anti-duplication decision of the domain
 * layer (PRD §15, refinement A).
 *
 * Pure data only — no React, no `next/*`, no `zod`. See {@link RobotsFile}.
 */

/** Inclusive 1-based line span within the source text. */
export interface LineRange {
  /** First line (1-based, inclusive). */
  readonly start: number;
  /** Last line (1-based, inclusive). */
  readonly end: number;
}

/**
 * Recognized robots.txt directive fields, plus markers needed for faithful,
 * loss-tolerant parsing (`comment`, `blank`, `unknown`). The parser classifies
 * every source line as one of these; the validator interprets `unknown` lines.
 */
export type DirectiveField =
  | "user-agent"
  | "allow"
  | "disallow"
  | "sitemap"
  | "crawl-delay"
  | "host"
  | "comment"
  | "blank"
  | "unknown";

/** A single parsed source line, preserving its raw form and position. */
export interface Directive {
  readonly field: DirectiveField;
  /** The value after the colon, trimmed (empty for `blank`/`comment`). */
  readonly value: string;
  /** The original, untrimmed source line — enables faithful round-tripping. */
  readonly raw: string;
  /** 1-based line number in the source. */
  readonly line: number;
}

/** A path rule's effect. Distinct from {@link CrawlPolicy} (allow/block intent). */
export type CrawlRuleType = "allow" | "disallow";

/**
 * A single `Allow:`/`Disallow:` path rule. Wildcard metadata is precomputed by
 * the parser so consumers (tester, validator) need not re-scan the path.
 */
export interface CrawlRule {
  readonly type: CrawlRuleType;
  /** The path pattern, e.g. `/admin/`, `/*.pdf$`, or `` (empty = match all). */
  readonly path: string;
  /** True if the path contains a `*` wildcard. */
  readonly hasWildcard: boolean;
  /** True if the path ends with a `$` end-of-URL anchor. */
  readonly hasEndAnchor: boolean;
  readonly raw: string;
  readonly line: number;
}

/** A robots.txt user-agent token, e.g. `Googlebot` or `*`. */
export type UserAgentToken = string;

/** The user-agent token that matches all crawlers. */
export const WILDCARD_USER_AGENT: UserAgentToken = "*";

/**
 * A group: one or more `User-agent` lines followed by their rules. A group may
 * declare multiple user-agents (they share the rule set), per the spec.
 */
export interface RobotsGroup {
  /** User-agent tokens this group applies to (original casing preserved). */
  readonly userAgents: readonly UserAgentToken[];
  readonly rules: readonly CrawlRule[];
  /** `Crawl-delay` in seconds, if declared for this group. */
  readonly crawlDelay?: number;
  /** Source span covering the group (first user-agent line .. last rule line). */
  readonly lineRange: LineRange;
}

/** A `Sitemap:` declaration (file-level, not group-scoped). */
export interface Sitemap {
  readonly url: string;
  readonly line: number;
}

/**
 * The full structured robots.txt file. Produced by the parser (from text) and the
 * generator (from config); consumed by every other feature.
 *
 * `directives` is the lossless, ordered backbone — every source line, in order,
 * with line numbers. The other fields (`groups`, `sitemaps`, `host`,
 * `unknownDirectives`) are structured views/indexes over those same lines, so the
 * AST never discards information and round-trips:
 * `directives.map((d) => d.raw).join("\n") === source`.
 */
export interface RobotsFile {
  /**
   * Every source line as a {@link Directive}, in document order (including
   * `blank`, `comment`, and `unknown` lines). The fidelity record — duplicates and
   * ordering are fully preserved here.
   */
  readonly directives: readonly Directive[];
  /** Semantic grouping view (a `User-agent` run and its rules). */
  readonly groups: readonly RobotsGroup[];
  /** File-level `Sitemap:` declarations. */
  readonly sitemaps: readonly Sitemap[];
  /** First `Host:` directive value, if present (non-standard but seen in the wild). */
  readonly host?: string;
  /**
   * Index of lines that need attention: unsupported/vendor fields, malformed lines
   * (e.g. missing colon), and rules appearing before any `User-agent` (orphans).
   * The validator turns these into {@link ValidationIssue}s; the parser itself
   * emits no judgements (PRD §15, refinement B).
   */
  readonly unknownDirectives: readonly Directive[];
  /** Total number of source lines. */
  readonly lineCount: number;
  /** The original source text, when available (omitted until a generated file is serialized). */
  readonly source?: string;
}
