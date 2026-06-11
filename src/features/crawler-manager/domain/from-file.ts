/**
 * Seed a {@link PolicySet} from an existing robots.txt file (Phase 17D — the
 * shared-workspace import path). The inverse-ish of `toGeneratorConfig`:
 * reconstructs per-crawler INTENT from the file so the AI Manager / Generator
 * open with the working file's decisions already loaded.
 *
 * Faithful where the model can express it, honest where it can't:
 * - A crawler with an explicit group → `allow`/`block` from the Tester's verdict
 *   on `/` (the same judgement every other feature uses).
 * - No explicit group → `inherit` (the manager's "no opinion yet").
 * - Baseline disallow paths / sitemap / crawl-delay come from the `*` group and
 *   file-level declarations.
 * - Comments, non-catalog groups, and exotic rules are NOT represented — they
 *   survive in the workspace text until an explicit "Apply to working file"
 *   regenerates it (the apply flow previews exactly that diff).
 */
import { isAllowed } from "@/features/tester";
import { ALL_CRAWLERS } from "@/config/crawlers";
import { WILDCARD_USER_AGENT, type RobotsFile, type RobotsGroup } from "@/types";
import type { PermissionState, PolicySet } from "./types";

/** Does this group explicitly target the user-agent token? (case-insensitive) */
function targets(group: RobotsGroup, userAgent: string): boolean {
  const needle = userAgent.toLowerCase();
  return group.userAgents.some((ua) => ua.toLowerCase() === needle);
}

/** Build a PolicySet reflecting the file's current decisions. Pure. */
export function policySetFromFile(file: RobotsFile): PolicySet {
  const permissions: Record<string, PermissionState> = {};
  for (const crawler of ALL_CRAWLERS) {
    const explicit = file.groups.some((g) => targets(g, crawler.userAgent));
    if (explicit) {
      permissions[crawler.id] = isAllowed(file, "/", crawler.userAgent) ? "allow" : "block";
    }
    // No explicit group ⇒ inherit (absent from the map by convention).
  }

  const wildcard = file.groups.find((g) => targets(g, WILDCARD_USER_AGENT));
  const disallowPaths =
    wildcard?.rules
      .filter((r) => r.type === "disallow" && r.path !== "" && r.path !== "/")
      .map((r) => r.path) ?? [];

  return {
    permissions,
    disallowPaths: [...new Set(disallowPaths)],
    sitemapUrl: file.sitemaps[0]?.url,
    crawlDelay: wildcard?.crawlDelay,
  };
}
