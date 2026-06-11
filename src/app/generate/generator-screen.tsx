"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Download, Megaphone, Plus, ShieldCheck, X } from "lucide-react";
import { applyPreset, generatePreview, TEMPLATE_LABELS } from "@/features/generator";
import { policySetFromFile, toGeneratorConfig } from "@/features/crawler-manager";
import { parseRobots } from "@/parser";
import {
  clearWorkspace,
  getWorkspace,
  setWorkspace,
  workspaceLabel,
  type Workspace,
} from "@/lib/workspace";
import { WorkspaceBar } from "@/components/workspace-bar";
import { cn } from "@/lib/utils";
import { DiffView } from "@/components/diff-view";
import { CATEGORY_LABELS, CATEGORY_ORDER, crawlersByCategory } from "@/config/crawlers";
import type { CrawlerCategory, GeneratorConfig, WebsiteType } from "@/types";
import { PageHeader } from "@/components/page-header";
import { SectionHeader } from "@/components/section-header";
import { CrawlerBadge } from "@/components/crawler-badge";
import { CodePanel } from "@/components/code-panel";
import { Callout } from "@/components/callout";
import { InfoPanel } from "@/components/info-panel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { NextSteps, type NextStep } from "@/components/next-steps";

const TEMPLATES = Object.keys(TEMPLATE_LABELS) as WebsiteType[];

function download(text: string) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "robots.txt";
  a.click();
  URL.revokeObjectURL(url);
}

/** Same default collapse rule as the AI Manager (17E): expanded only for groups
 *  with active work — an explicit decision AND at least one enabled crawler. */
function defaultOpenMap(config: GeneratorConfig): Record<CrawlerCategory, boolean> {
  const map = {} as Record<CrawlerCategory, boolean>;
  for (const category of CATEGORY_ORDER) {
    const crawlers = crawlersByCategory(category);
    const enabled = crawlers.filter((c) => config.crawlerPolicies[c.id] !== "block").length;
    const explicit = crawlers.some((c) => c.id in config.crawlerPolicies);
    map[category] = enabled > 0 && explicit;
  }
  return map;
}

const UI_KEY = "rs:generator-ui";

interface SavedGeneratorUi {
  config?: GeneratorConfig;
  /** The workspace text the saved config was based on — stale saves are dropped. */
  basedOnText?: string | null;
}

function readSavedUi(): SavedGeneratorUi {
  try {
    return (JSON.parse(sessionStorage.getItem(UI_KEY) ?? "{}") as SavedGeneratorUi) ?? {};
  } catch {
    return {};
  }
}

export function GeneratorScreen({
  focusSection,
}: {
  /** Deep-link target (17F.2): "sitemap" lands on the sitemap field, in view. */
  focusSection?: string;
}) {
  const [config, setConfig] = useState<GeneratorConfig>(() => applyPreset("blog"));
  const [newPath, setNewPath] = useState("");
  /** The shared working file these controls are seeded from, if any (17D). */
  const [ws, setWs] = useState<Workspace | null>(null);
  /** Per-category expansion. `null` = derive defaults from the current config. */
  const [open, setOpen] = useState<Record<CrawlerCategory, boolean> | null>(null);
  /** Live-sync (17E): the workspace text WE last wrote; null = not syncing. */
  const syncRef = useRef<string | null>(null);
  /** Briefly emphasized field (deep-link landing — 17F.2). */
  const [highlightSitemap, setHighlightSitemap] = useState(false);

  useEffect(() => {
    if (focusSection !== "sitemap") return;
    setHighlightSitemap(true);
    const scroll = window.setTimeout(() => {
      document.getElementById("sitemap")?.scrollIntoView({ block: "center" });
      document.getElementById("sitemap")?.focus({ preventScroll: true });
    }, 80);
    const clear = window.setTimeout(() => setHighlightSitemap(false), 2200);
    return () => {
      window.clearTimeout(scroll);
      window.clearTimeout(clear);
    };
  }, [focusSection]);

  // Seed from the shared workspace (17D); uncommitted control state survives
  // back/forward per tab, dropped when the underlying workspace text changed.
  useEffect(() => {
    const current = getWorkspace();
    setWs(current);
    const saved = readSavedUi();
    if (saved.config && (saved.basedOnText ?? null) === (current?.text ?? null)) {
      setConfig(saved.config);
      return;
    }
    if (current) {
      setConfig(toGeneratorConfig(policySetFromFile(parseRobots(current.text))));
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(UI_KEY, JSON.stringify({ config, basedOnText: ws?.text ?? null }));
    } catch {
      // session nicety only
    }
  }, [config, ws]);

  const preview = useMemo(() => generatePreview(config), [config]);

  // Live-sync (17E): once the working file IS the generated file, regeneration
  // loses nothing — every control change updates the workspace immediately.
  // A foreign edit (text ≠ our last write) drops sync.
  useEffect(() => {
    if (!ws || syncRef.current === null) return;
    if (ws.text !== syncRef.current) {
      syncRef.current = null;
      return;
    }
    if (preview.text === ws.text) return;
    setWorkspace({
      domain: ws.domain,
      originalText: ws.originalText,
      text: preview.text,
      appliedFixes: ws.appliedFixes,
      source: "generator",
    });
    syncRef.current = preview.text;
    setWs(getWorkspace());
  }, [preview.text, ws]);

  /** Commit the generated file as the new working file (explicit, previewed). */
  const applyToWorkspace = () => {
    if (ws) {
      setWorkspace({
        domain: ws.domain,
        originalText: ws.originalText,
        text: preview.text,
        appliedFixes: ws.appliedFixes,
        source: "generator",
      });
    } else {
      // Starting fresh: the generated file BECOMES the workspace.
      setWorkspace({
        originalText: preview.text,
        text: preview.text,
        appliedFixes: [],
        source: "generator",
      });
    }
    syncRef.current = preview.text;
    setWs(getWorkspace());
  };

  const discardWorkspace = () => {
    clearWorkspace();
    syncRef.current = null;
    setWs(null);
    setConfig(applyPreset("blog"));
  };

  const openMap = open ?? defaultOpenMap(config);
  const toggleOpen = (category: CrawlerCategory) =>
    setOpen({ ...openMap, [category]: !openMap[category] });
  const setAllOpen = (value: boolean) =>
    setOpen(
      Object.fromEntries(CATEGORY_ORDER.map((c) => [c, value])) as Record<CrawlerCategory, boolean>,
    );

  /** Header bulk action: decide a whole group in ONE click (17E). */
  const setCategory = (category: CrawlerCategory, allow: boolean) => {
    setConfig((c) => ({
      ...c,
      crawlerPolicies: {
        ...c.crawlerPolicies,
        ...Object.fromEntries(
          crawlersByCategory(category).map((cr) => [cr.id, allow ? "allow" : "block"]),
        ),
      },
    }));
    if (!openMap[category]) setOpen({ ...openMap, [category]: true });
  };

  /** Global bulk action across every category. */
  const setAllCrawlers = (allow: boolean) =>
    setConfig((c) => ({
      ...c,
      crawlerPolicies: Object.fromEntries(
        CATEGORY_ORDER.flatMap((cat) =>
          crawlersByCategory(cat).map((cr) => [cr.id, allow ? "allow" : "block"]),
        ),
      ),
    }));

  const setCrawler = (id: string, allow: boolean) =>
    setConfig((c) => ({
      ...c,
      crawlerPolicies: { ...c.crawlerPolicies, [id]: allow ? "allow" : "block" },
    }));

  const addPath = () => {
    const p = newPath.trim();
    if (!p) return;
    const path = p.startsWith("/") ? p : `/${p}`;
    setConfig((c) =>
      c.disallowPaths.includes(path) ? c : { ...c, disallowPaths: [...c.disallowPaths, path] },
    );
    setNewPath("");
  };

  const removePath = (path: string) =>
    setConfig((c) => ({ ...c, disallowPaths: c.disallowPaths.filter((p) => p !== path) }));

  const nextSteps: NextStep[] = [
    {
      kind: "handoff",
      icon: ShieldCheck,
      label: "Validate this file",
      description: "Confirm it's error-free before you deploy.",
      href: "/validate",
      text: preview.text,
    },
    {
      kind: "handoff",
      icon: Megaphone,
      label: "Explain in plain English",
      description: "Double-check the rules do what you expect.",
      href: "/explain",
      text: preview.text,
    },
    {
      kind: "download",
      icon: Download,
      label: "Download robots.txt",
      description: "Save the generated file to your project root.",
      text: preview.text,
      filename: "robots.txt",
    },
  ];

  return (
    <div>
      <PageHeader
        breadcrumb={["Robots.txt Studio", "Generate"]}
        title="Generate robots.txt"
        subtitle="Choose which crawlers can access your site — we'll generate the rules automatically."
      />

      {ws ? (
        <WorkspaceBar
          workspace={ws}
          note="controls seeded from this file"
          onDiscard={discardWorkspace}
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        {/* Controls */}
        <div className="space-y-4">
          <Card className="p-4">
            <SectionHeader className="mb-3">Starter template</SectionHeader>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <Button
                  key={t}
                  variant={config.template === t ? "brand" : "secondary"}
                  size="sm"
                  onClick={() => setConfig(applyPreset(t))}
                >
                  {TEMPLATE_LABELS[t]}
                </Button>
              ))}
            </div>
          </Card>

          {/* Global bulk + expand controls — decide everything without scrolling (17E). */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setAllCrawlers(true)}
                className="rounded px-2 py-1 font-medium text-status-allowed-fg hover:bg-status-allowed-bg"
              >
                Allow all crawlers
              </button>
              <button
                type="button"
                onClick={() => setAllCrawlers(false)}
                className="rounded px-2 py-1 font-medium text-status-blocked-fg hover:bg-status-blocked-bg"
              >
                Block all crawlers
              </button>
            </span>
            <span className="flex items-center gap-1">
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
            </span>
          </div>

          {CATEGORY_ORDER.map((category) => {
            const crawlers = crawlersByCategory(category);
            const allowed = crawlers.filter((c) => config.crawlerPolicies[c.id] !== "block").length;
            return (
              <details
                key={category}
                open={openMap[category]}
                className="group overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm"
              >
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
                    {allowed}/{crawlers.length} allowed
                  </span>
                  <span
                    className="ml-auto flex items-center gap-1 text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setCategory(category, true)}
                      className="rounded px-1.5 py-0.5 font-medium text-status-allowed-fg hover:bg-status-allowed-bg"
                      title={`Allow every ${CATEGORY_LABELS[category]} crawler`}
                    >
                      Allow all
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategory(category, false)}
                      className="rounded px-1.5 py-0.5 font-medium text-status-blocked-fg hover:bg-status-blocked-bg"
                      title={`Block every ${CATEGORY_LABELS[category]} crawler`}
                    >
                      Block all
                    </button>
                  </span>
                </summary>
                <ul className="divide-y divide-border">
                  {crawlers.map((crawler) => {
                    const allow = config.crawlerPolicies[crawler.id] !== "block";
                    return (
                      <li
                        key={crawler.id}
                        className="flex items-center justify-between gap-3 px-4 py-2.5"
                      >
                        <CrawlerBadge name={crawler.name} userAgent={crawler.userAgent} />
                        <Switch
                          checked={allow}
                          onCheckedChange={(c) => setCrawler(crawler.id, c)}
                          aria-label={`Allow ${crawler.name}`}
                        />
                      </li>
                    );
                  })}
                </ul>
              </details>
            );
          })}

          <details
            open
            className="group overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm"
          >
            <summary className="flex cursor-pointer list-none items-center gap-2 border-b border-border bg-muted px-4 py-2 [&::-webkit-details-marker]:hidden">
              <ChevronDown
                className="size-4 text-muted-foreground transition-transform group-open:rotate-180"
                aria-hidden
              />
              <SectionHeader>Advanced rules</SectionHeader>
            </summary>
            <div className="space-y-4 p-4">
              <div>
                <Label>Disallow paths</Label>
                <div className="mt-1.5 flex gap-2">
                  <Input
                    value={newPath}
                    onChange={(e) => setNewPath(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPath())}
                    placeholder="/admin/"
                  />
                  <Button variant="secondary" size="md" onClick={addPath}>
                    <Plus /> Add
                  </Button>
                </div>
                {config.disallowPaths.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {config.disallowPaths.map((path) => (
                      <Badge key={path} variant="neutral" className="font-mono">
                        {path}
                        <button
                          onClick={() => removePath(path)}
                          aria-label={`Remove ${path}`}
                          className="ml-0.5 hover:text-foreground"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
              <div>
                <Label htmlFor="sitemap">Sitemap URL</Label>
                <Input
                  id="sitemap"
                  value={config.sitemapUrl ?? ""}
                  onChange={(e) =>
                    setConfig((c) => ({ ...c, sitemapUrl: e.target.value || undefined }))
                  }
                  placeholder="https://example.com/sitemap.xml"
                  className={cn("mt-1.5", highlightSitemap && "ring-2 ring-brand")}
                />
              </div>
            </div>
          </details>
        </div>

        {/* Preview */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <SectionHeader>Live preview</SectionHeader>
              <Button variant="secondary" size="sm" onClick={() => download(preview.text)}>
                <Download /> Download
              </Button>
            </div>
            <CodePanel code={preview.text} />

            {/* 17D: commit the generated file to the shared workspace — explicit
                and previewed, because regeneration replaces comments/custom rules. */}
            {ws && preview.text !== ws.text ? (
              <div className="mt-3 space-y-2 rounded-xl border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground">
                  This differs from your working file ({workspaceLabel(ws)}). Applying replaces it
                  with the generated file (see the preview).
                </p>
                <details>
                  <summary className="cursor-pointer text-xs font-medium text-brand hover:underline">
                    Preview the change
                  </summary>
                  <DiffView
                    before={ws.text}
                    after={preview.text}
                    className="mt-2 max-h-64 text-[11px]"
                  />
                </details>
                <Button size="sm" onClick={applyToWorkspace}>
                  <Check aria-hidden /> Apply to working file
                </Button>
              </div>
            ) : ws ? (
              <p className="mt-2 text-xs font-medium text-status-allowed-fg">
                Working file is up to date with these controls.
              </p>
            ) : (
              <Button size="sm" variant="secondary" className="mt-3" onClick={applyToWorkspace}>
                <Check aria-hidden /> Use as working file
              </Button>
            )}
          </div>

          {preview.validation.isValid ? (
            <Callout
              status="allowed"
              title={`Valid · health ${preview.validation.health.value}/100`}
            >
              {preview.validation.counts.warning} warnings · {preview.validation.counts.info}{" "}
              recommendations
            </Callout>
          ) : (
            <Callout status="blocked" title={`${preview.validation.counts.error} errors found`}>
              Review the rules above.
            </Callout>
          )}

          <InfoPanel title="What this file does">{preview.explanation.summary}</InfoPanel>
        </aside>
      </div>

      <NextSteps steps={nextSteps} />
    </div>
  );
}
