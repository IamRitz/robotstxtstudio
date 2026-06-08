/**
 * Parser utilities: directive-name recognition and path/number helpers.
 *
 * Pure functions only. Kept separate from tokenizing and grouping so the
 * "what is a known field / how do we read a path" rules live in one place and are
 * trivially testable.
 */
import type { DirectiveField } from "@/types";

/** Canonical directive fields the parser recognizes (excludes comment/blank/unknown). */
export const KNOWN_FIELDS = [
  "user-agent",
  "allow",
  "disallow",
  "sitemap",
  "crawl-delay",
  "host",
] as const satisfies readonly DirectiveField[];

/**
 * Normalized (lowercased) directive name → canonical field. Includes a few common
 * no-hyphen aliases seen in real files; extend here to tolerate more variants.
 */
export const FIELD_ALIASES: Readonly<Record<string, DirectiveField>> = {
  "user-agent": "user-agent",
  useragent: "user-agent",
  allow: "allow",
  disallow: "disallow",
  sitemap: "sitemap",
  "crawl-delay": "crawl-delay",
  crawldelay: "crawl-delay",
  host: "host",
};

/** Resolve a raw directive name to a canonical field, or `null` if unrecognized. */
export function normalizeFieldName(rawName: string): DirectiveField | null {
  return FIELD_ALIASES[rawName.trim().toLowerCase()] ?? null;
}

/** Precompute path-pattern metadata the tester/validator need. */
export function analyzePath(path: string): {
  hasWildcard: boolean;
  hasEndAnchor: boolean;
} {
  return {
    hasWildcard: path.includes("*"),
    hasEndAnchor: path.endsWith("$"),
  };
}

/**
 * Parse a `Crawl-delay` value into a non-negative number, or `null` when it is
 * empty or non-numeric (the raw directive is still preserved for the validator).
 */
export function parseCrawlDelay(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}
