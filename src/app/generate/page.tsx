import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { ToolRelatedRail, toolAppSchema } from "@/components/tool-related-rail";
import { ToolGuideSection } from "@/components/tool-guide";
import { GENERATOR_GUIDE } from "@/config/tool-guides";
import { GeneratorScreen } from "./generator-screen";

export const metadata: Metadata = {
  title: "Robots.txt Generator — Build a Valid File in Minutes",
  description:
    "Free robots.txt generator: start from a template, choose search, AI search, and AI training crawlers separately, add disallow paths, and download a validated file.",
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
      <ToolGuideSection guide={GENERATOR_GUIDE} />
      <ToolRelatedRail tool="generator" />
    </AppShell>
  );
}
