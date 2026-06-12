import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { MobileNav } from "./mobile-nav";

/**
 * Page chrome: dark top nav, a centered content container, footer, and the mobile
 * bottom tab bar. Pages render their content as children.
 */
export function AppShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className={cn("mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6", className)}>
        {children}
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  );
}
