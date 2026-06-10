/**
 * Public analytics API (Phase 13B). Import the typed `track*` helpers from here; never
 * a vendor SDK. See ./types for the provider contract and docs/ANALYTICS.md for the
 * taxonomy.
 */
export {
  EVENTS,
  trackPageview,
  trackToolClicked,
  trackCtaClicked,
  trackFetchRobots,
  trackAnalyzeCompleted,
  trackValidationCompleted,
  trackCodeCopied,
  type SourceType,
  type AnalyzeCompletedProps,
  type ValidationCompletedProps,
} from "./events";
export { classifyPath, type PageType } from "./classify";
export { isAnalyticsEnabled } from "./client";
export { FUNNELS, type Funnel, type FunnelStep } from "./funnels";
export type { AnalyticsProvider, AnalyticsProps } from "./types";
