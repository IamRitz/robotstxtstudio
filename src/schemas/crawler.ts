/**
 * Zod schema for crawler catalog entries.
 *
 * Validates the config-layer crawler database (Phase 8) at load/test time so a
 * malformed entry fails loudly rather than silently breaking the Crawler Manager.
 * Its inferred type is kept compatible with the domain {@link Crawler} type.
 */
import { z } from "zod";
import { CRAWLER_CATEGORIES } from "@/types";
import { absoluteUrlSchema, userAgentSchema } from "./primitives";

/** Allow/block policy intent. */
export const crawlPolicySchema = z.enum(["allow", "block"]);

/** Crawler category, sourced from the single `CRAWLER_CATEGORIES` tuple. */
export const crawlerCategorySchema = z.enum(CRAWLER_CATEGORIES);

/** A single crawler definition. */
export const crawlerSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  owner: z.string().trim().min(1),
  userAgent: userAgentSchema,
  category: crawlerCategorySchema,
  description: z.string().trim().min(1),
  defaultRecommendation: crawlPolicySchema,
  docsUrl: absoluteUrlSchema.optional(),
});

/** The catalog is a non-empty array of unique-id crawlers. */
export const crawlerCatalogSchema = z
  .array(crawlerSchema)
  .min(1)
  .superRefine((crawlers, ctx) => {
    const seen = new Set<string>();
    for (const crawler of crawlers) {
      if (seen.has(crawler.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate crawler id: ${crawler.id}`,
        });
      }
      seen.add(crawler.id);
    }
  });

export type CrawlerInput = z.infer<typeof crawlerSchema>;
