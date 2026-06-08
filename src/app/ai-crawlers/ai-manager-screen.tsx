"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CATEGORY_LABELS, CATEGORY_ORDER, crawlersByCategory } from "@/config/crawlers";
import { TEMPLATE_LABELS } from "@/features/generator";
import {
  analyzePolicySet,
  blockAllAiCrawlers,
  allowAllAiCrawlers,
  emptyPolicySet,
  fromWebsitePreset,
  getPermission,
  setPermission,
  type PermissionState,
  type PolicySet,
} from "@/features/crawler-manager";
import type { Crawler, WebsiteType } from "@/types";
import { PageHeader } from "@/components/page-header";
import { SectionHeader } from "@/components/section-header";
import { CrawlerBadge } from "@/components/crawler-badge";
import { StatusBadge } from "@/components/status-badge";
import { CodePanel } from "@/components/code-panel";
import { InfoPanel } from "@/components/info-panel";
import { RecommendationCard } from "@/components/recommendation-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const TEMPLATES = Object.keys(TEMPLATE_LABELS) as WebsiteType[];

function badgeStatus(state: PermissionState) {
  return state === "allow" ? "allowed" : state === "block" ? "blocked" : "info";
}

export function AiManagerScreen() {
  const [policySet, setPolicySet] = useState<PolicySet>(emptyPolicySet);
  const [query, setQuery] = useState("");

  const impact = useMemo(() => analyzePolicySet(policySet), [policySet]);

  const toggle = (id: string, checked: boolean) =>
    setPolicySet((prev) => setPermission(prev, id, checked ? "allow" : "block"));

  const matches = (c: Crawler) =>
    `${c.name} ${c.owner}`.toLowerCase().includes(query.trim().toLowerCase());

  const allowedTotal = impact.categories.reduce((s, c) => s + c.allowed, 0);
  const blockedTotal = impact.categories.reduce((s, c) => s + c.blocked, 0);

  return (
    <div>
      <PageHeader
        breadcrumb={["Robots.txt Studio", "AI Crawlers"]}
        title="AI Crawler Manager"
        subtitle="Control which bots can access your website. Changes update the export below instantly."
      />

      <InfoPanel title="What are AI crawlers and why do they matter?" className="mb-6">
        AI crawlers collect your content to train language models or power AI answer engines. Blocking
        them keeps your content out of their datasets without affecting search visibility.
      </InfoPanel>

      {/* Presets */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {TEMPLATES.map((t) => (
          <Button key={t} variant="secondary" size="sm" onClick={() => setPolicySet(fromWebsitePreset(t))}>
            {TEMPLATE_LABELS[t]}
          </Button>
        ))}
        <Button variant="outline" size="sm" onClick={() => setPolicySet((p) => blockAllAiCrawlers(p))}>
          Block all AI
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setPolicySet((p) => allowAllAiCrawlers(p))}>
          Allow all AI
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setPolicySet(emptyPolicySet())}>
          Reset
        </Button>
      </div>

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
        {/* Categories */}
        <div className="space-y-4">
          {CATEGORY_ORDER.map((category) => {
            const crawlers = crawlersByCategory(category).filter(matches);
            if (crawlers.length === 0) return null;
            const summary = impact.categories.find((c) => c.category === category)!;
            return (
              <Card key={category} className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-border bg-muted px-4 py-2">
                  <SectionHeader>{CATEGORY_LABELS[category]}</SectionHeader>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {summary.allowed} allowed · {summary.blocked} blocked
                  </span>
                </div>
                <ul className="divide-y divide-border">
                  {crawlers.map((crawler) => {
                    const state = getPermission(policySet, crawler.id);
                    return (
                      <li key={crawler.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <CrawlerBadge name={crawler.name} userAgent={crawler.userAgent} />
                          <p className="mt-1 text-xs text-muted-foreground">{crawler.description}</p>
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
              </Card>
            );
          })}
        </div>

        {/* Live export + impact */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <SectionHeader>Generated robots.txt</SectionHeader>
              <span className="text-xs tabular-nums text-muted-foreground">
                {allowedTotal} allowed · {blockedTotal} blocked
              </span>
            </div>
            <CodePanel code={impact.text} title="robots.txt block" />
          </div>

          {impact.recommendations.length > 0 ? (
            <div>
              <SectionHeader className="mb-2">Recommendations</SectionHeader>
              <div className="space-y-2">
                {impact.recommendations.slice(0, 4).map((r, i) => (
                  <RecommendationCard key={`${r.crawlerId ?? r.message}-${i}`} recommendation={{ severity: r.severity, title: r.message, description: "" }} />
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
