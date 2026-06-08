/**
 * Analyzer / Live Checker — fetch a real site's robots.txt and produce an
 * {@link AnalysisReport} (the canonical output for the Analyzer screen, dashboard
 * summaries, and future monitoring / compare / saved reports).
 *
 * Strict split: the fetch boundary (`lib/`) performs the only network IO; the
 * analysis pipeline (`domain/`) is pure and reuses every existing engine. Import via
 * this barrel.
 *
 * @example
 * import { analyze } from "@/features/live-checker";
 * const report = await analyze("example.com");
 */
export { analyze, type AnalyzeOptions } from "./lib/analyze";
export { fetchRobots, type FetchOptions, type FetchLike } from "./lib/fetch-robots";
export { toRobotsUrl, type RobotsTarget } from "./lib/url";
export { buildAnalysisReport } from "./domain/report";
export { computeBreakdown } from "./domain/breakdown";
export { computeVisibility } from "./domain/visibility";
export { buildRecommendations } from "./domain/recommendations";
