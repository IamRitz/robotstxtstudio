import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { CompareScreen } from "./compare-screen";

export const metadata: Metadata = {
  title: "Compare robots.txt",
  description:
    "Compare two robots.txt files or domains: health and visibility score changes, findings fixed or introduced, and per-crawler (including AI) visibility differences.",
  alternates: { canonical: "/compare" },
};

export default function ComparePage() {
  return (
    <AppShell>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Compare", path: "/compare" }])} />
      <CompareScreen />
    </AppShell>
  );
}
