import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { AnalyzerScreen } from "./analyzer-screen";

export const metadata: Metadata = {
  title: "Crawler Visibility Audit",
  description: "Analyze crawler access, AI visibility, and robots.txt issues for any site in one audit.",
};

export default async function AnalyzePage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string }>;
}) {
  const { domain } = await searchParams;
  return (
    <AppShell>
      <AnalyzerScreen initialDomain={domain ?? ""} />
    </AppShell>
  );
}
