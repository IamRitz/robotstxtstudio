/**
 * Core access evaluation — the source of truth for "can crawler X access URL Y?".
 *
 * Pure and trace-free, so the Analyzer, AI Manager, Generator previews, and future
 * Monitoring/Compare can reuse it cheaply. The Tester wraps this with a trace.
 */
import type { CrawlDecision, CrawlRule, RobotsFile, UserAgentToken } from "@/types";
import { matchesPath } from "./pattern";
import { normalizePath } from "./url";
import { selectRules, type SelectionSource } from "./user-agent";

export interface AccessEvaluation {
  readonly decision: CrawlDecision;
  /** The rule that decided the verdict (absent ⇒ default-allow). */
  readonly matchedRule?: CrawlRule;
  /** The winning user-agent token. */
  readonly matchedUserAgent?: UserAgentToken;
  /** How the user-agent group was chosen. */
  readonly source: SelectionSource;
  /** The normalized path that was tested. */
  readonly path: string;
  /** All rules that matched the path (for tracing). */
  readonly candidates: readonly CrawlRule[];
}

/**
 * Pick the winning rule: longest path pattern wins; on a length tie, Allow beats
 * Disallow (Google's "least restrictive"). Returns `undefined` when none match.
 */
function pickWinner(candidates: readonly CrawlRule[]): CrawlRule | undefined {
  let winner: CrawlRule | undefined;
  for (const rule of candidates) {
    if (winner === undefined || rule.path.length > winner.path.length) {
      winner = rule;
    } else if (rule.path.length === winner.path.length && rule.type === "allow") {
      winner = rule; // Allow wins ties.
    }
  }
  return winner;
}

/** Evaluate whether `crawler` may access `url` per `file`. */
export function evaluateAccess(
  file: RobotsFile,
  url: string,
  crawler: string,
): AccessEvaluation {
  const path = normalizePath(url);
  const selection = selectRules(file, crawler);
  const candidates = selection.rules.filter((r) => r.path !== "" && matchesPath(r.path, path));
  const winner = pickWinner(candidates);

  const decision: CrawlDecision =
    winner === undefined ? "allowed" : winner.type === "allow" ? "allowed" : "blocked";

  return {
    decision,
    ...(winner ? { matchedRule: winner } : {}),
    ...(selection.matchedUserAgent !== undefined
      ? { matchedUserAgent: selection.matchedUserAgent }
      : {}),
    source: selection.source,
    path,
    candidates,
  };
}

/** Convenience boolean: is `crawler` allowed to access `url`? */
export function isAllowed(file: RobotsFile, url: string, crawler: string): boolean {
  return evaluateAccess(file, url, crawler).decision === "allowed";
}
