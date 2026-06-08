/**
 * Translate validation findings and sitemap facts into friendly, plain-English
 * notes. The Explainer does not re-judge — it re-words what the Validator found.
 */
import type { RobotsFile, ValidationCode, ValidationResult } from "@/types";

/** Plain-English notes about sitemaps (presence/absence). */
export function explainSitemaps(file: RobotsFile): string[] {
  if (file.sitemaps.length === 0) {
    return [
      "No sitemap was found. Search engines may take longer to discover your pages — consider adding a Sitemap directive.",
    ];
  }
  return file.sitemaps.map((s) =>
    s.url
      ? `A sitemap is declared at ${s.url}, which helps search engines find your pages.`
      : "A Sitemap directive is present but its URL is missing.",
  );
}

/** Codes that indicate a line could not be understood (aggregated into one note). */
const SYNTAX_CODES: readonly ValidationCode[] = [
  "missing-colon",
  "directive-before-user-agent",
  "empty-user-agent",
  "invalid-crawl-delay",
  "invalid-sitemap-url",
];

/** Friendly note per validation code (ordered for stable output). */
const NOTE_BY_CODE: ReadonlyArray<[ValidationCode, string]> = [
  [
    "conflicting-rules",
    "Some rules conflict (a page is both allowed and blocked), so crawlers may behave unpredictably.",
  ],
  [
    "overly-broad-disallow",
    "Your rules block an entire site for one or more major crawlers — double-check that this is intended.",
  ],
  ["excessive-rules", "This file has a very large number of rules, which can be hard to maintain."],
  [
    "crawl-delay-ignored-by-google",
    "Google ignores Crawl-delay, so it will not slow Googlebot down — use Search Console instead.",
  ],
];

/** Build advisory notes from a validation result. Empty when none is supplied. */
export function buildNotes(validation?: ValidationResult): string[] {
  if (!validation) return [];
  const present = new Set(validation.issues.map((i) => i.code));
  const notes: string[] = [];

  if (SYNTAX_CODES.some((code) => present.has(code))) {
    notes.push("Some lines aren't valid robots.txt and will be ignored by crawlers — see the validator for details.");
  }
  for (const [code, note] of NOTE_BY_CODE) {
    if (present.has(code)) notes.push(note);
  }
  return notes;
}
