/**
 * Zod schemas for API route-handler request bodies (the network boundary).
 *
 * These guard the Live Analyzer and URL Tester endpoints. Each parsed result is a
 * trusted, typed input for the corresponding feature's domain logic.
 */
import { z } from "zod";
import { domainSchema, userAgentSchema } from "./primitives";

/** `POST /api/analyze` — audit a live site. */
export const analyzeRequestSchema = z.object({
  domain: domainSchema,
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

/**
 * The source of robots.txt for a URL test: either fetch it from a domain, or use
 * pasted raw content. Discriminated for exhaustive handling.
 */
export const robotsSourceSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("domain"), domain: domainSchema }),
  z.object({ kind: z.literal("raw"), content: z.string() }),
]);

export type RobotsSource = z.infer<typeof robotsSourceSchema>;

/** `POST /api/url-test` — evaluate a URL against robots.txt for a user-agent. */
export const urlTestRequestSchema = z.object({
  source: robotsSourceSchema,
  /** The URL or path being tested. */
  url: z.string().trim().min(1, "Enter a URL to test"),
  userAgent: userAgentSchema,
});

export type UrlTestRequest = z.infer<typeof urlTestRequestSchema>;
