/**
 * Provider registry (Phase 13B). Builds the set of enabled adapters from env config.
 * Each provider is independent — configure either, both, or neither. With none
 * configured this returns `[]` and the app sends zero analytics.
 */
import { analyticsConfig } from "@/lib/env";
import type { AnalyticsProvider } from "../types";
import { createPostHogProvider } from "./posthog";
import { createClarityProvider } from "./clarity";

export function buildProviders(): AnalyticsProvider[] {
  const providers: AnalyticsProvider[] = [];
  if (analyticsConfig.posthogKey) {
    providers.push(createPostHogProvider(analyticsConfig.posthogKey, analyticsConfig.posthogHost));
  }
  if (analyticsConfig.clarityId) {
    providers.push(createClarityProvider(analyticsConfig.clarityId));
  }
  return providers;
}
