import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { ToolRelatedRail, toolAppSchema } from "@/components/tool-related-rail";
import { ToolGuideSection } from "@/components/tool-guide";
import { VALIDATOR_GUIDE } from "@/config/tool-guides";
import { ValidatorScreen } from "./validator-screen";

export const metadata: Metadata = {
  title: "Robots.txt Validator & Checker — Find Errors and Fix Them",
  description:
    "Free robots.txt validator and checker. Paste your file or fetch it from your domain, see every error by line with a fix, and re-check instantly. Pasted files stay in your browser.",
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
      <ToolGuideSection guide={VALIDATOR_GUIDE} />
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
