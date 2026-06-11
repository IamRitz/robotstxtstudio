"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Download, Megaphone, Plus, ShieldCheck, X } from "lucide-react";
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
import { DiffView } from "@/components/diff-view";
import { CATEGORY_LABELS, CATEGORY_ORDER, crawlersByCategory } from "@/config/crawlers";
import type { GeneratorConfig, WebsiteType } from "@/types";
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

export function GeneratorScreen() {
  const [config, setConfig] = useState<GeneratorConfig>(() => applyPreset("blog"));
  const [newPath, setNewPath] = useState("");
  /** The shared working file these controls are seeded from, if any (17D). */
  const [ws, setWs] = useState<Workspace | null>(null);

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
    setWs(getWorkspace());
  };

  const discardWorkspace = () => {
    clearWorkspace();
    setWs(null);
    setConfig(applyPreset("blog"));
  };

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

          {CATEGORY_ORDER.map((category) => (
            <Card key={category} className="overflow-hidden">
              <div className="border-b border-border bg-muted px-4 py-2">
                <SectionHeader>{CATEGORY_LABELS[category]}</SectionHeader>
              </div>
              <ul className="divide-y divide-border">
                {crawlersByCategory(category).map((crawler) => {
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
            </Card>
          ))}

          <Card className="space-y-4 p-4">
            <SectionHeader>Advanced rules</SectionHeader>
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
                className="mt-1.5"
              />
            </div>
          </Card>
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
