"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { buildProviders } from "@/lib/analytics/providers";
import { registerProviders, initAnalytics } from "@/lib/analytics/client";
import { classifyPath, trackPageview } from "@/lib/analytics";

/**
 * Mounts analytics (Phase 13B): registers the env-configured providers, initializes
 * them once, and sends a classified pageview on every client navigation. Renders
 * nothing. When no provider is configured it's an inert no-op (zero network).
 */
export function AnalyticsProvider() {
  const pathname = usePathname();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    registerProviders(buildProviders());
    initAnalytics();
  }, []);

  useEffect(() => {
    if (!pathname) return;
    trackPageview(pathname, classifyPath(pathname));
  }, [pathname]);

  return null;
}
