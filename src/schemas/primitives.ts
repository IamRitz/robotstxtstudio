/**
 * Reusable Zod primitives for boundary validation.
 *
 * These validate untrusted input crossing a boundary (route handler bodies, UI
 * form values) before it becomes a typed domain model. They live in `src/schemas`
 * so the pure `src/types` layer never imports `zod`.
 */
import { z } from "zod";

/**
 * A domain or site URL, e.g. `example.com` or `https://example.com/path`.
 * Normalizes to a value `new URL()` can consume and requires a dotted hostname.
 */
export const domainSchema = z
  .string()
  .trim()
  .min(1, "Enter a domain")
  .refine((value) => {
    try {
      const url = value.includes("://") ? new URL(value) : new URL(`https://${value}`);
      return url.hostname.includes(".") && !url.hostname.startsWith(".");
    } catch {
      return false;
    }
  }, "Enter a valid domain, e.g. example.com");

/** An absolute http(s) URL (used for sitemap declarations). */
export const absoluteUrlSchema = z
  .string()
  .trim()
  .url("Enter a valid URL")
  .refine((value) => /^https?:\/\//i.test(value), "URL must start with http:// or https://");

/** A robots.txt path pattern; must be root-relative (start with `/`). */
export const robotsPathSchema = z
  .string()
  .trim()
  .min(1, "Path cannot be empty")
  .refine((value) => value.startsWith("/"), "Path must start with /");

/** A user-agent token, e.g. `Googlebot` or `*`. */
export const userAgentSchema = z.string().trim().min(1, "User-agent cannot be empty");

/** Crawl-delay in seconds: a non-negative integer. */
export const crawlDelaySchema = z
  .number()
  .int("Crawl-delay must be a whole number")
  .nonnegative("Crawl-delay cannot be negative");
