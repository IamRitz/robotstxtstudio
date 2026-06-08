/**
 * AI crawler recommendation rules (the product differentiator).
 *
 * Driven by the precomputed AI statuses on the context: surface crawlers that have
 * no explicit policy (missing entirely, or only inheriting the default group) so the
 * user makes a deliberate decision about AI access.
 */
import { LEARN_MORE } from "../constants";
import type { Rule } from "../context";
import { makeIssue } from "../helpers";

/** A major AI crawler with no policy at all (no explicit group, no default). */
export const missingAiCrawlerPolicy: Rule = ({ aiStatuses }) =>
  aiStatuses
    .filter((s) => s.status === "missing")
    .map(({ crawler }) =>
      makeIssue({
        severity: "info",
        code: "missing-ai-crawler-policy",
        title: `No policy for ${crawler.name}`,
        message: `${crawler.name} (${crawler.owner}) has no rule and there is no default group, so it is implicitly allowed. Add an explicit Allow or Disallow to control it.`,
        key: crawler.id,
        ...(LEARN_MORE["missing-ai-crawler-policy"]
          ? { learnMoreUrl: LEARN_MORE["missing-ai-crawler-policy"] }
          : {}),
      }),
    );

/** A major AI crawler that only inherits the wildcard group's rules. */
export const aiCrawlerInheritsDefault: Rule = ({ aiStatuses }) =>
  aiStatuses
    .filter((s) => s.status === "inherited")
    .map(({ crawler }) =>
      makeIssue({
        severity: "info",
        code: "ai-crawler-inherits-default",
        title: `${crawler.name} inherits the default rules`,
        message: `${crawler.name} (${crawler.owner}) has no explicit group and follows your "User-agent: *" rules. Add an explicit group if you want a different policy for it.`,
        key: crawler.id,
        ...(LEARN_MORE["ai-crawler-inherits-default"]
          ? { learnMoreUrl: LEARN_MORE["ai-crawler-inherits-default"] }
          : {}),
      }),
    );
