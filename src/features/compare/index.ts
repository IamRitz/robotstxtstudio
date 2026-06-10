/**
 * Compare feature (Phase 15C.3) — semantic diff of two robots.txt files.
 *
 * Pure domain logic; composes the existing parser/validator/audit/tester engines and
 * adds no new robots.txt rules. Import via this barrel.
 *
 * @example
 * import { buildComparison } from "@/features/compare";
 * const cmp = buildComparison(siteA, siteB);
 */
export { buildComparison } from "./domain/compare";
