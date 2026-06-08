/** A deterministic AnalysisReport-shaped payload for mocking /api/analyze in e2e. */
export const ANALYSIS_REPORT = {
  domain: "example.com",
  fetchedAt: "2026-01-01T00:00:00.000Z",
  fetch: {
    status: "ok",
    requestedUrl: "https://example.com/robots.txt",
    finalUrl: "https://example.com/robots.txt",
    httpStatus: 200,
    contentType: "text/plain",
    body: "User-agent: GPTBot\nDisallow: /\n\nUser-agent: *\nAllow: /\nDisallow: /admin/",
    robotsExists: true,
    redirected: false,
  },
  file: { source: "User-agent: GPTBot\nDisallow: /\n\nUser-agent: *\nAllow: /\nDisallow: /admin/" },
  validation: {
    isValid: true,
    health: { value: 78, band: "moderate", subscores: { syntax: 100, aiCrawlerConfig: 60, bestPractices: 70 } },
    counts: { error: 0, warning: 1, info: 3 },
  },
  visibility: { value: 71, band: "moderate", searchEngineAccess: 100, aiCrawlerAccess: 88, errorRate: 22 },
  breakdown: [
    { category: "search-engine", allowed: 3, blocked: 0, total: 3 },
    { category: "ai-training", allowed: 4, blocked: 1, total: 5 },
    { category: "ai-search", allowed: 3, blocked: 0, total: 3 },
    { category: "seo", allowed: 3, blocked: 0, total: 3 },
    { category: "social", allowed: 2, blocked: 0, total: 2 },
    { category: "data", allowed: 4, blocked: 0, total: 4 },
  ],
  findings: [
    { id: "missing-sitemap", severity: "warning", title: "No sitemap declared", message: "Declaring a sitemap helps crawlers discover all your indexable pages." },
  ],
  recommendations: [
    { id: "ai-1", severity: "info", title: "ClaudeBot inherits the default rules", description: "Add an explicit Allow or Disallow for ClaudeBot." },
  ],
  explanation: {
    summary: "By default, crawlers are allowed, with some sections blocked.",
    groups: [],
    aiCrawlers: [],
    sitemaps: [],
    notes: [],
  },
};
