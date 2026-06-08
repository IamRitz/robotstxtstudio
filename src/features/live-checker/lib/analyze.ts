/**
 * Analyzer orchestrator: fetch (IO) + buildAnalysisReport (pure).
 *
 * This is the route-handler-shaped entry point — `analyze(input) => Promise<
 * AnalysisReport>`. A future Next.js Route Handler simply parses the request and
 * calls this. Invalid input yields a well-formed report with a `network-error`
 * fetch status (never throws).
 */
import type { AnalysisReport, FetchResult } from "@/types";
import { buildAnalysisReport } from "../domain/report";
import { fetchRobots, type FetchOptions } from "./fetch-robots";
import { toRobotsUrl } from "./url";

export interface AnalyzeOptions extends FetchOptions {
  /** Clock injection for deterministic `fetchedAt` (tests). */
  readonly now?: () => Date;
}

/** Fetch and analyze a site's robots.txt, producing an {@link AnalysisReport}. */
export async function analyze(input: string, options: AnalyzeOptions = {}): Promise<AnalysisReport> {
  const fetchedAt = (options.now?.() ?? new Date()).toISOString();
  const target = toRobotsUrl(input);

  if (!target) {
    const fetch: FetchResult = {
      status: "network-error",
      requestedUrl: input,
      robotsExists: false,
      redirected: false,
      error: "Invalid domain or URL.",
    };
    return buildAnalysisReport(fetch, input.trim(), fetchedAt);
  }

  const fetchResult = await fetchRobots(target.robotsUrl, options);
  return buildAnalysisReport(fetchResult, target.domain, fetchedAt);
}
