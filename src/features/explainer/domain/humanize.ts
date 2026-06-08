/**
 * Plain-language helpers: humanize user-agent tokens and paths, and handle
 * subject/verb agreement. Pure string utilities.
 */
import { WILDCARD_USER_AGENT } from "@/types";
import type { UserAgentToken } from "@/types";
import { CRAWLER_LABELS } from "./constants";

/** Friendly label for a single user-agent token. */
export function friendlyUserAgent(token: UserAgentToken): string {
  if (token.trim() === WILDCARD_USER_AGENT) return "all crawlers";
  return CRAWLER_LABELS[token.trim().toLowerCase()] ?? token.trim();
}

/** Join a list of friendly labels as "A", "A and B", or "A, B and C". */
function joinLabels(labels: readonly string[]): string {
  if (labels.length <= 1) return labels[0] ?? "";
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

/** A humanized subject for a group's user-agents, with plurality for agreement. */
export function humanizeUserAgents(userAgents: readonly UserAgentToken[]): {
  label: string;
  plural: boolean;
} {
  if (userAgents.some((ua) => ua.trim() === WILDCARD_USER_AGENT)) {
    return { label: "all crawlers", plural: true };
  }
  if (userAgents.length === 0) return { label: "this group", plural: false };
  return { label: joinLabels(userAgents.map(friendlyUserAgent)), plural: userAgents.length > 1 };
}

/** "is" / "are" for the given plurality. */
export function isAre(plural: boolean): string {
  return plural ? "are" : "is";
}

/** Describe a robots path in prose; empty path means "everything". */
export function describePath(path: string): string {
  if (path === "" ) return "all pages";
  if (path === "/") return "your entire site";
  return path;
}
