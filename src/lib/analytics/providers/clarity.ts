/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Microsoft Clarity adapter (Phase 13B).
 *
 * Loads Clarity via its official snippet (real code, CSP-safe) — no npm dependency.
 * Clarity provides heatmaps + session replay with automatic text masking; we forward
 * named events and set a `page_type` tag so replays/heatmaps are segmentable. It
 * auto-tracks pageviews itself, so our `pageview()` only updates the tag.
 */
import type { AnalyticsProps, AnalyticsProvider } from "../types";

function bootstrap(projectId: string): void {
  const w = window as any;
  if (w.clarity) return;
  w.clarity =
    w.clarity ||
    function (...args: unknown[]) {
      (w.clarity.q = w.clarity.q || []).push(args);
    };
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${projectId}`;
  const first = document.getElementsByTagName("script")[0];
  first?.parentNode?.insertBefore(script, first);
}

/** Build a Clarity provider for the given project id. */
export function createClarityProvider(projectId: string): AnalyticsProvider {
  return {
    name: "clarity",
    init() {
      bootstrap(projectId);
    },
    capture(event: string) {
      // Clarity custom events take a name only; properties live on PostHog.
      (window as any).clarity?.("event", event);
    },
    pageview(_path: string, props?: AnalyticsProps) {
      const pageType = props?.page_type;
      if (typeof pageType === "string") (window as any).clarity?.("set", "page_type", pageType);
    },
  };
}
