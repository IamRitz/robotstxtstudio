"use client";

import { useMemo, useState } from "react";
import { Download, Plus, X } from "lucide-react";
import { applyPreset, generatePreview, TEMPLATE_LABELS } from "@/features/generator";
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

export function GeneratorScreen() {
  const [config, setConfig] = useState<GeneratorConfig>(() => applyPreset("blog"));
  const [newPath, setNewPath] = useState("");

  const preview = useMemo(() => generatePreview(config), [config]);

  const setCrawler = (id: string, allow: boolean) =>
    setConfig((c) => ({ ...c, crawlerPolicies: { ...c.crawlerPolicies, [id]: allow ? "allow" : "block" } }));

  const addPath = () => {
    const p = newPath.trim();
    if (!p) return;
    const path = p.startsWith("/") ? p : `/${p}`;
    setConfig((c) => (c.disallowPaths.includes(path) ? c : { ...c, disallowPaths: [...c.disallowPaths, path] }));
    setNewPath("");
  };

  const removePath = (path: string) =>
    setConfig((c) => ({ ...c, disallowPaths: c.disallowPaths.filter((p) => p !== path) }));

  return (
    <div>
      <PageHeader
        breadcrumb={["Robots.txt Studio", "Generate"]}
        title="Generate robots.txt"
        subtitle="Choose which crawlers can access your site — we'll generate the rules automatically."
      />

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
                    <li key={crawler.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <CrawlerBadge name={crawler.name} userAgent={crawler.userAgent} />
                      <Switch checked={allow} onCheckedChange={(c) => setCrawler(crawler.id, c)} aria-label={`Allow ${crawler.name}`} />
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
                <Button variant="secondary" size="md" onClick={addPath}><Plus /> Add</Button>
              </div>
              {config.disallowPaths.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {config.disallowPaths.map((path) => (
                    <Badge key={path} variant="neutral" className="font-mono">
                      {path}
                      <button onClick={() => removePath(path)} aria-label={`Remove ${path}`} className="ml-0.5 hover:text-foreground">
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
                onChange={(e) => setConfig((c) => ({ ...c, sitemapUrl: e.target.value || undefined }))}
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
          </div>

          {preview.validation.isValid ? (
            <Callout status="allowed" title={`Valid · health ${preview.validation.health.value}/100`}>
              {preview.validation.counts.warning} warnings · {preview.validation.counts.info} recommendations
            </Callout>
          ) : (
            <Callout status="blocked" title={`${preview.validation.counts.error} errors found`}>
              Review the rules above.
            </Callout>
          )}

          <InfoPanel title="What this file does">{preview.explanation.summary}</InfoPanel>
        </aside>
      </div>
    </div>
  );
}
