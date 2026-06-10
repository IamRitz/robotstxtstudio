/**
 * Central analytics dispatcher (Phase 13B).
 *
 * Fans out events/pageviews to every registered provider. Safe to call from anywhere,
 * any time: on the server it no-ops; before providers initialize it buffers, then
 * flushes on init; a throwing provider never breaks the app or other providers.
 */
import type { AnalyticsProps, AnalyticsProvider } from "./types";

type Queued =
  | { readonly kind: "event"; readonly event: string; readonly props?: AnalyticsProps }
  | { readonly kind: "pageview"; readonly path: string; readonly props?: AnalyticsProps };

let providers: readonly AnalyticsProvider[] = [];
let initialized = false;
const queue: Queued[] = [];

function safe(fn: () => void): void {
  try {
    fn();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.warn("[analytics]", error);
  }
}

function dispatch(q: Queued): void {
  if (q.kind === "event") {
    for (const p of providers) safe(() => p.capture(q.event, q.props));
  } else {
    for (const p of providers) safe(() => p.pageview(q.path, q.props));
  }
}

/** Register the enabled providers (called once by the AnalyticsProvider component). */
export function registerProviders(next: readonly AnalyticsProvider[]): void {
  providers = next;
}

/** Initialize providers and flush any buffered events. Idempotent. */
export function initAnalytics(): void {
  if (initialized || providers.length === 0) return;
  initialized = true;
  for (const p of providers) safe(() => p.init());
  for (const q of queue.splice(0)) dispatch(q);
}

/** True when at least one provider is registered. */
export function isAnalyticsEnabled(): boolean {
  return providers.length > 0;
}

/** Record an event (buffered until init; no-op on the server). */
export function capture(event: string, props?: AnalyticsProps): void {
  if (typeof window === "undefined") return;
  if (!initialized) {
    queue.push({ kind: "event", event, props });
    return;
  }
  dispatch({ kind: "event", event, props });
}

/** Record a pageview (buffered until init; no-op on the server). */
export function pageview(path: string, props?: AnalyticsProps): void {
  if (typeof window === "undefined") return;
  if (!initialized) {
    queue.push({ kind: "pageview", path, props });
    return;
  }
  dispatch({ kind: "pageview", path, props });
}
