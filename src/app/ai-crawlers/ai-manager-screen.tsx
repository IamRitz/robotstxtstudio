"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, FileText, Megaphone, Search, ShieldCheck } from "lucide-react";
import { CATEGORY_LABELS, CATEGORY_ORDER, crawlersByCategory } from "@/config/crawlers";
import { TEMPLATE_LABELS } from "@/features/generator";
import {
  analyzePolicySet,
  blockAllAiCrawlers,
  allowAllAiCrawlers,
  emptyPolicySet,
  fromWebsitePreset,
  getPermission,
  policySetFromFile,
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
import type { Crawler, WebsiteType } from "@/types";
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

export function AiManagerScreen() {
  const [policySet, setPolicySet] = useState<PolicySet>(emptyPolicySet);
  const [query, setQuery] = useState("");
  /** The active starter template, highlighted until the policy diverges from it. */
  const [template, setTemplate] = useState<WebsiteType | null>(null);
  /** The shared working file this screen is seeded from, if any (17D). */
  const [ws, setWs] = useState<Workspace | null>(null);

  // Seed from the shared workspace (17D): toggles reflect the working file's
  // decisions. Uncommitted intent survives back/forward via sessionStorage, but
  // only while it was based on the SAME workspace text (stale intent is dropped).
  useEffect(() => {
    const current = getWorkspace();
    setWs(current);
    const saved = readSavedUi();
    if (saved.policySet && (saved.basedOnText ?? null) === (current?.text ?? null)) {
      setPolicySet(saved.policySet);
      setTemplate(saved.template ?? null);
      return;
    }
    if (current) {
      setPolicySet(policySetFromFile(parseRobots(current.text)));
      setTemplate(null);
    }
  }, []);

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
    setWs(getWorkspace());
  };

  const discardWorkspace = () => {
    clearWorkspace();
    setWs(null);
    setPolicySet(emptyPolicySet());
    setTemplate(null);
  };

  const impact = useMemo(() => analyzePolicySet(policySet), [policySet]);
  const justUpdated = useJustUpdated(impact.text);

  // Any manual change means the policy no longer matches a template.
  const toggle = (id: string, checked: boolean) => {
    setPolicySet((prev) => setPermission(prev, id, checked ? "allow" : "block"));
    setTemplate(null);
  };
  const applyTemplate = (t: WebsiteType) => {
    setPolicySet(fromWebsitePreset(t));
    setTemplate(t);
  };
  const applyAndClear = (next: PolicySet) => {
    setPolicySet(next);
    setTemplate(null);
  };

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
        <Button
          variant="outline"
          size="sm"
          onClick={() => applyAndClear(blockAllAiCrawlers(policySet))}
        >
          Block all AI
        </Button>
        <Button
          variant="ghost"
          size="sm"
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
        {/* Categories (collapsible) */}
        <div className="min-w-0 space-y-4">
          {CATEGORY_ORDER.map((category) => {
            const crawlers = crawlersByCategory(category).filter(matches);
            if (crawlers.length === 0) return null;
            const summary = impact.categories.find((c) => c.category === category)!;
            return (
              <details
                key={category}
                open
                className="group overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 border-b border-border bg-muted px-4 py-2 [&::-webkit-details-marker]:hidden">
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
                </summary>
                <ul className="divide-y divide-border">
                  {crawlers.map((crawler) => {
                    const state = getPermission(policySet, crawler.id);
                    return (
                      <li key={crawler.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <CrawlerBadge name={crawler.name} userAgent={crawler.userAgent} />
                          <p className="mt-1 text-xs text-muted-foreground">
                            {crawler.description}
                          </p>
                        </div>
                        <StatusBadge
                          status={badgeStatus(state)}
                          label={state === "inherit" ? "Inherited" : undefined}
                        />
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
                Working file is up to date with these choices.
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
