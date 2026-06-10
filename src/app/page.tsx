import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, Bot, FileText, Megaphone, ScanSearch, ShieldCheck, TestTube } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuickAnalyze } from "@/components/quick-analyze";
import { SectionHeader } from "@/components/section-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";

const TOOL_GROUPS = [
  {
    group: "Analyze",
    tools: [
      { title: "Crawler Visibility Audit", desc: "See who can access your site and where your visibility gaps are.", href: "/analyze", icon: ScanSearch },
      { title: "Explainer", desc: "Read your robots.txt rules in plain English — no technical knowledge needed.", href: "/explain", icon: Megaphone },
    ],
  },
  {
    group: "Control",
    tools: [
      { title: "AI Crawler Manager", desc: "Decide which AI companies can train on your content — block GPTBot, ClaudeBot, and 18 more.", href: "/ai-crawlers", icon: Bot, featured: true },
      { title: "Generator", desc: "Build your robots.txt with a guided visual editor — no coding required.", href: "/generate", icon: FileText },
    ],
  },
  {
    group: "Verify",
    tools: [
      { title: "Validator", desc: "Check your robots.txt for syntax errors and warnings before they cause issues.", href: "/validate", icon: ShieldCheck },
      { title: "URL Tester", desc: "Test whether a page is blocked or allowed for any crawler.", href: "/url-tester", icon: TestTube },
    ],
  },
] as const;

const LEARN_LINKS: ReadonlyArray<{ href: Route; title: string; desc: string }> = [
  { href: "/what-is-robots-txt", title: "What is robots.txt?", desc: "The plain-English starting point — what it is and what it can't do." },
  { href: "/how-does-robots-txt-work", title: "How does it work?", desc: "How crawlers fetch, match, and apply your rules." },
  { href: "/robots-txt-syntax", title: "Syntax reference", desc: "Every directive: User-agent, Allow, Disallow, wildcards, Sitemap." },
  { href: "/robots-txt-examples", title: "Examples", desc: "Copy-paste files for blogs, WordPress, ecommerce, and AI." },
  { href: "/robots-txt-seo-guide", title: "robots.txt for SEO", desc: "Best practices that help — and the traps that hurt rankings." },
  { href: "/why-robots-txt-is-important", title: "Why it matters", desc: "Crawl budget, AI access, and the cost of getting it wrong." },
];

const PREVIEW_CRAWLERS = [
  { name: "Google", status: "allowed" as const },
  { name: "Bing", status: "allowed" as const },
  { name: "GPTBot", status: "blocked" as const },
  { name: "ClaudeBot", status: "blocked" as const },
  { name: "PerplexityBot", status: "allowed" as const },
];

export default function HomePage() {
  return (
    <AppShell>
      {/* Hero */}
      <section className="mx-auto max-w-3xl pt-8 text-center sm:pt-12">
        <Badge variant="brand" className="mx-auto">Crawler Visibility &amp; Permissions Platform</Badge>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Who Can See Your Website?
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          See which search engines and AI bots can access your site — and take control in seconds.
        </p>
        <QuickAnalyze className="mx-auto mt-8 max-w-xl" />
        <p className="mt-3 text-xs text-muted-foreground">
          or{" "}
          <Link href="/generate" className="font-medium text-brand hover:underline">
            create your robots.txt file
          </Link>
        </p>
      </section>

      {/* Crawler access preview */}
      <Card className="mx-auto mt-12 max-w-3xl p-5">
        <SectionHeader className="mb-3">Crawler access preview</SectionHeader>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {PREVIEW_CRAWLERS.map((c) => (
            <div key={c.name} className="flex flex-col items-center gap-2 rounded-lg border border-border p-3">
              <span className="text-xs font-semibold text-foreground">{c.name}</span>
              <StatusBadge status={c.status} />
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Analyze your site to unlock the full report.
        </p>
      </Card>

      {/* Feature overview */}
      <section className="mt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Everything you need to manage crawler access
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Six powerful tools in one platform — no sign-up required to get started.
          </p>
        </div>
        <div className="mt-8 space-y-8">
          {TOOL_GROUPS.map((group) => (
            <div key={group.group}>
              <SectionHeader className="mb-3">{group.group}</SectionHeader>
              <div className="grid gap-4 sm:grid-cols-2">
                {group.tools.map((tool) => {
                  const Icon = tool.icon;
                  const featured = "featured" in tool && tool.featured;
                  return (
                    <Link key={tool.href} href={tool.href} className="group">
                      <Card
                        className={featured ? "h-full bg-primary p-5 text-primary-foreground" : "h-full p-5"}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={
                              featured
                                ? "flex size-9 items-center justify-center rounded-lg bg-brand text-brand-foreground"
                                : "flex size-9 items-center justify-center rounded-lg bg-muted text-foreground"
                            }
                          >
                            <Icon className="size-4" aria-hidden />
                          </span>
                          {featured ? <Badge variant="brand">AI</Badge> : null}
                        </div>
                        <h3 className="mt-3 text-base font-semibold">{tool.title}</h3>
                        <p className={featured ? "mt-1 text-sm text-white/70" : "mt-1 text-sm text-muted-foreground"}>
                          {tool.desc}
                        </p>
                        <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand">
                          Open <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI visibility */}
      <section className="mt-16">
        <Card className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <SectionHeader className="mb-2">AI visibility</SectionHeader>
            <h2 className="text-lg font-semibold text-foreground">Control how AI trains on your content</h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              GPTBot, ClaudeBot, PerplexityBot, Google-Extended and more — allow or block each with one click.
            </p>
          </div>
          <Link
            href="/ai-crawlers"
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-brand px-4 py-2 text-xs font-medium text-brand-foreground hover:opacity-90"
          >
            Manage AI access <ArrowRight className="size-3" />
          </Link>
        </Card>
      </section>

      {/* Learn / educational cluster */}
      <section className="mt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Learn robots.txt
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Practitioner guides — from the basics to SEO best practices and AI crawlers.
          </p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LEARN_LINKS.map((g) => (
            <Link key={g.href} href={g.href} className="group">
              <Card className="h-full p-4">
                <h3 className="text-sm font-semibold text-foreground">{g.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{g.desc}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand">
                  Read <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent activity placeholder */}
      <section className="mt-16">
        <SectionHeader className="mb-3">Recent activity</SectionHeader>
        <EmptyState
          icon={ScanSearch}
          title="No recent analyses yet"
          description="Your recently analyzed sites will appear here. Saved history is coming soon."
        />
      </section>
    </AppShell>
  );
}
