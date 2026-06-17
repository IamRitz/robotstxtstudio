import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { ToolRelatedRail, toolAppSchema } from "@/components/tool-related-rail";
import { AnalyzerScreen } from "./analyzer-screen";

export const metadata: Metadata = {
  title: "Robots.txt Analyzer — Audit Crawler Access & AI Visibility",
  description:
    "Analyze crawler access, AI visibility, and robots.txt issues for any site in one audit.",
  alternates: { canonical: "/analyze" },
};

export default async function AnalyzePage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string; fresh?: string }>;
}) {
  const { domain, fresh } = await searchParams;
  return (
    <AppShell>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Analyze", path: "/analyze" },
        ])}
      />
      <JsonLd data={toolAppSchema("analyzer")} />
      <AnalyzerScreen initialDomain={domain ?? ""} forceFresh={fresh === "1"} />
      {/* Collapsed during remediation — the report is the page's job. The rail
          stays in the DOM (SEO/internal links) but costs one line. */}
      <details className="mt-12">
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground">
          More tools & related guides
        </summary>
        <ToolRelatedRail tool="analyzer" />
      </details>
    </AppShell>
  );
}
