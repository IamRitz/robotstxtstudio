/**
 * URL Tester model.
 *
 * The Tester evaluates a URL against a {@link RobotsFile} for a given user-agent
 * and returns an explainable {@link UrlTestResult}: a verdict plus the matched
 * rule and a step-by-step trace (Screen 4). The Analyzer may reuse this for spot
 * checks.
 */
import type { CrawlRule, UserAgentToken } from "./robots";

/** The verdict for a URL × user-agent evaluation. */
export type CrawlDecision = "allowed" | "blocked";

/** Status of a single trace step, used for the step's icon/color (Screen 4). */
export type TestTraceStatus = "pass" | "info" | "allowed" | "blocked";

/** One step in the human-readable evaluation trace. */
export interface TestTraceStep {
  /** 1-based step number. */
  readonly step: number;
  /** Short label, e.g. "Match User-Agent". */
  readonly label: string;
  readonly status: TestTraceStatus;
  /** Plain-English detail of what happened at this step. */
  readonly detail: string;
}

/** The result of testing one URL against the rules for one user-agent. */
export interface UrlTestResult {
  /** The tested URL or path. */
  readonly url: string;
  /** The user-agent the test was run as. */
  readonly userAgent: UserAgentToken;
  readonly decision: CrawlDecision;
  /**
   * The rule that determined the verdict, if any. Absent means no rule matched
   * (default-allow).
   */
  readonly matchedRule?: CrawlRule;
  /** The user-agent group selected for evaluation (specific name or `*`). */
  readonly matchedUserAgent?: UserAgentToken;
  /** Plain-English summary of why (precedence reasoning). */
  readonly reason: string;
  /** Ordered evaluation trace (Fetch → Match UA → Evaluate Paths → verdict). */
  readonly trace: readonly TestTraceStep[];
}
