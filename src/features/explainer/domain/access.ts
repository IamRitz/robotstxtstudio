/**
 * Classify a set of rules into a plain-English access posture.
 *
 * Lightweight, deterministic, and good enough for explanation prose. (Precise
 * per-URL evaluation is the URL Tester's job; this summarizes a whole group.)
 */
import type { CrawlerAccess } from "@/types";
import type { CrawlRule } from "@/types";

export interface AccessSummary {
  readonly access: CrawlerAccess;
  /** Disallowed paths (excluding the whole-site "/" and empty paths). */
  readonly blockedPaths: readonly string[];
  /** Allowed paths. */
  readonly allowedPaths: readonly string[];
  /** True when a `Disallow: /` blocks the whole site. */
  readonly blocksEntireSite: boolean;
}

/** Summarize how a group's rules affect access. */
export function classifyAccess(rules: readonly CrawlRule[]): AccessSummary {
  // An empty `Disallow:` means "allow everything" — ignore it as a block.
  const disallows = rules.filter((r) => r.type === "disallow" && r.path !== "");
  const allows = rules.filter((r) => r.type === "allow");
  const blocksEntireSite = disallows.some((r) => r.path === "/");
  const blockedPaths = disallows.filter((r) => r.path !== "/").map((r) => r.path);
  const allowedPaths = allows.map((r) => r.path);

  let access: CrawlerAccess;
  if (blocksEntireSite) {
    access = allows.length > 0 ? "partial" : "blocked";
  } else if (disallows.length > 0) {
    access = "partial";
  } else {
    access = "allowed";
  }

  return { access, blockedPaths, allowedPaths, blocksEntireSite };
}
