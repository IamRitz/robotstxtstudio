"use client";

import { useEffect, useMemo, useState } from "react";
import { Megaphone, ShieldCheck, ShieldOff } from "lucide-react";
import { parseRobots } from "@/parser";
import { testUrl } from "@/features/tester";
import { ALL_CRAWLERS } from "@/config/crawlers";
import type { TestTraceStatus } from "@/types";
import { takeHandoff } from "@/lib/handoff";
import { PageHeader } from "@/components/page-header";
import { SectionHeader } from "@/components/section-header";
import { STATUS_VISUALS, type StatusKey } from "@/components/severity";
import { EmptyState } from "@/components/empty-state";
import { NextSteps, type NextStep } from "@/components/next-steps";
import { Card } from "@/components/ui/card";
import { RobotsSourceField } from "@/components/robots-source-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const SAMPLE = `User-agent: *
Disallow: /admin/
Allow: /admin/public/

User-agent: GPTBot
Disallow: /`;

const TRACE_STATUS: Record<TestTraceStatus, StatusKey> = {
  allowed: "allowed",
  blocked: "blocked",
  pass: "allowed",
  info: "info",
};

const CHIPS = ["GPTBot", "Googlebot", "Bingbot", "ClaudeBot", "PerplexityBot"];

export function TesterScreen() {
  const [source, setSource] = useState(SAMPLE);
  const [url, setUrl] = useState("/admin/login");
  const [userAgent, setUserAgent] = useState("GPTBot");

  const result = useMemo(() => {
    if (!url.trim()) return null;
    return testUrl(parseRobots(source), url, userAgent);
  }, [source, url, userAgent]);

  const verdict: StatusKey = result?.decision === "blocked" ? "blocked" : "allowed";
  const VerdictIcon = result?.decision === "blocked" ? ShieldOff : ShieldCheck;

  // Load a robots.txt handed off from another tool ("Test against this").
  useEffect(() => {
    const handed = takeHandoff();
    if (handed) setSource(handed);
  }, []);

  const nextSteps: NextStep[] = [
    {
      kind: "handoff",
      icon: ShieldCheck,
      label: "Validate this robots.txt",
      description: "Catch syntax errors and best-practice warnings.",
      href: "/validate",
      text: source,
    },
    {
      kind: "handoff",
      icon: Megaphone,
      label: "Explain these rules",
      description: "Read what the file does in plain English.",
      href: "/explain",
      text: source,
    },
  ];

  return (
    <div>
      <PageHeader
        breadcrumb={["Robots.txt Studio", "URL Tester"]}
        title="Robots.txt Tester"
        subtitle="Check whether a URL is blocked or allowed for any crawler, and see exactly which rule decided it."
      />

      <Card className="mb-6 grid gap-4 p-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label>robots.txt</Label>
          <div className="mt-1.5">
            <RobotsSourceField value={source} onChange={setSource} rows={8} />
          </div>
        </div>
        <div>
          <Label htmlFor="url">URL to test</Label>
          <Input
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="/blog/my-post"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="ua">User-agent</Label>
          <Select
            id="ua"
            value={userAgent}
            onChange={(e) => setUserAgent(e.target.value)}
            className="mt-1.5 w-full"
          >
            <option value="*">* (all crawlers)</option>
            {ALL_CRAWLERS.map((c) => (
              <option key={c.id} value={c.userAgent}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          {CHIPS.map((chip) => (
            <Button
              key={chip}
              variant={userAgent === chip ? "brand" : "secondary"}
              size="sm"
              onClick={() => setUserAgent(chip)}
            >
              {chip}
            </Button>
          ))}
        </div>
      </Card>

      {!result ? (
        <EmptyState
          title="Enter a URL to test"
          description="Type a path or URL above to see whether it is blocked or allowed."
        />
      ) : (
        <div className="space-y-6">
          {/* Verdict */}
          <Card className={cn("flex items-center gap-4 p-6", STATUS_VISUALS[verdict].chip)}>
            <VerdictIcon className="size-8" aria-hidden />
            <div>
              <p className="text-2xl font-bold uppercase">{result.decision}</p>
              <p className="mt-1 text-sm">{result.reason}</p>
            </div>
          </Card>

          {/* Matched rule */}
          {result.matchedRule ? (
            <Card className="p-6">
              <SectionHeader className="mb-3">Matched rule</SectionHeader>
              <div className="rounded-lg bg-surface-dark p-4 font-mono text-xs text-surface-dark-foreground">
                <div className="text-surface-dark-foreground/60">
                  User-agent: {result.matchedUserAgent}
                </div>
                <div className="font-semibold">
                  {result.matchedRule.type === "allow" ? "Allow" : "Disallow"}:{" "}
                  {result.matchedRule.path}
                </div>
              </div>
            </Card>
          ) : null}

          {/* Trace */}
          <Card className="p-6">
            <SectionHeader className="mb-4">Rule trace</SectionHeader>
            <ol className="space-y-3">
              {result.trace.map((step) => {
                const sk = TRACE_STATUS[step.status];
                const Icon = STATUS_VISUALS[sk].icon;
                return (
                  <li key={step.step} className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full",
                        STATUS_VISUALS[sk].chip,
                      )}
                      aria-hidden
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {step.step}. {step.label}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{step.detail}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>
        </div>
      )}

      <NextSteps steps={nextSteps} />
    </div>
  );
}
