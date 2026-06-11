import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { ToolRelatedRail, toolAppSchema } from "@/components/tool-related-rail";
import { GeneratorScreen } from "./generator-screen";

export const metadata: Metadata = {
  title: "Robots.txt Generator",
  description:
    "Build a robots.txt from presets and crawler rules, with live validation and a plain-English preview.",
  alternates: { canonical: "/generate" },
};

export default async function GeneratePage({
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
          { name: "Generate", path: "/generate" },
        ])}
      />
      <JsonLd data={toolAppSchema("generator")} />
      <GeneratorScreen focusSection={focus} />
      <ToolRelatedRail tool="generator" />
    </AppShell>
  );
}
