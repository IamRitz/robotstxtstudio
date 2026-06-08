"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Globe, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Domain input that routes to the Analyzer with the domain prefilled. */
export function QuickAnalyze({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const [domain, setDomain] = useState("");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = domain.trim();
    if (value) router.push(`/analyze?domain=${encodeURIComponent(value)}`);
  }

  return (
    <form onSubmit={submit} className={cn("flex w-full flex-col gap-2 sm:flex-row", className)}>
      <div className="flex flex-1 items-center gap-2 rounded-lg border border-input bg-card px-3">
        <Globe className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          autoFocus={autoFocus}
          aria-label="Your website domain"
          placeholder="Enter your domain — e.g. example.com"
          className="h-10 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
        />
      </div>
      <Button type="submit" size="lg" className="shrink-0">
        <ScanSearch /> Analyze My Site
      </Button>
    </form>
  );
}
