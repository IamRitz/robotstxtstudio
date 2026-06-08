/**
 * Parser: tokens → canonical {@link RobotsFile} AST.
 *
 * Applies robots.txt grouping semantics (Google-style): consecutive `User-agent`
 * lines accumulate into one group; the first rule record ends the user-agent run,
 * so the next `User-agent` opens a new group. `Sitemap`/`Host` are file-level.
 * Builds the lossless `directives` backbone alongside the structured views and
 * preserves everything — duplicates, unknown directives, orphan rules.
 *
 * Emits NO judgements (no `ValidationIssue`s) — that is the validator's job.
 */
import type {
  CrawlRule,
  CrawlRuleType,
  Directive,
  RobotsFile,
  RobotsGroup,
  Sitemap,
} from "@/types";
import { analyzePath, parseCrawlDelay } from "./fields";
import { tokenize, type Token } from "./tokenizer";

/** Mutable accumulator for a group under construction. */
interface GroupBuilder {
  userAgents: string[];
  rules: CrawlRule[];
  crawlDelay?: number;
  startLine: number;
  endLine: number;
  /** True once a rule/crawl-delay record has closed the user-agent run. */
  hasRules: boolean;
}

/** Convert any token to its faithful {@link Directive} backbone entry. */
function toDirective(token: Token): Directive {
  switch (token.kind) {
    case "blank":
      return { field: "blank", value: "", raw: token.raw, line: token.line };
    case "comment":
      return { field: "comment", value: token.comment, raw: token.raw, line: token.line };
    case "field":
      return { field: token.field, value: token.value, raw: token.raw, line: token.line };
    case "unknown":
      return {
        field: "unknown",
        value: token.hasColon ? (token.value ?? "") : token.raw.trim(),
        raw: token.raw,
        line: token.line,
      };
  }
}

function makeRule(type: CrawlRuleType, value: string, raw: string, line: number): CrawlRule {
  const { hasWildcard, hasEndAnchor } = analyzePath(value);
  return { type, path: value, hasWildcard, hasEndAnchor, raw, line };
}

function finalizeGroup(builder: GroupBuilder): RobotsGroup {
  return {
    userAgents: builder.userAgents,
    rules: builder.rules,
    ...(builder.crawlDelay !== undefined ? { crawlDelay: builder.crawlDelay } : {}),
    lineRange: { start: builder.startLine, end: builder.endLine },
  };
}

/** Parse raw robots.txt text into the canonical {@link RobotsFile} AST. */
export function parseRobots(input: string): RobotsFile {
  const tokens = tokenize(input);

  const directives: Directive[] = [];
  const groups: RobotsGroup[] = [];
  const sitemaps: Sitemap[] = [];
  const unknownDirectives: Directive[] = [];
  let host: string | undefined;
  let current: GroupBuilder | null = null;

  const closeGroup = (): void => {
    if (current) {
      groups.push(finalizeGroup(current));
      current = null;
    }
  };

  for (const token of tokens) {
    const directive = toDirective(token);
    directives.push(directive);

    if (token.kind === "blank" || token.kind === "comment") {
      continue; // No grouping effect; already recorded in the backbone.
    }

    if (token.kind === "unknown") {
      unknownDirectives.push(directive);
      continue;
    }

    // token.kind === "field"
    switch (token.field) {
      case "user-agent": {
        if (!current || current.hasRules) {
          closeGroup();
          current = {
            userAgents: [],
            rules: [],
            startLine: token.line,
            endLine: token.line,
            hasRules: false,
          };
        }
        current.userAgents.push(token.value);
        current.endLine = Math.max(current.endLine, token.line);
        break;
      }
      case "allow":
      case "disallow": {
        if (!current) {
          unknownDirectives.push(directive); // Orphan rule before any User-agent.
          break;
        }
        current.rules.push(makeRule(token.field, token.value, token.raw, token.line));
        current.hasRules = true;
        current.endLine = Math.max(current.endLine, token.line);
        break;
      }
      case "crawl-delay": {
        if (!current) {
          unknownDirectives.push(directive);
          break;
        }
        const delay = parseCrawlDelay(token.value);
        if (delay !== null && current.crawlDelay === undefined) {
          current.crawlDelay = delay;
        }
        current.hasRules = true;
        current.endLine = Math.max(current.endLine, token.line);
        break;
      }
      case "sitemap": {
        sitemaps.push({ url: token.value, line: token.line }); // File-level.
        break;
      }
      case "host": {
        if (host === undefined) host = token.value; // File-level, first wins.
        break;
      }
      default:
        break;
    }
  }

  closeGroup();

  return {
    directives,
    groups,
    sitemaps,
    ...(host !== undefined ? { host } : {}),
    unknownDirectives,
    lineCount: tokens.length,
    source: input,
  };
}
