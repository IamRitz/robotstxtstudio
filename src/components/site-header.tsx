"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot } from "lucide-react";
import { PRIMARY_NAV, BRAND } from "@/config/navigation";
import { cn } from "@/lib/utils";

/** Dark top navigation bar: logo, centered nav (desktop), and primary CTA. */
export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-primary text-primary-foreground">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-brand text-brand-foreground">
            <Bot className="size-3.5" />
          </span>
          <span className="text-sm font-bold">{BRAND.name}</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {PRIMARY_NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  active ? "bg-white/15 text-white" : "text-white/60 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/analyze"
          className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-brand-foreground hover:opacity-90"
        >
          Get Started
        </Link>
      </div>
    </header>
  );
}
