/**
 * Turn validation info-issues and fetch problems into actionable
 * {@link Recommendation}s with deep-link actions. Pure.
 */
import type {
  FetchResult,
  RecommendedAction,
  Recommendation,
  ValidationCode,
  ValidationResult,
} from "@/types";

/** Where each info-level code points the user next. */
const ACTION_BY_CODE: Partial<Record<ValidationCode, RecommendedAction>> = {
  "missing-ai-crawler-policy": { kind: "open-crawler-manager" },
  "ai-crawler-inherits-default": { kind: "open-crawler-manager" },
  "no-crawler-specific-groups": { kind: "open-crawler-manager" },
  "missing-sitemap": { kind: "open-generator" },
  "sitemap-not-https": { kind: "open-generator" },
  "no-default-group": { kind: "open-generator" },
};

/** A recommendation describing a non-`ok` fetch outcome. */
function fetchRecommendation(fetch: FetchResult): Recommendation | null {
  switch (fetch.status) {
    case "not-found": {
      // Any 4xx except 429 lands here (RFC 9309 / Google: treated as no robots.txt).
      const code = fetch.httpStatus;
      const missing = code === undefined || code === 404 || code === 410;
      return {
        id: "fetch-not-found",
        severity: "warning",
        title: missing ? "No robots.txt found" : `robots.txt returns HTTP ${code}`,
        description: missing
          ? "This site has no robots.txt, so compliant crawlers may crawl everything. Create one to take control."
          : `The server answers /robots.txt with HTTP ${code}. Google and RFC 9309 treat a 4xx as "no robots.txt", so compliant crawlers may crawl everything — and Google advises against using 401/403 here. Serve the file with a 200.`,
        action: { kind: "open-generator" },
      };
    }
    case "invalid-content-type":
      return {
        id: "fetch-invalid-content-type",
        severity: "warning",
        title: "robots.txt is not plain text",
        description:
          fetch.body !== undefined
            ? `The server returned ${fetch.contentType ?? "an unexpected type"}. Crawlers generally still read the rules, but serve robots.txt as text/plain to be safe.`
            : "/robots.txt returns an HTML page, which contains no valid rules — compliant crawlers treat the site as unrestricted. Serve a plain-text robots.txt.",
        action: { kind: "edit-rules" },
      };
    case "too-large":
      return {
        id: "fetch-too-large",
        severity: "warning",
        title: "robots.txt is very large",
        description:
          "Only the first part was analyzed. Crawlers may ignore content past their size limit.",
        action: { kind: "edit-rules" },
      };
    case "timeout":
      return {
        id: "fetch-timeout",
        severity: "error",
        title: "Fetching robots.txt timed out",
        description: "The site did not respond in time. Check availability and try again.",
      };
    case "network-error":
      return {
        id: "fetch-network-error",
        severity: "error",
        title: "Could not fetch robots.txt",
        description: fetch.error ?? "A network error occurred while fetching the file.",
      };
    default:
      return null;
  }
}

/** Build the report's recommendations from fetch state + info-level findings. */
export function buildRecommendations(
  validation: ValidationResult,
  fetch: FetchResult,
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  const fetchRec = fetchRecommendation(fetch);
  if (fetchRec) recommendations.push(fetchRec);

  for (const issue of validation.issues) {
    if (issue.severity !== "info") continue;
    recommendations.push({
      id: issue.id,
      severity: "info",
      title: issue.title,
      description: issue.message,
      action: ACTION_BY_CODE[issue.code] ?? { kind: "edit-rules" },
    });
  }

  return recommendations;
}

/** The Control-tool deep-link a finding's code points to, if any (Action Queue). */
export function recommendedActionFor(code: ValidationCode): RecommendedAction | undefined {
  return ACTION_BY_CODE[code];
}
