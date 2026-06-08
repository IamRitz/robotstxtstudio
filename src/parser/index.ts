/**
 * Shared robots.txt parser — the single source of truth consumed by the
 * validator, tester, explainer, analyzer, and (future) compare features.
 *
 * Pure functions only: NO React, NO `next/*`, NO `zod`. Text in → canonical
 * {@link RobotsFile} AST out. Never throws; tolerant of real-world, malformed files.
 *
 * @example
 * import { parseRobots } from "@/parser";
 * const file = parseRobots("User-agent: *\nDisallow: /admin/");
 */
export { parseRobots } from "./parser";
export { tokenize, type Token } from "./tokenizer";
export { analyzePath, normalizeFieldName, parseCrawlDelay, KNOWN_FIELDS } from "./fields";
