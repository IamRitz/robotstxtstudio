import Link from "next/link";
import { Bot } from "lucide-react";
import { BRAND } from "@/config/navigation";

/** Site footer: brand mark, primary links, copyright. */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Bot className="size-3.5" />
          </span>
          <span className="text-sm font-bold text-foreground">{BRAND.name}</span>
        </div>
        <nav aria-label="Footer" className="flex items-center gap-4 text-xs text-muted-foreground">
          <Link href="/analyze" className="hover:text-foreground">Analyze</Link>
          <Link href="/generate" className="hover:text-foreground">Generate</Link>
          <Link href="/validate" className="hover:text-foreground">Validate</Link>
          <Link href="/ai-crawlers" className="hover:text-foreground">AI Crawlers</Link>
        </nav>
        <p className="text-xs text-muted-foreground">© {year} {BRAND.name}</p>
      </div>
    </footer>
  );
}
