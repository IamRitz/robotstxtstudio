/**
 * Explain a single robots.txt group in plain English: a one-line summary plus
 * per-rule bullets.
 */
import type { CrawlRule, GroupExplanation, RobotsGroup } from "@/types";
import { classifyAccess } from "./access";
import { describePath, humanizeUserAgents, isAre } from "./humanize";

/** Plain-English bullet for a single rule. */
function explainRule(rule: CrawlRule): string {
  if (rule.type === "disallow") {
    if (rule.path === "") return "An empty Disallow places no restrictions (everything is allowed).";
    if (rule.path === "/") return "Blocked from your entire site (/).";
    return `Blocked from ${describePath(rule.path)}.`;
  }
  if (rule.path === "/") return "Explicitly allowed to access your entire site (/).";
  return `Allowed to access ${describePath(rule.path)}.`;
}

/** Build the one-line summary for a group from its access posture. */
function summarize(group: RobotsGroup): { summary: string; access: GroupExplanation["access"] } {
  const { label, plural } = humanizeUserAgents(group.userAgents);
  const verb = isAre(plural);
  const { access, blockedPaths, allowedPaths, blocksEntireSite } = classifyAccess(group.rules);

  if (blocksEntireSite && allowedPaths.length === 0) {
    return { summary: `${label} ${verb} blocked from your entire site.`, access };
  }
  if (blocksEntireSite) {
    return {
      summary: `${label} ${verb} blocked from your site, except: ${allowedPaths.join(", ")}.`,
      access,
    };
  }
  if (blockedPaths.length > 0) {
    return {
      summary: `${label} ${verb} allowed, but blocked from: ${blockedPaths.join(", ")}.`,
      access,
    };
  }
  return { summary: `${label} ${verb} allowed to access your entire site.`, access };
}

/** Explain a group: subject, summary, and per-rule bullets. */
export function explainGroup(group: RobotsGroup): GroupExplanation {
  const { summary, access } = summarize(group);
  const bullets = group.rules.map(explainRule);
  if (group.crawlDelay !== undefined) {
    bullets.push(
      group.crawlDelay === 0
        ? "A Crawl-delay of 0 is set, which has no effect."
        : `Asked to wait ${group.crawlDelay} second${group.crawlDelay === 1 ? "" : "s"} between requests.`,
    );
  }
  return { userAgents: group.userAgents, summary, bullets, access };
}
