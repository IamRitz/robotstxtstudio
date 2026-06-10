import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { ToolRelatedRail, toolAppSchema } from "@/components/tool-related-rail";
import { ValidatorScreen } from "./validator-screen";

export const metadata: Metadata = {
  title: "Robots.txt Validator",
  description: "Validate robots.txt syntax, catch errors and warnings, and get a health score.",
  alternates: { canonical: "/validate" },
};

export default function ValidatePage() {
  return (
    <AppShell>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Validate", path: "/validate" }])} />
      <JsonLd data={toolAppSchema("validator")} />
      <ValidatorScreen />
      <ToolRelatedRail tool="validator" />
    </AppShell>
  );
}
