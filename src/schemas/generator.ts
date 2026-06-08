/**
 * Zod schema for the Generator's boundary input ({@link GeneratorConfig}).
 *
 * Validates the UI form / API payload before the Generator's pure domain logic
 * turns it into a `RobotsFile`. Inferred type stays compatible with the domain
 * `GeneratorConfig`.
 */
import { z } from "zod";
import { STARTER_TEMPLATES } from "@/types";
import { absoluteUrlSchema, crawlDelaySchema, robotsPathSchema } from "./primitives";
import { crawlPolicySchema } from "./crawler";

export const websiteTypeSchema = z.enum(STARTER_TEMPLATES);

export const generatorConfigSchema = z.object({
  template: websiteTypeSchema.optional(),
  crawlerPolicies: z.record(z.string(), crawlPolicySchema),
  disallowPaths: z.array(robotsPathSchema),
  sitemapUrl: absoluteUrlSchema.optional(),
  crawlDelay: crawlDelaySchema.optional(),
});

export type GeneratorConfigInput = z.infer<typeof generatorConfigSchema>;
