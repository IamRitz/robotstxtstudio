"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILE_NAV } from "@/config/navigation";
import { cn } from "@/lib/utils";

/** Fixed bottom tab bar shown on small screens (hidden ≥ lg). */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary mobile"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card lg:hidden"
    >
      {MOBILE_NAV.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-1 py-2 text-[10px] font-medium",
              active ? "text-brand" : "text-muted-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {item.shortLabel}
          </Link>
        );
      })}
    </nav>
  );
}
