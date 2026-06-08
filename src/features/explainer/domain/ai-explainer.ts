/**
 * Explain the major AI crawlers: purpose, current access, configuration source,
 * and a recommended action when the policy isn't explicit. Driven by the
 * Validator's AI status classification (reused, not reimplemented).
 */
import { WILDCARD_USER_AGENT } from "@/types";
import type {
  AiCrawlerExplanation,
  ConfigurationSource,
  CrawlerAccess,
  RobotsFile,
  RobotsGroup,
} from "@/types";
import type { AiCrawlerStatus } from "@/features/validator";
import { classifyAccess } from "./access";
import { AI_PURPOSES } from "./constants";
import { friendlyUserAgent } from "./humanize";

function targets(group: RobotsGroup, userAgent: string): boolean {
  const want = userAgent.trim().toLowerCase();
  return group.userAgents.some((ua) => ua.trim().toLowerCase() === want);
}

function accessPhrase(access: CrawlerAccess): string {
  return access === "blocked" ? "blocked" : access === "partial" ? "partially blocked" : "allowed";
}

function statusText(label: string, source: ConfigurationSource, access: CrawlerAccess): string {
  if (source === "explicit") {
    if (access === "blocked") return `${label} is blocked from your entire site.`;
    if (access === "partial") return `${label} is allowed, but blocked from some sections of your site.`;
    return `${label} is explicitly allowed to access your site.`;
  }
  if (source === "inherited-default") {
    return `${label} has no rule of its own, so it follows your default settings — it is currently ${accessPhrase(access)}.`;
  }
  return `${label} isn't mentioned and there's no default rule, so it can freely access your entire site.`;
}

/** Build per-crawler explanations for every tracked AI crawler. */
export function explainAiCrawlers(
  file: RobotsFile,
  statuses: readonly AiCrawlerStatus[],
): AiCrawlerExplanation[] {
  return statuses.map(({ crawler, status }) => {
    const label = friendlyUserAgent(crawler.userAgent);

    let source: ConfigurationSource;
    let access: CrawlerAccess;
    if (status === "explicit") {
      source = "explicit";
      const group = file.groups.find((g) => targets(g, crawler.userAgent));
      access = group ? classifyAccess(group.rules).access : "allowed";
    } else if (status === "inherited") {
      source = "inherited-default";
      const group = file.groups.find((g) => targets(g, WILDCARD_USER_AGENT));
      access = group ? classifyAccess(group.rules).access : "allowed";
    } else {
      source = "none";
      access = "allowed";
    }

    const base: AiCrawlerExplanation = {
      id: crawler.id,
      name: crawler.name,
      owner: crawler.owner,
      purpose: AI_PURPOSES[crawler.id] ?? `is an AI crawler operated by ${crawler.owner}`,
      access,
      configurationSource: source,
      statusText: statusText(label, source, access),
    };

    return source === "explicit"
      ? base
      : {
          ...base,
          recommendation: `Add an explicit Allow or Disallow for ${crawler.name} to control its access deliberately.`,
        };
  });
}
