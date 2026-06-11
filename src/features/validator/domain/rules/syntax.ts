/**
 * Critical (error) rules — issues likely to cause crawler problems.
 *
 * These read the parser's fidelity surfaces (`unknownDirectives`, `directives`)
 * and the structured groups. They make judgements; the parser does not.
 */
import { parseCrawlDelay } from "@/parser";
import type { CrawlRule, ValidationIssue } from "@/types";
import { LEARN_MORE } from "../constants";
import type { Rule } from "../context";
import { isValidAbsoluteUrl, makeIssue } from "../helpers";

/** Lines with no colon — not a valid directive. */
export const missingColon: Rule = ({ file }) =>
  file.unknownDirectives
    .filter((d) => d.field === "unknown" && !d.raw.includes(":"))
    .map((d) =>
      makeIssue({
        severity: "error",
        code: "missing-colon",
        title: "Malformed line (missing colon)",
        message: `Line ${d.line} is not a valid directive — a directive needs a "field: value" form.`,
        line: d.line,
        fix: {
          description: "Remove this malformed line",
          edits: [{ line: d.line, replacement: "" }],
          safe: false,
        },
      }),
    );

/** Allow/Disallow/Crawl-delay appearing before any User-agent (orphans). */
export const directiveBeforeUserAgent: Rule = ({ file }) =>
  file.unknownDirectives
    .filter((d) => d.field === "allow" || d.field === "disallow" || d.field === "crawl-delay")
    .map((d) =>
      makeIssue({
        severity: "error",
        code: "directive-before-user-agent",
        title: "Rule before any User-agent",
        message: `"${d.raw.trim()}" (line ${d.line}) appears before any User-agent and will be ignored. Start a group with a User-agent line.`,
        line: d.line,
        fix: {
          description: "Remove the orphaned rule (it is currently ignored)",
          edits: [{ line: d.line, replacement: "" }],
          safe: false,
        },
      }),
    );

/** `User-agent:` with an empty value. */
export const emptyUserAgent: Rule = ({ file }) =>
  file.directives
    .filter((d) => d.field === "user-agent" && d.value === "")
    .map((d) =>
      makeIssue({
        severity: "error",
        code: "empty-user-agent",
        title: "Empty User-agent",
        message: `The User-agent on line ${d.line} has no value. Specify a crawler token or "*".`,
        line: d.line,
      }),
    );

/** `Crawl-delay` with a non-numeric or negative value. */
export const invalidCrawlDelay: Rule = ({ file }) =>
  file.directives
    .filter((d) => d.field === "crawl-delay" && parseCrawlDelay(d.value) === null)
    .map((d) =>
      makeIssue({
        severity: "error",
        code: "invalid-crawl-delay",
        title: "Invalid Crawl-delay",
        message: `"${d.value}" (line ${d.line}) is not a valid Crawl-delay. Use a non-negative number of seconds.`,
        line: d.line,
        fix: {
          description: "Remove the invalid Crawl-delay (it has no effect)",
          edits: [{ line: d.line, replacement: "" }],
          safe: true,
        },
      }),
    );

/** A `Sitemap:` whose value is not a valid absolute http(s) URL. */
export const invalidSitemapUrl: Rule = ({ file }) =>
  file.sitemaps
    .filter((s) => !isValidAbsoluteUrl(s.url))
    .map((s) =>
      makeIssue({
        severity: "error",
        code: "invalid-sitemap-url",
        title: "Malformed Sitemap URL",
        message: `Sitemap on line ${s.line} ("${s.url || "empty"}") must be a full absolute URL, e.g. https://example.com/sitemap.xml.`,
        line: s.line,
        fix: {
          description: "Remove the malformed Sitemap line",
          edits: [{ line: s.line, replacement: "" }],
          safe: false,
        },
        ...(LEARN_MORE["invalid-sitemap-url"]
          ? { learnMoreUrl: LEARN_MORE["invalid-sitemap-url"] }
          : {}),
      }),
    );

/** The same path is both Allowed and Disallowed within one group. */
export const conflictingRules: Rule = ({ file }) => {
  const issues: ValidationIssue[] = [];
  for (const group of file.groups) {
    const byPath = new Map<string, { allow?: CrawlRule; disallow?: CrawlRule }>();
    for (const rule of group.rules) {
      const entry = byPath.get(rule.path) ?? {};
      entry[rule.type] = rule;
      byPath.set(rule.path, entry);
    }
    for (const [path, { allow, disallow }] of byPath) {
      if (allow && disallow) {
        const start = Math.min(allow.line, disallow.line);
        const end = Math.max(allow.line, disallow.line);
        issues.push(
          makeIssue({
            severity: "error",
            code: "conflicting-rules",
            title: "Conflicting Allow/Disallow",
            message: `"${path}" is both Allowed (line ${allow.line}) and Disallowed (line ${disallow.line}) for ${group.userAgents.join(", ")}. Crawlers may resolve this unpredictably.`,
            line: start,
            lineRange: { start, end },
            fix: {
              description: "Remove the conflicting Disallow (keep Allow)",
              edits: [{ line: disallow.line, replacement: "" }],
              safe: false,
            },
          }),
        );
      }
    }
  }
  return issues;
};
