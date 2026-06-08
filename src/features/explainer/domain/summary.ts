/**
 * Build the top-level one-paragraph summary of a robots.txt file.
 */
import { WILDCARD_USER_AGENT } from "@/types";
import type {
  AiCrawlerExplanation,
  GroupExplanation,
  RobotsFile,
  RobotsGroup,
  ValidationResult,
} from "@/types";
import { classifyAccess } from "./access";

const isWildcardGroup = (group: RobotsGroup): boolean =>
  group.userAgents.length > 0 &&
  group.userAgents.every((ua) => ua.trim() === WILDCARD_USER_AGENT);

function defaultBehaviorSentence(file: RobotsFile): string {
  const wildcard = file.groups.find((g) => g.userAgents.some((ua) => ua.trim() === WILDCARD_USER_AGENT));
  if (!wildcard) {
    return file.groups.length === 0
      ? "No crawler rules are defined, so every crawler is allowed to access your entire site."
      : "There is no default rule, so any crawler without its own section can access your entire site.";
  }
  const { access } = classifyAccess(wildcard.rules);
  if (access === "blocked") return "By default, crawlers are blocked from your entire site.";
  if (access === "partial") return "By default, crawlers are allowed, with some sections blocked.";
  return "By default, crawlers are allowed to access your entire site.";
}

/** Compose the summary paragraph. */
export function buildSummary(
  file: RobotsFile,
  _groups: readonly GroupExplanation[],
  aiCrawlers: readonly AiCrawlerExplanation[],
  validation?: ValidationResult,
): string {
  const sentences: string[] = [defaultBehaviorSentence(file)];

  const specificCount = file.groups.filter((g) => !isWildcardGroup(g)).length;
  if (specificCount > 0) {
    const subject = specificCount === 1 ? "crawler has its" : "crawlers have their";
    sentences.push(`${specificCount} ${subject} own specific rules.`);
  }

  const blockedAi = aiCrawlers.filter((c) => c.access === "blocked").length;
  sentences.push(`${blockedAi} of ${aiCrawlers.length} major AI crawlers are blocked.`);

  sentences.push(
    file.sitemaps.length > 0 ? "A sitemap is declared." : "No sitemap is declared.",
  );

  if (validation) {
    const { health, counts } = validation;
    sentences.push(
      `It scores ${health.value}/100 (${health.band}): ${counts.error} error${counts.error === 1 ? "" : "s"}, ${counts.warning} warning${counts.warning === 1 ? "" : "s"} and ${counts.info} recommendation${counts.info === 1 ? "" : "s"}.`,
    );
  }

  return sentences.join(" ");
}
