/**
 * Pure helpers shared by the validation rules: an issue factory and small
 * predicates over the AST. No React/Next; `URL` is a web standard, not a framework.
 */
import { WILDCARD_USER_AGENT } from "@/types";
import type {
  LineRange,
  RobotsFile,
  RobotsGroup,
  Severity,
  SuggestedFix,
  ValidationCode,
  ValidationIssue,
} from "@/types";

interface IssueInput {
  readonly severity: Severity;
  readonly code: ValidationCode;
  readonly title: string;
  readonly message: string;
  readonly line?: number;
  readonly lineRange?: LineRange;
  readonly fix?: SuggestedFix;
  readonly learnMoreUrl?: string;
  /** Disambiguator for line-less issues that can repeat (e.g. per crawler). */
  readonly key?: string;
}

/** Build a {@link ValidationIssue} with a stable id derived from code + line/key. */
export function makeIssue(input: IssueInput): ValidationIssue {
  const { key, ...rest } = input;
  const suffix = rest.line !== undefined ? `:${rest.line}` : key ? `:${key}` : "";
  return { id: `${rest.code}${suffix}`, ...rest };
}

/** Case-insensitive user-agent comparison key. */
export function normalizeUa(userAgent: string): string {
  return userAgent.trim().toLowerCase();
}

/** Does this group target the given user-agent token (case-insensitive)? */
export function groupTargets(group: RobotsGroup, userAgent: string): boolean {
  const target = normalizeUa(userAgent);
  return group.userAgents.some((ua) => normalizeUa(ua) === target);
}

/** Is there a default (`User-agent: *`) group? */
export function hasWildcardGroup(file: RobotsFile): boolean {
  return file.groups.some((group) => groupTargets(group, WILDCARD_USER_AGENT));
}

/** True when every group targets only `*` (no crawler-specific groups). */
export function onlyWildcardGroups(file: RobotsFile): boolean {
  return (
    file.groups.length > 0 &&
    file.groups.every((group) => group.userAgents.every((ua) => ua.trim() === WILDCARD_USER_AGENT))
  );
}

/** A valid absolute http(s) URL. */
export function isValidAbsoluteUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** True when the URL parses and uses https. */
export function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
