/**
 * Analytics abstraction (Phase 13B) — vendor-neutral contract.
 *
 * Call sites depend only on these types and the `track*` helpers, never on a vendor
 * SDK. Adding or replacing a provider (PostHog, Clarity, Plausible, …) is a single new
 * adapter implementing {@link AnalyticsProvider}; no call site changes. This is what
 * keeps the system free of vendor lock-in.
 */

/** A JSON-serializable property value. */
export type AnalyticsValue = string | number | boolean | null | undefined | readonly string[];

/** A flat bag of event properties. */
export type AnalyticsProps = Readonly<Record<string, AnalyticsValue>>;

/** A pluggable analytics backend. */
export interface AnalyticsProvider {
  /** Stable id, e.g. "posthog". */
  readonly name: string;
  /** Load the vendor script and initialize. Called once, client-side, when enabled. */
  init(): void;
  /** Record a named event with optional properties. */
  capture(event: string, props?: AnalyticsProps): void;
  /** Record a pageview for a path. */
  pageview(path: string, props?: AnalyticsProps): void;
}
