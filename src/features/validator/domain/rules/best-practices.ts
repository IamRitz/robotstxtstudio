/**
 * Warning rules (valid but potentially problematic) and structural
 * recommendation rules (best-practice guidance, info severity).
 */
import type { ValidationIssue } from "@/types";
import {
  BROAD_DISALLOW_SENSITIVE_UAS,
  CRAWL_DELAY_IGNORERS,
  EXCESSIVE_RULES_PER_GROUP,
  LEARN_MORE,
} from "../constants";
import type { Rule } from "../context";
import {
  crawlDelayDirectiveLine,
  groupTargets,
  hasWildcardGroup,
  isHttpsUrl,
  makeIssue,
  onlyWildcardGroups,
} from "../helpers";

// ── Warnings ────────────────────────────────────────────────────────────────

/** Identical (type + path) rule repeated within a group. */
export const duplicateRules: Rule = ({ file }) => {
  const issues: ValidationIssue[] = [];
  for (const group of file.groups) {
    const seen = new Set<string>();
    for (const rule of group.rules) {
      const key = `${rule.type} ${rule.path}`;
      if (seen.has(key)) {
        issues.push(
          makeIssue({
            severity: "warning",
            code: "duplicate-rule",
            title: "Duplicate rule",
            message: `"${rule.raw.trim()}" (line ${rule.line}) duplicates an earlier rule in the same group and can be removed.`,
            line: rule.line,
            fix: { description: "Remove the duplicate rule", edits: [{ line: rule.line, replacement: "" }], safe: true },
          }),
        );
      }
      seen.add(key);
    }
  }
  return issues;
};

/** No `Sitemap:` declared anywhere. */
export const missingSitemap: Rule = ({ file }) =>
  file.sitemaps.length === 0
    ? [
        makeIssue({
          severity: "warning",
          code: "missing-sitemap",
          title: "No sitemap declared",
          message:
            "No Sitemap directive found. Declaring a sitemap helps crawlers discover all your indexable pages.",
        }),
      ]
    : [];

/**
 * `Disallow: /` for the wildcard group or a search engine blocks an entire site
 * (de-indexing risk). Blocking a named AI crawler this way is intentional, so it is
 * not flagged.
 */
export const overlyBroadDisallow: Rule = ({ file }) => {
  const issues: ValidationIssue[] = [];
  for (const group of file.groups) {
    const sensitive = BROAD_DISALLOW_SENSITIVE_UAS.some((ua) => groupTargets(group, ua));
    if (!sensitive) continue;
    for (const rule of group.rules) {
      if (rule.type === "disallow" && rule.path === "/") {
        issues.push(
          makeIssue({
            severity: "warning",
            code: "overly-broad-disallow",
            title: "Disallow: / blocks everything",
            message: `Line ${rule.line} blocks the entire site for ${group.userAgents.join(", ")}. Confirm this is intentional — it can de-index your site.`,
            line: rule.line,
            fix: {
              description: "Remove Disallow: / (stop blocking the whole site)",
              edits: [{ line: rule.line, replacement: "" }],
              safe: false,
            },
          }),
        );
      }
    }
  }
  return issues;
};

/** A single group with an unusually large number of rules. */
export const excessiveRules: Rule = ({ file }) =>
  file.groups
    .filter((group) => group.rules.length > EXCESSIVE_RULES_PER_GROUP)
    .map((group) =>
      makeIssue({
        severity: "warning",
        code: "excessive-rules",
        title: "Excessive rule count",
        message: `The group for ${group.userAgents.join(", ")} has ${group.rules.length} rules (> ${EXCESSIVE_RULES_PER_GROUP}). Large rule sets are hard to maintain and may hit crawler limits.`,
        line: group.lineRange.start,
      }),
    );

/** Unsupported / vendor-specific directives (kept by the parser as unknown). */
export const unsupportedDirective: Rule = ({ file }) =>
  file.unknownDirectives
    .filter((d) => d.field === "unknown" && d.raw.includes(":"))
    .map((d) =>
      makeIssue({
        severity: "warning",
        code: "unsupported-directive",
        title: "Unsupported directive",
        message: `"${d.raw.trim()}" (line ${d.line}) is not a standard robots.txt directive and most crawlers will ignore it.`,
        line: d.line,
        fix: {
          description: "Remove the unsupported directive",
          edits: [{ line: d.line, replacement: "" }],
          safe: true,
        },
      }),
    );

/** `Crawl-delay: 0` has no effect. */
export const crawlDelayZero: Rule = ({ file }) =>
  file.groups
    .filter((group) => group.crawlDelay === 0)
    .map((group) => {
      const delayLine = crawlDelayDirectiveLine(file, group);
      return makeIssue({
        severity: "warning",
        code: "crawl-delay-zero",
        title: "Crawl-delay of 0",
        message: `The group for ${group.userAgents.join(", ")} sets Crawl-delay: 0, which has no effect. Remove it or set a positive value.`,
        line: delayLine ?? group.lineRange.start,
        ...(delayLine
          ? {
              fix: {
                description: "Remove the no-op Crawl-delay: 0",
                edits: [{ line: delayLine, replacement: "" }],
                safe: true,
              },
            }
          : {}),
      });
    });

// ── Recommendations (info) ────────────────────────────────────────────────────

/** No comments anywhere — documentation aids future maintainers. */
export const noComments: Rule = ({ file }) =>
  file.directives.length > 0 && !file.directives.some((d) => d.field === "comment")
    ? [
        makeIssue({
          severity: "info",
          code: "no-comments",
          title: "No comments or documentation",
          message:
            "Adding comments (lines starting with #) explains your intent and helps future maintainers.",
        }),
      ]
    : [];

/** No default (`User-agent: *`) group. */
export const noDefaultGroup: Rule = ({ file }) =>
  !hasWildcardGroup(file)
    ? [
        makeIssue({
          severity: "info",
          code: "no-default-group",
          title: "No default group",
          message:
            'There is no "User-agent: *" group. Add one to set a baseline policy for crawlers you do not list explicitly.',
        }),
      ]
    : [];

/** Only a wildcard group — no crawler-specific tuning. */
export const noCrawlerSpecificGroups: Rule = ({ file }) =>
  onlyWildcardGroups(file)
    ? [
        makeIssue({
          severity: "info",
          code: "no-crawler-specific-groups",
          title: "No crawler-specific groups",
          message:
            "Only a wildcard group is defined. Consider explicit groups for important crawlers (e.g. Googlebot, GPTBot) to control them precisely.",
        }),
      ]
    : [];

/** A sitemap declared over http instead of https. */
export const sitemapNotHttps: Rule = ({ file }) =>
  file.sitemaps
    .filter((s) => !isHttpsUrl(s.url) && /^http:\/\//i.test(s.url))
    .map((s) =>
      makeIssue({
        severity: "info",
        code: "sitemap-not-https",
        title: "Sitemap uses HTTP",
        message: `Sitemap on line ${s.line} uses http://. Prefer https:// for your sitemap URL.`,
        line: s.line,
        fix: {
          description: "Upgrade the Sitemap URL to https://",
          edits: [{ line: s.line, replacement: `Sitemap: ${s.url.replace(/^http:\/\//i, "https://")}` }],
          safe: true,
        },
      }),
    );

/** Crawl-delay declared for a crawler known to ignore it (e.g. Googlebot). */
export const crawlDelayIgnoredByGoogle: Rule = ({ file }) =>
  file.groups
    .filter(
      (group) =>
        group.crawlDelay !== undefined &&
        group.crawlDelay > 0 &&
        CRAWL_DELAY_IGNORERS.some((ua) => groupTargets(group, ua)),
    )
    .map((group) => {
      const delayLine = crawlDelayDirectiveLine(file, group);
      return makeIssue({
        severity: "info",
        code: "crawl-delay-ignored-by-google",
        title: "Crawl-delay ignored by Google",
        message: `Googlebot ignores Crawl-delay (set in the group for ${group.userAgents.join(", ")}). Use Search Console's crawl-rate settings instead.`,
        line: delayLine ?? group.lineRange.start,
        ...(delayLine
          ? {
              fix: {
                description: "Remove the Crawl-delay (Googlebot ignores it)",
                edits: [{ line: delayLine, replacement: "" }],
                safe: false,
              },
            }
          : {}),
        ...(LEARN_MORE["crawl-delay-ignored-by-google"]
          ? { learnMoreUrl: LEARN_MORE["crawl-delay-ignored-by-google"] }
          : {}),
      });
    });
