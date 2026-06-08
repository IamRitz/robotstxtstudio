/**
 * Per-category crawler-access breakdown — computed by reusing the URL Tester
 * against the catalog. Pure.
 */
import { CATEGORY_ORDER, crawlersByCategory } from "@/config/crawlers";
import { isAllowed } from "@/features/tester";
import type { CategoryBreakdown, RobotsFile } from "@/types";

/** Tally allowed/blocked crawlers per category for the site root. */
export function computeBreakdown(file: RobotsFile): CategoryBreakdown[] {
  return CATEGORY_ORDER.map((category) => {
    const crawlers = crawlersByCategory(category);
    let allowed = 0;
    for (const crawler of crawlers) {
      if (isAllowed(file, "/", crawler.userAgent)) allowed += 1;
    }
    return { category, allowed, blocked: crawlers.length - allowed, total: crawlers.length };
  });
}
