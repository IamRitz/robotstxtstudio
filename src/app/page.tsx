import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import {
  ArrowRight,
  Bot,
  FileText,
  Megaphone,
  ScanSearch,
  ShieldCheck,
  TestTube,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuickAnalyze } from "@/components/quick-analyze";
import { SectionHeader } from "@/components/section-header";
import { ContinueWorking } from "@/components/continue-working";
import { LockedReport } from "@/components/locked-report";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const TOOL_GROUPS = [
  {
    group: "Analyze",
    tools: [
      {
        title: "Robots.txt Analyzer",
        desc: "Fetch any site's robots.txt and see which search engines and AI crawlers it lets in.",
        href: "/analyze",
        icon: ScanSearch,
      },
      {
        title: "Explainer",
        desc: "Read your robots.txt rules in plain English — no technical knowledge needed.",
        href: "/explain",
        icon: Megaphone,
      },
    ],
  },
  {
    group: "Control",
    tools: [
      {
        title: "AI Crawler Manager",
        desc: "Decide AI training and AI search separately — GPTBot, ClaudeBot, OAI-SearchBot, Google-Extended and more.",
        href: "/ai-crawlers",
        icon: Bot,
        featured: true,
      },
      {
        title: "Generator",
        desc: "Build your robots.txt with a guided visual editor — no coding required.",
        href: "/generate",
        icon: FileText,
      },
    ],
  },
  {
    group: "Verify",
    tools: [
      {
        title: "Validator",
        desc: "Check your robots.txt for syntax errors and warnings before they cause issues.",
        href: "/validate",
        icon: ShieldCheck,
      },
      {
        title: "URL Tester",
        desc: "Test whether a page is blocked or allowed for any crawler.",
        href: "/url-tester",
        icon: TestTube,
      },
    ],
  },
] as const;

const LEARN_LINKS: ReadonlyArray<{ href: Route; title: string; desc: string }> = [
  {
    href: "/what-is-robots-txt",
    title: "What is robots.txt?",
    desc: "The plain-English starting point — what it is and what it can't do.",
  },
  {
    href: "/how-does-robots-txt-work",
    title: "How does it work?",
    desc: "How crawlers fetch, match, and apply your rules.",
  },
  {
    href: "/robots-txt-syntax",
    title: "Syntax reference",
    desc: "Every directive: User-agent, Allow, Disallow, wildcards, Sitemap.",
  },
  {
    href: "/robots-txt-examples",
    title: "Examples",
    desc: "Copy-paste files for blogs, WordPress, ecommerce, and AI.",
  },
  {
    href: "/robots-txt-seo-guide",
    title: "robots.txt for SEO",
    desc: "Best practices that help — and the traps that hurt rankings.",
  },
  {
    href: "/robots-txt-vs-noindex",
    title: "robots.txt vs noindex",
    desc: "Why blocking a page doesn't remove it from Google.",
  },
];

// Phase 19B — direct homepage authority to the highest-intent pages so each is one
// click from home. The tool landings were consolidated into the tools (2026-10), so
// the second group now points at the platform guides instead of duplicating the
// tool cards above.
const RESOURCE_GROUPS: ReadonlyArray<{
  title: string;
  links: ReadonlyArray<{ href: Route; title: string; desc: string }>;
}> = [
  {
    title: "Control AI crawlers",
    links: [
      {
        href: "/ai-crawlers-directory",
        title: "AI Crawler Directory",
        desc: "Every AI bot, what it does, and how to block it.",
      },
      {
        href: "/block-ai-crawlers",
        title: "How to Block AI Crawlers",
        desc: "The complete robots.txt blocking playbook.",
      },
      {
        href: "/gptbot-robots-txt",
        title: "Block GPTBot",
        desc: "Opt out of OpenAI's training crawler.",
      },
      {
        href: "/claudebot-robots-txt",
        title: "Block ClaudeBot",
        desc: "Control Anthropic's crawler.",
      },
      {
        href: "/google-extended-robots-txt",
        title: "Google-Extended",
        desc: "Keep content out of Gemini training.",
      },
      {
        href: "/ccbot-robots-txt",
        title: "Block CCBot",
        desc: "Stop Common Crawl's open dataset.",
      },
    ],
  },
  {
    title: "robots.txt by platform",
    links: [
      {
        href: "/wordpress-robots-txt",
        title: "WordPress robots.txt",
        desc: "Edit the virtual file safely.",
      },
      {
        href: "/shopify-robots-txt",
        title: "Shopify robots.txt",
        desc: "Customize robots.txt.liquid.",
      },
      {
        href: "/nextjs-robots-txt",
        title: "Next.js robots.txt",
        desc: "Generate it from app/robots.ts.",
      },
      {
        href: "/magento-robots-txt",
        title: "Magento robots.txt",
        desc: "Tame faceted navigation.",
      },
    ],
  },
];

export default function HomePage() {
  return (
    <AppShell>
      {/* Hero */}
      <section className="mx-auto max-w-3xl pt-8 text-center sm:pt-12">
        <Badge variant="brand" className="mx-auto">
          Free robots.txt checker
        </Badge>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Check your robots.txt: who can crawl your site?
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          Enter a domain to see which search engines, AI search crawlers, and AI training crawlers
          its robots.txt allows — with every error and a fix.
        </p>
        <QuickAnalyze className="mx-auto mt-8 max-w-xl" />
        <p className="mt-3 text-xs text-muted-foreground">
          or{" "}
          <Link href="/validate" className="font-medium text-brand hover:underline">
            paste a file into the validator
          </Link>{" "}
          ·{" "}
          <Link href="/generate" className="font-medium text-brand hover:underline">
            create a new one
          </Link>
        </p>
      </section>

      {/* Returning users: their recent analyses, resumable in one click (Phase 17C).
          Strangers: the locked-report teaser (Phase 14C), unchanged. */}
      <div className="mx-auto mt-12 max-w-3xl">
        <ContinueWorking
          fallback={
            <>
              <SectionHeader className="mb-3">Your crawler report</SectionHeader>
              <LockedReport
                title="Unlock your full crawler report"
                description="Run a free analysis to reveal your search visibility score, AI-crawler access, and every robots.txt issue — no sign-up required."
                action={
                  <>
                    <Link
                      href="/analyze"
                      className={buttonVariants({ variant: "brand", size: "lg" })}
                    >
                      <ScanSearch /> Run free analysis
                    </Link>
                    <span className="text-xs text-muted-foreground">Takes about 5 seconds</span>
                  </>
                }
              />
            </>
          }
        />
      </div>

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
                        className={
                          featured
                            ? "h-full bg-surface-dark p-5 text-surface-dark-foreground"
                            : "h-full p-5"
                        }
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
                        <p
                          className={
                            featured
                              ? "mt-1 text-sm text-surface-dark-foreground/70"
                              : "mt-1 text-sm text-muted-foreground"
                          }
                        >
                          {tool.desc}
                        </p>
                        <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand">
                          Open{" "}
                          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
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
            <h2 className="text-lg font-semibold text-foreground">
              AI training and AI search are separate choices
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Opt out of training (GPTBot, ClaudeBot, Google-Extended) while still letting AI search
              crawlers (OAI-SearchBot, Claude-SearchBot, PerplexityBot) cite and link you — or block
              both. robots.txt is a request to compliant crawlers, not access control. See the full{" "}
              <Link
                href="/ai-crawlers-directory"
                className="font-medium text-brand hover:underline"
              >
                AI crawler directory
              </Link>
              .
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

      {/* Popular resources — direct authority to the highest-intent pages (Phase 19B).
          Mobile: 2-up, title-only chips so it stays compact below the tools.
          Desktop: two columns with descriptions. */}
      <section className="mt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Popular robots.txt resources
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Guides for controlling AI crawlers and setting up robots.txt on common platforms.
          </p>
        </div>
        <div className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {RESOURCE_GROUPS.map((group) => (
            <div key={group.title}>
              <SectionHeader className="mb-2 sm:mb-3">{group.title}</SectionHeader>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5 sm:grid-cols-1">
                {group.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="group block rounded-lg px-2 py-1.5 transition-colors hover:bg-muted sm:px-3 sm:py-2"
                    >
                      <span className="flex items-center gap-1.5 text-sm font-medium text-foreground group-hover:text-brand">
                        {l.title}
                        <ArrowRight className="hidden size-3 shrink-0 transition-transform group-hover:translate-x-0.5 sm:inline-block" />
                      </span>
                      <span className="mt-0.5 hidden text-xs text-muted-foreground sm:block">
                        {l.desc}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Learn / educational cluster */}
      <section className="mt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Learn robots.txt</h2>
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
                  Read{" "}
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
