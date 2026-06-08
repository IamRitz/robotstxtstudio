/**
 * URL Tester feature — the canonical robots.txt rule-evaluation engine.
 *
 * Answers "can crawler X access URL Y?" against a {@link RobotsFile}. Pure domain
 * logic: NO React, NO `next/*`. `testUrl` returns a full {@link UrlTestResult}
 * (verdict + matched rule + reason + trace); `evaluateAccess`/`isAllowed` are the
 * trace-free primitives reused by the Analyzer, AI Manager, Generator previews, and
 * future Monitoring/Compare. Import via this barrel.
 *
 * @example
 * import { parseRobots } from "@/parser";
 * import { testUrl } from "@/features/tester";
 * const result = testUrl(parseRobots(text), "/admin/login", "GPTBot");
 */
export { testUrl } from "./domain/test-url";
export { evaluateAccess, isAllowed, type AccessEvaluation } from "./domain/evaluate";
export { matchesPath, compilePattern } from "./domain/pattern";
export { normalizePath } from "./domain/url";
export { selectRules, type RuleSelection, type SelectionSource } from "./domain/user-agent";
