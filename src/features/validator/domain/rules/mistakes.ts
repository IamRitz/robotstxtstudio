/**
 * Additional mistake detectors (Phase 15C.1) — richer findings that benefit BOTH the
 * Validator and the Analyzer (they share this rule set).
 *
 * Every rule here is a pure function over the parser's EXISTING surfaces
 * (`groups`/`rules`, `unknownDirectives`) — no tokenizer/AST changes. Where a fix is
 * deterministic and intent-preserving it is `safe`; where it would change access or
 * guess intent it is offered as a manual "review" fix only.
 */
import { LEARN_MORE } from "../constants";
import type { Rule } from "../context";
import { makeIssue, normalizeUa } from "../helpers";
import type { CrawlRule, ValidationIssue } from "@/types";

/** "Allow" / "Disallow" for rebuilding a fixed line. */
const directiveWord = (rule: CrawlRule): string => (rule.type === "allow" ? "Allow" : "Disallow");

/** Path wrapped in matching single/double quotes — crawlers match the quotes literally. */
export const quotedDirective: Rule = ({ file }) => {
  const issues: ValidationIssue[] = [];
  for (const group of file.groups) {
    for (const rule of group.rules) {
      if (!/^(["']).*\1$/.test(rule.path)) continue;
      const unquoted = rule.path.slice(1, -1);
      issues.push(
        makeIssue({
          severity: "error",
          code: "quoted-directive",
          title: "Quoted path",
          message: `${directiveWord(rule)} on line ${rule.line} wraps its path in quotes (${rule.path}). robots.txt has no quoting — crawlers treat the quotes as literal characters, so the rule won't match.`,
          line: rule.line,
          fix: {
            description: "Remove the surrounding quotes",
            edits: [{ line: rule.line, replacement: `${directiveWord(rule)}: ${unquoted}` }],
            safe: true,
          },
        }),
      );
    }
  }
  return issues;
};

/** A non-empty path that doesn't start with `/` or `*` — paths should be rooted. */
export const pathMissingLeadingSlash: Rule = ({ file }) => {
  const issues: ValidationIssue[] = [];
  for (const group of file.groups) {
    for (const rule of group.rules) {
      const p = rule.path;
      if (p === "" || p.startsWith("/") || p.startsWith("*") || /^["']/.test(p)) continue;
      issues.push(
        makeIssue({
          severity: "warning",
          code: "path-missing-leading-slash",
          title: "Path missing leading slash",
          message: `"${p}" (line ${rule.line}) does not start with "/". Paths are matched from the site root, so this likely won't match what you intend.`,
          line: rule.line,
          fix: {
            description: `Add a leading slash → /${p}`,
            edits: [{ line: rule.line, replacement: `${directiveWord(rule)}: /${p}` }],
            safe: true,
          },
        }),
      );
    }
  }
  return issues;
};

/** Redundant consecutive wildcards (`**`) — a single `*` already matches any run. */
export const redundantWildcard: Rule = ({ file }) => {
  const issues: ValidationIssue[] = [];
  for (const group of file.groups) {
    for (const rule of group.rules) {
      if (!rule.path.includes("**")) continue;
      const collapsed = rule.path.replace(/\*{2,}/g, "*");
      issues.push(
        makeIssue({
          severity: "warning",
          code: "redundant-wildcard",
          title: "Redundant wildcard",
          message: `"${rule.path}" (line ${rule.line}) uses consecutive wildcards. A single "*" already matches any sequence — "${collapsed}" is equivalent and clearer.`,
          line: rule.line,
          fix: {
            description: `Collapse to ${collapsed}`,
            edits: [{ line: rule.line, replacement: `${directiveWord(rule)}: ${collapsed}` }],
            safe: true,
          },
        }),
      );
    }
  }
  return issues;
};

/** The same user-agent token declared in more than one group (ambiguous/duplicated). */
export const duplicateUserAgentGroup: Rule = ({ file }) => {
  const firstSeen = new Map<string, number>();
  const issues: ValidationIssue[] = [];
  for (const group of file.groups) {
    for (const ua of group.userAgents) {
      const key = normalizeUa(ua);
      const prev = firstSeen.get(key);
      if (prev === undefined) {
        firstSeen.set(key, group.lineRange.start);
      } else {
        issues.push(
          makeIssue({
            severity: "warning",
            code: "duplicate-user-agent-group",
            title: `Duplicate group for ${ua}`,
            message: `"${ua}" is declared in more than one group (lines ${prev} and ${group.lineRange.start}). Most crawlers apply only one group, so the rules may not combine the way you expect — merge them into a single group.`,
            line: group.lineRange.start,
            key: `${key}:${group.lineRange.start}`,
          }),
        );
      }
    }
  }
  return issues;
};

/** Disallowing CSS/JS or core asset dirs — blocks rendering, hurting how Google sees the page. */
export const blocksRenderingAssets: Rule = ({ file }) => {
  const issues: ValidationIssue[] = [];
  for (const group of file.groups) {
    for (const rule of group.rules) {
      if (rule.type !== "disallow") continue;
      const p = rule.path.toLowerCase();
      const isAsset =
        // Allow an end anchor: `/*.css$` is the most common way assets get blocked.
        /\.(css|js)\$?$/.test(p) ||
        p.includes("/wp-includes") ||
        p === "/assets/" ||
        p === "/static/";
      if (!isAsset) continue;
      issues.push(
        makeIssue({
          severity: "warning",
          code: "blocks-rendering-assets",
          title: "Blocks rendering assets",
          message: `Line ${rule.line} disallows "${rule.path}". Blocking CSS/JS or asset folders stops Google from rendering the page as users see it, which can hurt indexing. Allow these resources unless you have a specific reason.`,
          line: rule.line,
          ...(LEARN_MORE["blocks-rendering-assets"]
            ? { learnMoreUrl: LEARN_MORE["blocks-rendering-assets"] }
            : {}),
        }),
      );
    }
  }
  return issues;
};

/** `Noindex:` in robots.txt — never officially supported and ignored by Google since 2019. */
export const noindexUnsupported: Rule = ({ file }) =>
  file.unknownDirectives
    .filter((d) => /^\s*noindex\s*:/i.test(d.raw))
    .map((d) =>
      makeIssue({
        severity: "warning",
        code: "noindex-unsupported",
        title: "Noindex in robots.txt is ignored",
        message: `"${d.raw.trim()}" (line ${d.line}) has no effect — Google dropped support for Noindex in robots.txt in 2019. To keep a page out of the index, use a meta robots noindex tag or the X-Robots-Tag header instead.`,
        line: d.line,
        fix: {
          description: "Remove the ignored Noindex line (then use meta noindex / X-Robots-Tag)",
          edits: [{ line: d.line, replacement: "" }],
          safe: false,
        },
        ...(LEARN_MORE["noindex-unsupported"]
          ? { learnMoreUrl: LEARN_MORE["noindex-unsupported"] }
          : {}),
      }),
    );
