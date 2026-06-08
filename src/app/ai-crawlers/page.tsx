import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { AiManagerScreen } from "./ai-manager-screen";

export const metadata: Metadata = {
  title: "AI Crawler Manager",
  description: "Control which AI crawlers can access your site — block GPTBot, ClaudeBot, PerplexityBot and more.",
};

export default function AiCrawlersPage() {
  return (
    <AppShell>
      <AiManagerScreen />
    </AppShell>
  );
}
