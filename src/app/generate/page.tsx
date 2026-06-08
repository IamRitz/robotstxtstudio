import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { GeneratorScreen } from "./generator-screen";

export const metadata: Metadata = {
  title: "Robots.txt Generator",
  description: "Build a robots.txt from presets and crawler rules, with live validation and a plain-English preview.",
  alternates: { canonical: "/generate" },
};

export default function GeneratePage() {
  return (
    <AppShell>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Generate", path: "/generate" }])} />
      <GeneratorScreen />
    </AppShell>
  );
}
