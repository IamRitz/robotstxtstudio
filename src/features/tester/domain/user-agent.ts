/**
 * User-agent group selection (Google-style).
 *
 * A group's token matches the crawler when the crawler name starts with the token
 * (case-insensitive); specificity is the token length, with `*` scoring 0. The
 * highest-specificity match wins, and every group sharing that specificity is
 * merged — handling repeated user-agents and the parser's split groups.
 */
import { WILDCARD_USER_AGENT } from "@/types";
import type { CrawlRule, RobotsFile, UserAgentToken } from "@/types";

/** Where the selected rules came from. */
export type SelectionSource = "specific" | "default" | "none";

export interface RuleSelection {
  readonly source: SelectionSource;
  /** Merged rules from every winning group. */
  readonly rules: readonly CrawlRule[];
  /** The winning user-agent token (original casing), if any matched. */
  readonly matchedUserAgent?: UserAgentToken;
}

/** Match specificity of a token for a crawler: token length, 0 for `*`, -1 if no match. */
function tokenSpecificity(token: UserAgentToken, crawler: string): number {
  const t = token.trim().toLowerCase();
  if (t === "") return -1;
  if (t === WILDCARD_USER_AGENT) return 0;
  return crawler.trim().toLowerCase().startsWith(t) ? t.length : -1;
}

/** A group's specificity for a crawler is its best-matching token. */
function groupSpecificity(
  userAgents: readonly UserAgentToken[],
  crawler: string,
): { spec: number; token?: UserAgentToken } {
  let spec = -1;
  let token: UserAgentToken | undefined;
  for (const ua of userAgents) {
    const s = tokenSpecificity(ua, crawler);
    if (s > spec) {
      spec = s;
      token = ua;
    }
  }
  return token !== undefined ? { spec, token } : { spec };
}

/** Select and merge the rules that apply to `crawler`. */
export function selectRules(file: RobotsFile, crawler: string): RuleSelection {
  let best = -1;
  for (const group of file.groups) {
    best = Math.max(best, groupSpecificity(group.userAgents, crawler).spec);
  }

  if (best < 0) return { source: "none", rules: [] };

  const rules: CrawlRule[] = [];
  let matchedUserAgent: UserAgentToken | undefined;
  for (const group of file.groups) {
    const { spec, token } = groupSpecificity(group.userAgents, crawler);
    if (spec === best) {
      rules.push(...group.rules);
      if (matchedUserAgent === undefined) matchedUserAgent = token;
    }
  }

  return {
    source: best === 0 ? "default" : "specific",
    rules,
    ...(matchedUserAgent !== undefined ? { matchedUserAgent } : {}),
  };
}
