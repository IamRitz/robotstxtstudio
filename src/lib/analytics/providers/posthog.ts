/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * PostHog adapter (Phase 13B).
 *
 * Loads PostHog via its official bootstrap snippet (re-expressed as real code, not an
 * eval'd string, so it's CSP-safe) — no npm dependency, so swapping providers stays a
 * one-file change. Privacy posture: manual pageviews (no auto), autocapture off,
 * session recording off, localStorage persistence (no server-set cookies), DNT honored.
 */
import type { AnalyticsProps, AnalyticsProvider } from "../types";

function bootstrap(host: string): void {
  const w = window as any;
  const ph: any = (w.posthog = w.posthog || []);
  if (ph.__SV) return;
  ph._i = [];
  ph.init = function (token: string, config: any, name?: string) {
    const target: any = name ? (ph[name] = []) : ph;
    const methods =
      "init capture register register_once unregister identify alias people set_config reset group setPersonProperties onFeatureFlags reloadFeatureFlags getFeatureFlag isFeatureEnabled opt_in_capturing opt_out_capturing has_opted_out_capturing debug".split(
        " ",
      );
    for (const m of methods) {
      target[m] = function (...args: unknown[]) {
        target.push([m, ...args]);
      };
    }
    ph._i.push([token, config, name]);
  };
  ph.__SV = 1;

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.async = true;
  script.src = `${host}/static/array.js`;
  const first = document.getElementsByTagName("script")[0];
  first?.parentNode?.insertBefore(script, first);
}

/** Build a PostHog provider for the given project key + host. */
export function createPostHogProvider(token: string, host: string): AnalyticsProvider {
  return {
    name: "posthog",
    init() {
      bootstrap(host);
      (window as any).posthog.init(token, {
        api_host: host,
        capture_pageview: false, // we send manual, classified pageviews
        autocapture: false, // explicit taxonomy only — avoids incidental PII
        disable_session_recording: true,
        persistence: "localStorage", // no server-set cookies
        respect_dnt: true,
      });
    },
    capture(event: string, props?: AnalyticsProps) {
      (window as any).posthog?.capture?.(event, props);
    },
    pageview(path: string, props?: AnalyticsProps) {
      (window as any).posthog?.capture?.("$pageview", { $current_url: path, ...props });
    },
  };
}
