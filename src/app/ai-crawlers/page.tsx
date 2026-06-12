import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { ToolRelatedRail, toolAppSchema } from "@/components/tool-related-rail";
import { AiManagerScreen } from "./ai-manager-screen";

export const metadata: Metadata = {
  title: "AI Crawler Manager — Block GPTBot, ClaudeBot & PerplexityBot",
  description:
    "Allow or block every AI crawler — GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot — in one click and download the robots.txt. Free, no signup.",
  alternates: { canonical: "/ai-crawlers" },
};

export default async function AiCrawlersPage({
  searchParams,
}: {
  searchParams: Promise<{ focus?: string }>;
}) {
  const { focus } = await searchParams;
  return (
    <AppShell>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "AI Crawlers", path: "/ai-crawlers" },
        ])}
      />
      <JsonLd data={toolAppSchema("ai-manager")} />
      <AiManagerScreen focusCrawlerId={focus} />
      <ToolRelatedRail tool="ai-manager" />
    </AppShell>
  );
}
