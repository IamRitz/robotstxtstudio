import { cn } from "@/lib/utils";

/** Initials shown in a crawler's logo tile (1–3 chars). */
function initials(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9]/g, "");
  return cleaned.slice(0, name.length <= 3 ? name.length : 2).toUpperCase() || "?";
}

/** A crawler logo tile (bold abbreviation on a neutral square). */
export function CrawlerLogo({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-sm bg-muted text-[10px] font-bold text-foreground",
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

/** A crawler chip: logo tile + name (+ optional mono user-agent). */
export function CrawlerBadge({
  name,
  userAgent,
  className,
}: {
  name: string;
  userAgent?: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <CrawlerLogo name={name} />
      <span className="text-sm font-semibold text-foreground">{name}</span>
      {userAgent ? <span className="font-mono text-xs text-muted-foreground">{userAgent}</span> : null}
    </span>
  );
}
