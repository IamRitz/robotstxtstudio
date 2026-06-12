import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { ToolRelatedRail, toolAppSchema } from "@/components/tool-related-rail";
import { ValidatorScreen } from "./validator-screen";

export const metadata: Metadata = {
  title: "Robots.txt Validator — Find SEO & AI Crawler Issues",
  description:
    "Validate robots.txt syntax, catch SEO and AI crawler issues with one-click fixes, and get a health score. Free, runs in your browser.",
  alternates: { canonical: "/validate" },
};

export default function ValidatePage() {
  return (
    <AppShell>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Validate", path: "/validate" },
        ])}
      />
      <JsonLd data={toolAppSchema("validator")} />
      <ValidatorScreen />
      {/* Collapsed during remediation — the workspace is the page's job. The
          rail stays in the DOM (SEO/internal links) but costs one line. */}
      <details className="mt-12">
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground">
          More tools & related guides
        </summary>
        <ToolRelatedRail tool="validator" />
      </details>
    </AppShell>
  );
}
