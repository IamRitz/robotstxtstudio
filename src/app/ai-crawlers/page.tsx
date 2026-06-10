import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { ToolRelatedRail, toolAppSchema } from "@/components/tool-related-rail";
import { AiManagerScreen } from "./ai-manager-screen";

export const metadata: Metadata = {
  title: "AI Crawler Manager",
  description: "Control which AI crawlers can access your site — block GPTBot, ClaudeBot, PerplexityBot and more.",
  alternates: { canonical: "/ai-crawlers" },
};

export default function AiCrawlersPage() {
  return (
    <AppShell>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "AI Crawlers", path: "/ai-crawlers" }])} />
      <JsonLd data={toolAppSchema("ai-manager")} />
      <AiManagerScreen />
      <ToolRelatedRail tool="ai-manager" />
    </AppShell>
  );
}
