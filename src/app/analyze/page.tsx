import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { AnalyzerScreen } from "./analyzer-screen";

export const metadata: Metadata = {
  title: "Crawler Visibility Audit",
  description: "Analyze crawler access, AI visibility, and robots.txt issues for any site in one audit.",
  alternates: { canonical: "/analyze" },
};

export default async function AnalyzePage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string }>;
}) {
  const { domain } = await searchParams;
  return (
    <AppShell>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Analyze", path: "/analyze" }])} />
      <AnalyzerScreen initialDomain={domain ?? ""} />
    </AppShell>
  );
}
