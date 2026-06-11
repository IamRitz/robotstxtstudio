import { BadgeCheck, CalendarDays } from "lucide-react";
import { AUTHOR, CONTENT_UPDATED } from "@/config/content";
import { Card } from "@/components/ui/card";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Compact author + last-updated line shown under the page lead (EEAT). */
export function AuthorByline() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
          RS
        </span>
        <span className="font-medium text-foreground">{AUTHOR.name}</span>
      </span>
      <span className="flex items-center gap-1.5">
        <CalendarDays className="size-3.5" aria-hidden /> Updated {formatDate(CONTENT_UPDATED)}
      </span>
      <span className="flex items-center gap-1.5">
        <BadgeCheck className="size-3.5 text-brand" aria-hidden /> {AUTHOR.reviewedBy}
      </span>
    </div>
  );
}

/** Full author/methodology box rendered at the end of an article (EEAT). */
export function AuthorBox() {
  return (
    <Card className="flex items-start gap-3 p-5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        RS
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground">
          {AUTHOR.name} · <span className="font-normal text-muted-foreground">{AUTHOR.role}</span>
        </p>
        <p className="mt-1 text-xs leading-6 text-muted-foreground">{AUTHOR.bio}</p>
      </div>
    </Card>
  );
}
