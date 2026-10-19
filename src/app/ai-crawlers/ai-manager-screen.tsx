"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, FileText, Megaphone, Search, ShieldCheck } from "lucide-react";
import {
  AI_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  crawlersByCategory,
  getCrawler,
} from "@/config/crawlers";
import { TEMPLATE_LABELS } from "@/features/generator";
import {
  analyzePolicySet,
  blockAllAiCrawlers,
  allowAllAiCrawlers,
  emptyPolicySet,
  fromWebsitePreset,
  getPermission,
  policySetFromFile,
  setCategoryPermission,
  setPermission,
  type PermissionState,
  type PolicySet,
} from "@/features/crawler-manager";
import { parseRobots } from "@/parser";
import {
  clearWorkspace,
  getWorkspace,
  setWorkspace,
  workspaceLabel,
  type Workspace,
} from "@/lib/workspace";
import { WorkspaceBar } from "@/components/workspace-bar";
import { DiffView } from "@/components/diff-view";
import type { Crawler, CrawlerCategory, WebsiteType } from "@/types";
import { PageHeader } from "@/components/page-header";
import { SectionHeader } from "@/components/section-header";
import { CrawlerBadge } from "@/components/crawler-badge";
import { StatusBadge } from "@/components/status-badge";
import { CodePanel } from "@/components/code-panel";
import { InfoPanel } from "@/components/info-panel";
import { RecommendationCard } from "@/components/recommendation-card";
import { NextSteps, type NextStep } from "@/components/next-steps";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const TEMPLATES = Object.keys(TEMPLATE_LABELS) as WebsiteType[];

/** Why each starter exists — what it does, and who it's for (Phase 15B.5). */
const TEMPLATE_RATIONALE: Record<WebsiteType, { what: string; who: string }> = {
  blog: {
    what: "Allows search engines, SEO, and social crawlers, but blocks every AI crawler — both training bots and answer engines.",
    who: "Writers and content publishers who want full search visibility while keeping their work out of AI datasets and answers.",
  },
  saas: {
    what: "Allows search, SEO, and social; blocks AI training and AI answer engines, and disallows app/dashboard/API paths.",
    who: "Software companies that want marketing pages indexed in search while keeping product and docs out of AI crawlers.",
  },
  ecommerce: {
    what: "Allows search, SEO, social, and AI answer engines, but blocks AI training. Disallows cart, checkout, and account paths.",
    who: "Online stores that want maximum product discoverability — including via AI search — without their catalog used for training.",
  },
  publisher: {
    what: "Allows search, SEO, social, and AI answer engines, but blocks bulk AI training of premium content.",
    who: "News and media sites that need to stay fully indexed and citable while protecting articles from training.",
  },
  documentation: {
    what: "Allows search, SEO, social, and AI answer engines so assistants can surface and cite your docs; blocks bulk AI training.",
    who: "Documentation and knowledge-base sites that want to be the source AI tools quote.",
  },
};

/**
 * Default collapse rule (17E): a group starts EXPANDED only when it holds active
 * work — at least one explicit decision AND at least one enabled crawler.
 * Untouched groups and fully-blocked ("done") groups start collapsed.
 */
function defaultOpenMap(set: PolicySet): Record<CrawlerCategory, boolean> {
  const map = {} as Record<CrawlerCategory, boolean>;
  for (const category of CATEGORY_ORDER) {
    const crawlers = crawlersByCategory(category);
    const states = crawlers.map((c) => getPermission(set, c.id));
    const enabled = states.filter((st) => st !== "block").length;
    const explicit = states.some((st) => st !== "inherit");
    map[category] = enabled > 0 && explicit;
  }
  return map;
}

function badgeStatus(state: PermissionState) {
  return state === "allow" ? "allowed" : state === "block" ? "blocked" : "info";
}

/** True briefly after `value` changes (skips first render) — for a subtle flash. */
function useJustUpdated(value: string): boolean {
  const [flash, setFlash] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setFlash(true);
    const id = setTimeout(() => setFlash(false), 450);
    return () => clearTimeout(id);
  }, [value]);
  return flash;
}

const UI_KEY = "rs:ai-manager-ui";

interface SavedManagerUi {
  policySet?: PolicySet;
  template?: WebsiteType | null;
  /** The workspace text the saved intent was based on — stale saves are dropped. */
  basedOnText?: string | null;
}

function readSavedUi(): SavedManagerUi {
  try {
    return (JSON.parse(sessionStorage.getItem(UI_KEY) ?? "{}") as SavedManagerUi) ?? {};
  } catch {
    return {};
  }
}

export function AiManagerScreen({
  focusCrawlerId,
}: {
  /** Deep-link target (17F.2): land on this crawler — expanded, in view, marked. */
  focusCrawlerId?: string;
}) {
  const [policySet, setPolicySet] = useState<PolicySet>(emptyPolicySet);
  const [query, setQuery] = useState("");
  /** The active starter template, highlighted until the policy diverges from it. */
  const [template, setTemplate] = useState<WebsiteType | null>(null);
  /** The shared working file this screen is seeded from, if any (17D). */
  const [ws, setWs] = useState<Workspace | null>(null);
  /** Per-category expansion. `null` = derive defaults from the current policy. */
  const [open, setOpen] = useState<Record<CrawlerCategory, boolean> | null>(null);
  /** Live-sync (17E): the workspace text WE last wrote; null = not syncing. */
  const syncRef = useRef<string | null>(null);
  /** Briefly emphasized crawler row (deep-link landing — 17F.2). */
  const [highlightId, setHighlightId] = useState<string | null>(null);

  // Seed from the shared workspace (17D): toggles reflect the working file's
  // decisions. Uncommitted intent survives back/forward via sessionStorage, but
  // only while it was based on the SAME workspace text (stale intent is dropped).
  useEffect(() => {
    const current = getWorkspace();
    setWs(current);
    const saved = readSavedUi();
    let seeded = emptyPolicySet();
    if (saved.policySet && (saved.basedOnText ?? null) === (current?.text ?? null)) {
      seeded = saved.policySet;
      setPolicySet(saved.policySet);
      setTemplate(saved.template ?? null);
    } else if (current) {
      seeded = policySetFromFile(parseRobots(current.text));
      setPolicySet(seeded);
      setTemplate(null);
    }
    // Deep-link landing (17F.2): expand the crawler's group, bring the row into
    // view, and mark it briefly so the eye lands on the thing needing a decision.
    const focus = focusCrawlerId ? getCrawler(focusCrawlerId) : undefined;
    if (focus) {
      setOpen({ ...defaultOpenMap(seeded), [focus.category]: true });
      setHighlightId(focus.id);
      const scroll = window.setTimeout(() => {
        document
          .querySelector(`[data-crawler-row="${focus.id}"]`)
          ?.scrollIntoView({ block: "center" });
      }, 80);
      const clear = window.setTimeout(() => setHighlightId(null), 2200);
      return () => {
        window.clearTimeout(scroll);
        window.clearTimeout(clear);
      };
    }
  }, [focusCrawlerId]);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        UI_KEY,
        JSON.stringify({ policySet, template, basedOnText: ws?.text ?? null }),
      );
    } catch {
      // session nicety only
    }
  }, [policySet, template, ws]);

  /** Commit the manager's output as the new working file (explicit, previewed). */
  const applyToWorkspace = () => {
    if (!ws) return;
    setWorkspace({
      domain: ws.domain,
      originalText: ws.originalText,
      text: impact.text,
      appliedFixes: ws.appliedFixes,
      source: "ai-manager",
    });
    syncRef.current = impact.text;
    setWs(getWorkspace());
  };

  const discardWorkspace = () => {
    clearWorkspace();
    syncRef.current = null;
    setWs(null);
    setPolicySet(emptyPolicySet());
    setTemplate(null);
  };

  const impact = useMemo(() => analyzePolicySet(policySet), [policySet]);
  const justUpdated = useJustUpdated(impact.text);

  // Live-sync (17E): after one explicit apply, the working file is fully
  // generated — further regeneration loses nothing, so every toggle updates the
  // workspace immediately. A foreign edit (text ≠ our last write) drops sync.
  useEffect(() => {
    if (!ws || syncRef.current === null) return;
    if (ws.text !== syncRef.current) {
      syncRef.current = null;
      return;
    }
    if (impact.text === ws.text) return;
    setWorkspace({
      domain: ws.domain,
      originalText: ws.originalText,
      text: impact.text,
      appliedFixes: ws.appliedFixes,
      source: "ai-manager",
    });
    syncRef.current = impact.text;
    setWs(getWorkspace());
  }, [impact.text, ws]);

  // Any manual change means the policy no longer matches a template.
  const toggle = (id: string, checked: boolean) => {
    setPolicySet((prev) => setPermission(prev, id, checked ? "allow" : "block"));
    setTemplate(null);
  };
  /** Groups holding explicit decisions under `next` — the change must be SEEN
   *  in the rows, not only in the generated code. */
  const revealMapFor = (next: PolicySet) =>
    Object.fromEntries(
      CATEGORY_ORDER.map((category) => [
        category,
        crawlersByCategory(category).some((c) => getPermission(next, c.id) !== "inherit"),
      ]),
    ) as Record<CrawlerCategory, boolean>;
  const revealDecisions = (next: PolicySet) => setOpen(revealMapFor(next));

  const applyTemplate = (t: WebsiteType) => {
    setPolicySet(fromWebsitePreset(t));
    setTemplate(t);
    revealDecisions(fromWebsitePreset(t));
  };
  const applyAndClear = (next: PolicySet) => {
    setPolicySet(next);
    setTemplate(null);
    revealDecisions(next);
  };

  const openMap = open ?? defaultOpenMap(policySet);
  const toggleOpen = (category: CrawlerCategory) =>
    setOpen({ ...openMap, [category]: !openMap[category] });
  const setAllOpen = (value: boolean) =>
    setOpen(
      Object.fromEntries(CATEGORY_ORDER.map((c) => [c, value])) as Record<CrawlerCategory, boolean>,
    );

  /** Header bulk action: set every crawler in the group in ONE click (17E). */
  const setCategory = (category: CrawlerCategory, state: PermissionState) => {
    const next = setCategoryPermission(policySet, category, state);
    setPolicySet(next);
    setTemplate(null);
    // Reveal what changed everywhere, but ALWAYS keep the acted-on group open —
    // a header Reset must show the rows flipping back to Inherited.
    setOpen({ ...revealMapFor(next), [category]: true });
  };

  // Do the bulk buttons reflect reality? (Every AI crawler explicitly decided.)
  const aiStates = AI_CATEGORIES.flatMap((cat) => crawlersByCategory(cat)).map((c) =>
    getPermission(policySet, c.id),
  );
  const allAiBlocked = aiStates.every((st) => st === "block");
  const allAiAllowed = aiStates.every((st) => st === "allow");

  const matches = (c: Crawler) =>
    `${c.name} ${c.owner}`.toLowerCase().includes(query.trim().toLowerCase());

  const allowedTotal = impact.categories.reduce((s, c) => s + c.allowed, 0);
  const blockedTotal = impact.categories.reduce((s, c) => s + c.blocked, 0);

  const nextSteps: NextStep[] = [
    {
      kind: "handoff",
      icon: ShieldCheck,
      label: "Validate this robots.txt",
      description: "Check the generated block for errors before you ship it.",
      href: "/validate",
      text: impact.text,
    },
    {
      kind: "link",
      icon: FileText,
      label: "Open the full Generator",
      description: "Add disallow paths, a sitemap, and search-engine rules.",
      href: "/generate",
    },
    {
      kind: "handoff",
      icon: Megaphone,
      label: "Explain these rules",
      description: "See exactly what each crawler can and can't do.",
      href: "/explain",
      text: impact.text,
    },
  ];

  return (
    <div>
      <PageHeader
        breadcrumb={["Robots.txt Studio", "AI Crawlers"]}
        title="AI Crawler Manager"
        subtitle="Control which bots can access your website. Changes update the export below instantly."
      />

      {ws ? (
        <WorkspaceBar
          workspace={ws}
          note="crawler toggles seeded from this file"
          onDiscard={discardWorkspace}
        />
      ) : null}

      <InfoPanel title="What are AI crawlers and why do they matter?" className="mb-6">
        AI crawlers collect your content to train language models or power AI answer engines.
        Blocking them keeps your content out of their datasets without affecting search visibility.
      </InfoPanel>

      {/* Starter templates */}
      <SectionHeader className="mb-2">Start from a template</SectionHeader>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {TEMPLATES.map((t) => {
          const active = template === t;
          return (
            <Button
              key={t}
              variant={active ? "brand" : "secondary"}
              size="sm"
              aria-pressed={active}
              onClick={() => applyTemplate(t)}
            >
              {TEMPLATE_LABELS[t]}
            </Button>
          );
        })}
        <span className="mx-1 h-5 w-px bg-border" aria-hidden />
        {/* Highlight = the policy's ACTUAL state, never a static button style. */}
        <Button
          variant={allAiBlocked ? "brand" : "secondary"}
          size="sm"
          aria-pressed={allAiBlocked}
          onClick={() => applyAndClear(blockAllAiCrawlers(policySet))}
        >
          Block all AI
        </Button>
        <Button
          variant={allAiAllowed ? "brand" : "secondary"}
          size="sm"
          aria-pressed={allAiAllowed}
          onClick={() => applyAndClear(allowAllAiCrawlers(policySet))}
        >
          Allow all AI
        </Button>
        <Button variant="ghost" size="sm" onClick={() => applyAndClear(emptyPolicySet())}>
          Reset
        </Button>
      </div>

      {template ? (
        <InfoPanel title={`${TEMPLATE_LABELS[template]} template`} className="mb-6">
          <p>{TEMPLATE_RATIONALE[template].what}</p>
          <p className="mt-1">
            <span className="font-medium text-foreground">Best for:</span>{" "}
            {TEMPLATE_RATIONALE[template].who}
          </p>
        </InfoPanel>
      ) : (
        <p className="mb-6 text-xs text-muted-foreground">
          Pick a template to start, then fine-tune any crawler below — your choices update the file
          live.
        </p>
      )}

      <div className="mb-6 flex items-center gap-2 rounded-lg border border-input bg-card px-3">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search crawlers"
          placeholder="Search crawlers by name or owner…"
          className="h-9 w-full bg-transparent text-sm placeholder:text-muted-foreground focus-visible:outline-none"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        {/* Categories (collapsible, controlled — 17E) */}
        <div className="min-w-0 space-y-4">
          <div className="flex items-center justify-end gap-1 text-xs">
            <button
              type="button"
              onClick={() => setAllOpen(true)}
              className="rounded px-2 py-1 font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Expand all
            </button>
            <span className="text-border" aria-hidden>
              ·
            </span>
            <button
              type="button"
              onClick={() => setAllOpen(false)}
              className="rounded px-2 py-1 font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Collapse all
            </button>
          </div>
          {CATEGORY_ORDER.map((category) => {
            const crawlers = crawlersByCategory(category).filter(matches);
            if (crawlers.length === 0) return null;
            const summary = impact.categories.find((c) => c.category === category)!;
            return (
              <details
                key={category}
                open={openMap[category]}
                className="group overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm"
              >
                {/* Controlled: the summary click flips React state (no native toggle),
                    so Expand/Collapse all and the default rules stay authoritative. */}
                <summary
                  onClick={(e) => {
                    e.preventDefault();
                    toggleOpen(category);
                  }}
                  className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 border-b border-border bg-muted px-4 py-2 [&::-webkit-details-marker]:hidden"
                >
                  <span className="flex items-center gap-2">
                    <ChevronDown
                      className="size-4 text-muted-foreground transition-transform group-open:rotate-180"
                      aria-hidden
                    />
                    <SectionHeader>{CATEGORY_LABELS[category]}</SectionHeader>
                  </span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {summary.allowed} allowed · {summary.blocked} blocked
                  </span>
                  {/* Bulk actions live in the header — no scrolling through rows (17E). */}
                  <span
                    className="ml-auto flex items-center gap-1 text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setCategory(category, "allow")}
                      className="rounded px-1.5 py-0.5 font-medium text-status-allowed-fg hover:bg-status-allowed-bg"
                      title={`Allow every ${CATEGORY_LABELS[category]} crawler`}
                    >
                      Allow all
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategory(category, "block")}
                      className="rounded px-1.5 py-0.5 font-medium text-status-blocked-fg hover:bg-status-blocked-bg"
                      title={`Block every ${CATEGORY_LABELS[category]} crawler`}
                    >
                      Block all
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategory(category, "inherit")}
                      className="rounded px-1.5 py-0.5 font-medium text-muted-foreground hover:bg-muted"
                      title={`Reset ${CATEGORY_LABELS[category]} to inherit the default policy`}
                    >
                      Reset
                    </button>
                  </span>
                </summary>
                <ul className="divide-y divide-border">
                  {crawlers.map((crawler) => {
                    const state = getPermission(policySet, crawler.id);
                    return (
                      <li
                        key={crawler.id}
                        data-crawler-row={crawler.id}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3",
                          highlightId === crawler.id &&
                            "bg-brand-muted shadow-[inset_2px_0_0_0_var(--brand)]",
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <CrawlerBadge name={crawler.name} userAgent={crawler.userAgent} />
                          <p className="mt-1 text-xs text-muted-foreground">
                            {crawler.description}
                          </p>
                        </div>
                        <span
                          title={
                            state === "inherit"
                              ? "Inherited: no explicit rule for this crawler — it follows your default (User-agent: *) policy, which currently allows it. Use the toggle to decide explicitly."
                              : state === "allow"
                                ? "Explicitly allowed by your policy."
                                : "Explicitly blocked: this crawler gets its own Disallow: / group."
                          }
                          className="cursor-help"
                        >
                          <StatusBadge
                            status={badgeStatus(state)}
                            label={state === "inherit" ? "Inherited" : undefined}
                          />
                        </span>
                        <Switch
                          checked={state !== "block"}
                          onCheckedChange={(c) => toggle(crawler.id, c)}
                          aria-label={`Allow ${crawler.name}`}
                        />
                      </li>
                    );
                  })}
                </ul>
              </details>
            );
          })}
        </div>

        {/* Live export + impact */}
        <aside className="min-w-0 space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <SectionHeader>Generated robots.txt</SectionHeader>
              <span
                className="flex items-center gap-1.5 text-xs font-medium text-status-allowed-fg"
                aria-label="Updates live"
              >
                <span className="relative flex size-2" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-allowed-dot opacity-75 motion-reduce:hidden" />
                  <span className="relative inline-flex size-2 rounded-full bg-status-allowed-dot" />
                </span>
                Live
              </span>
            </div>
            <div
              className={cn(
                "rounded-xl ring-brand transition-shadow duration-300",
                justUpdated && "ring-2",
              )}
            >
              <CodePanel code={impact.text} title="robots.txt block" />
            </div>
            <p className="mt-1.5 text-right text-xs tabular-nums text-muted-foreground">
              {allowedTotal} allowed · {blockedTotal} blocked
            </p>

            {/* 17D: commit these choices to the shared working file — explicit and
                previewed, because regeneration replaces comments/custom rules. */}
            {ws && impact.text !== ws.text ? (
              <div className="mt-3 space-y-2 rounded-xl border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground">
                  These choices differ from your working file ({workspaceLabel(ws)}). Applying
                  regenerates it from the toggles above — comments and rules outside the manager's
                  model are replaced (see the preview).
                </p>
                <details>
                  <summary className="cursor-pointer text-xs font-medium text-brand hover:underline">
                    Preview the change
                  </summary>
                  <DiffView
                    before={ws.text}
                    after={impact.text}
                    className="mt-2 max-h-64 text-[11px]"
                  />
                </details>
                <Button size="sm" onClick={applyToWorkspace}>
                  <Check aria-hidden /> Apply to working file
                </Button>
              </div>
            ) : ws ? (
              <p className="mt-2 text-xs font-medium text-status-allowed-fg">
                {syncRef.current !== null
                  ? "Live-syncing — every change here updates the working file."
                  : "Working file is up to date with these choices."}
              </p>
            ) : null}
          </div>

          {impact.recommendations.length > 0 ? (
            <div>
              <SectionHeader className="mb-2">Recommendations</SectionHeader>
              <div className="space-y-2">
                {impact.recommendations.slice(0, 4).map((r, i) => (
                  <RecommendationCard
                    key={`${r.crawlerId ?? r.message}-${i}`}
                    recommendation={{ severity: r.severity, title: r.message, description: "" }}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      <NextSteps steps={nextSteps} />
    </div>
  );
}
