/**
 * Generator feature — the canonical robots.txt writer.
 *
 * Transforms a {@link GeneratorConfig} into a {@link RobotsFile} AST and serialized
 * text, and (via `generatePreview`) layers on the Validator, Explainer, and Tester
 * for the future Screen 3. Pure domain logic: NO React, NO `next/*`. No other
 * feature should construct robots.txt text directly — use `serialize`.
 *
 * @example
 * import { applyPreset, generatePreview } from "@/features/generator";
 * const preview = generatePreview(applyPreset("blog"));
 * preview.text; // robots.txt
 */
export { generateRobots, generatePreview } from "./domain/generate";
export type { GeneratedRobots, GeneratorPreview } from "./domain/generate";
export { buildRobotsFile } from "./domain/build";
export { serialize } from "./domain/serialize";
export { applyPreset, PRESETS, TEMPLATE_LABELS } from "./domain/presets";
