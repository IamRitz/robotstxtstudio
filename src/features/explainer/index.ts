/**
 * Explainer feature — turns a {@link RobotsFile} (and optionally a
 * {@link ValidationResult} and AI crawler statuses) into a deterministic,
 * plain-English {@link ExplanationResult}. No LLM, no UI dependencies.
 *
 * Reused by the Explainer screen, Validator recommendations, the Analyzer
 * narrative, the AI Manager, and SEO/educational content. Import via this barrel.
 *
 * @example
 * import { parseRobots } from "@/parser";
 * import { validateRobots } from "@/features/validator";
 * import { explainRobots } from "@/features/explainer";
 * const file = parseRobots(text);
 * const explanation = explainRobots(file, { validation: validateRobots(file) });
 */
export { explainRobots, type ExplainOptions } from "./domain/explain";
export { explainGroup } from "./domain/group-explainer";
export { explainAiCrawlers } from "./domain/ai-explainer";
export { classifyAccess, type AccessSummary } from "./domain/access";
