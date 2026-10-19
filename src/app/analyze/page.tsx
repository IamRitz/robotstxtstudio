import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { ToolRelatedRail, toolAppSchema } from "@/components/tool-related-rail";
import { ToolGuideSection } from "@/components/tool-guide";
import { ANALYZER_GUIDE } from "@/config/tool-guides";
import { AnalyzerScreen } from "./analyzer-screen";

export const metadata: Metadata = {
  title: "Robots.txt Analyzer — Check Search & AI Crawler Access for Any Site",
  description:
    "Fetch any site's live robots.txt and see which search engines, AI search crawlers, and AI training crawlers it allows, plus every issue and a fix. Failed fetches are reported as unknown, never as allow-all.",
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
      <ToolGuideSection guide={ANALYZER_GUIDE} />
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
