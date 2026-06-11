import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowUpRight, Check, ExternalLink, Wrench } from "lucide-react";
import type { Severity, ValidationIssue } from "@/types";
import { applyTextEdits, whyItMatters } from "@/features/validator";
import { recommendedActionFor } from "@/features/live-checker";
import { getCrawler } from "@/config/crawlers";
import { impactDetail, issuePoints } from "@/app/validate/issue-panel";
import { trackActionQueueClicked } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DiffView } from "@/components/diff-view";
import { STATUS_VISUALS, severityToStatus } from "@/components/severity";

const SEVERITY_RANK: Record<Severity, number> = { error: 0, warning: 1, info: 2 };

const SITEMAP_CODES = new Set(["missing-sitemap", "sitemap-not-https", "invalid-sitemap-url"]);

/**
 * Deep-link target for a finding without an in-app fix (17F.2: targeted, not
 * page-level). AI issue ids embed the crawler id (`…inherits-default:claudebot`),
 * so the link can land on — and highlight — the exact toggle; sitemap findings
 * land on the Generator's sitemap field.
 */
function deepLinkFor(issue: ValidationIssue): { href: Route; label: string } | null {
  const action = recommendedActionFor(issue.code);
  if (action?.kind === "open-crawler-manager") {
    const crawler = getCrawler(issue.id.split(":")[1] ?? "");
    return crawler
      ? {
          href: `/ai-crawlers?focus=${crawler.id}` as Route,
          label: `Open AI Manager → ${crawler.name}`,
        }
      : { href: "/ai-crawlers" as Route, label: "Open AI Manager" };
  }
  if (action?.kind === "open-generator") {
    return SITEMAP_CODES.has(issue.code)
      ? { href: "/generate?focus=sitemap" as Route, label: "Open Generator → Sitemap" }
      : { href: "/generate" as Route, label: "Open Generator" };
  }
  return null;
}

/**
 * One ranked queue (Phase 17A): recoverable (in-app fixable) work first by points,
 * then manual point work, then advisories — Priorities, Issues, and Recommendations
 * collapsed into a single "what should I do first?" list.
 */
export function rankQueue(issues: readonly ValidationIssue[]): ValidationIssue[] {
  const group = (i: ValidationIssue) =>
    (i.fix?.edits?.length ?? 0) > 0 ? 0 : issuePoints(i) > 0 ? 1 : 2;
  return [...issues].sort(
    (a, b) =>
      group(a) - group(b) ||
      issuePoints(b) - issuePoints(a) ||
      SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity],
  );
}

/** Mirrors the Validator issue-panel row anatomy, minus line jumping (no editor
 *  on the Analyzer until 17B), plus deep-link actions for non-fixable findings. */
function QueueRow({
  issue,
  selected,
  sourceText,
  onSelect,
  onFix,
}: {
  issue: ValidationIssue;
  selected: boolean;
  sourceText: string;
  onSelect: (issue: ValidationIssue) => void;
  onFix: (issue: ValidationIssue) => void;
}) {
  const status = severityToStatus(issue.severity);
  const { icon: Icon, chip } = STATUS_VISUALS[status];
  const points = issuePoints(issue);
  const canFix = (issue.fix?.edits?.length ?? 0) > 0;
  const isSafe = issue.fix?.safe === true;
  const deepLink = canFix ? null : deepLinkFor(issue);

  /** Safe fixes apply in one click; review fixes open the diff preview first. */
  const quickFix = () => {
    trackActionQueueClicked(issue.code, "fix");
    if (isSafe) onFix(issue);
    else onSelect(issue);
  };

  const previewAfter = canFix && selected ? applyTextEdits(sourceText, issue.fix!.edits!) : null;

  return (
    <div
      data-issue-id={issue.id}
      className={cn(
        "rounded-xl border bg-card transition-colors",
        selected ? "border-brand shadow-sm" : "border-border",
      )}
    >
      <div
        onClick={() => onSelect(issue)}
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl p-3 text-left"
      >
        <span
          className={cn("flex size-5 shrink-0 items-center justify-center rounded-full", chip)}
          aria-hidden
        >
          <Icon className="size-3" />
        </span>
        <button
          type="button"
          aria-expanded={selected}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(issue);
          }}
          className="min-w-0 flex-1 truncate text-left text-sm font-medium text-foreground"
        >
          {issue.title}
        </button>
        {points > 0 ? (
          <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
            +{points} pts
          </span>
        ) : null}
        {canFix ? (
          <Button
            variant="outline"
            size="sm"
            aria-label={`Fix this: ${issue.title}`}
            title={isSafe ? issue.fix!.description : "Review the change, then apply"}
            onClick={(e) => {
              e.stopPropagation();
              quickFix();
            }}
            className="shrink-0"
          >
            <Wrench aria-hidden /> Fix this
            {isSafe ? null : <span className="font-normal text-muted-foreground">· review</span>}
          </Button>
        ) : deepLink ? (
          <Link
            href={deepLink.href}
            onClick={(e) => {
              e.stopPropagation();
              trackActionQueueClicked(issue.code, "deep-link");
            }}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-brand hover:border-brand"
          >
            {deepLink.label} <ArrowUpRight className="size-3" aria-hidden />
          </Link>
        ) : null}
      </div>

      {selected ? (
        <div className="space-y-2.5 border-t border-border px-3 py-2.5 pl-[42px]">
          <p className="text-xs text-muted-foreground">{issue.message}</p>
          <p className="text-xs leading-relaxed text-foreground">
            <span className="font-semibold">Why this matters: </span>
            {whyItMatters(issue.code)}
          </p>

          {previewAfter !== null && previewAfter !== sourceText ? (
            <div>
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                This fix would change
              </p>
              <DiffView before={sourceText} after={previewAfter} className="max-h-48 text-[11px]" />
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {canFix ? (
              <Button
                size="sm"
                onClick={() => {
                  trackActionQueueClicked(issue.code, "fix");
                  onFix(issue);
                }}
                title={issue.fix!.description}
                aria-label={`Apply fix: ${issue.title}`}
              >
                <Check aria-hidden /> Apply fix
              </Button>
            ) : null}
            {impactDetail(issue) ? (
              <span className="font-medium text-status-allowed-fg">{impactDetail(issue)}</span>
            ) : null}
            {issue.learnMoreUrl ? (
              <a
                href={issue.learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
              >
                Learn more <ExternalLink className="size-3" aria-hidden />
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ActionQueue({
  issues,
  sourceText,
  onFix,
}: {
  /** ALL findings (errors, warnings, advisories) — the queue does the ranking. */
  issues: readonly ValidationIssue[];
  sourceText: string;
  onFix: (issue: ValidationIssue) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const ranked = rankQueue(issues);

  return (
    <div className="space-y-2" data-testid="issue-list">
      {ranked.map((issue) => (
        <QueueRow
          key={issue.id}
          issue={issue}
          selected={issue.id === selectedId}
          sourceText={sourceText}
          onSelect={(i) => setSelectedId((cur) => (cur === i.id ? null : i.id))}
          onFix={onFix}
        />
      ))}
    </div>
  );
}
