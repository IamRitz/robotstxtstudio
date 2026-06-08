/**
 * Generator orchestrator + preview hooks.
 *
 * `generateRobots` produces the canonical AST and text. `generatePreview` layers on
 * the completed engines — Validator, Explainer, Tester — to give the future Screen 3
 * everything it needs from one call, without the UI touching domain internals.
 */
import { validateRobots } from "@/features/validator";
import { explainRobots } from "@/features/explainer";
import { testUrl } from "@/features/tester";
import type {
  ExplanationResult,
  GeneratorConfig,
  RobotsFile,
  UrlTestResult,
  ValidationResult,
} from "@/types";
import { buildRobotsFile } from "./build";
import { serialize } from "./serialize";

export interface GeneratedRobots {
  readonly config: GeneratorConfig;
  readonly file: RobotsFile;
  readonly text: string;
}

/** Generate the canonical robots.txt AST and serialized text for a config. */
export function generateRobots(config: GeneratorConfig): GeneratedRobots {
  const file = buildRobotsFile(config);
  return { config, file, text: serialize(file) };
}

export interface GeneratorPreview extends GeneratedRobots {
  readonly validation: ValidationResult;
  readonly explanation: ExplanationResult;
  /** A few representative access checks against the generated file. */
  readonly samples: readonly UrlTestResult[];
}

/** Build representative access checks for the preview. */
function sampleTests(file: RobotsFile, config: GeneratorConfig): UrlTestResult[] {
  const firstDisallow = config.disallowPaths[0] ?? "/";
  return [
    testUrl(file, "/", "GPTBot"),
    testUrl(file, "/", "Googlebot"),
    testUrl(file, firstDisallow, "Googlebot"),
  ];
}

/** Generate + validate + explain + sample-test in one call (powers Screen 3). */
export function generatePreview(config: GeneratorConfig): GeneratorPreview {
  const base = generateRobots(config);
  const validation = validateRobots(base.file);
  const explanation = explainRobots(base.file, { validation });
  return { ...base, validation, explanation, samples: sampleTests(base.file, config) };
}
