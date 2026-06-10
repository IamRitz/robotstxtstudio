/**
 * Security rules. robots.txt is a *public* file with no access control — so using it
 * to "hide" sensitive paths backfires: it advertises those paths to anyone who reads
 * it (including attackers and scrapers) without protecting them at all.
 *
 * This rule drives the Validator's Security score. It is advisory (info): we never
 * auto-remove a deliberate `Disallow`, but we flag the disclosure and explain the
 * real fix (authentication / `noindex`, not robots.txt).
 */
import { SENSITIVE_PATH_PATTERNS } from "../constants";
import type { Rule } from "../context";
import { makeIssue } from "../helpers";

/** `Disallow` of an admin/secret-looking path — public information disclosure. */
export const sensitivePathDisclosure: Rule = ({ file }) => {
  const seen = new Set<string>();
  const issues = [];
  for (const group of file.groups) {
    for (const rule of group.rules) {
      if (rule.type !== "disallow" || rule.path === "" || rule.path === "/") continue;
      const lower = rule.path.toLowerCase();
      const match = SENSITIVE_PATH_PATTERNS.find((p) => lower.includes(p));
      if (!match || seen.has(rule.path)) continue;
      seen.add(rule.path);
      issues.push(
        makeIssue({
          severity: "info",
          code: "sensitive-path-disclosure",
          title: "Sensitive path disclosed in robots.txt",
          message: `"${rule.path}" (line ${rule.line}) looks sensitive. robots.txt is public, so disallowing it advertises the path without protecting it. Use authentication or noindex instead — don't rely on robots.txt for security.`,
          line: rule.line,
        }),
      );
    }
  }
  return issues;
};
