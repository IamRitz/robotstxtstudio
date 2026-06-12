import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema, softwareAppSchema } from "@/lib/seo";
import { RelatedResources } from "@/components/content/related-resources";
import { CompareScreen } from "./compare-screen";

export const metadata: Metadata = {
  title: "Compare robots.txt Files — Diff Scores, Rules & AI Crawler Access",
  description:
    "Compare two robots.txt files or domains: health and visibility score changes, findings fixed or introduced, and per-crawler (including AI) visibility differences.",
  alternates: { canonical: "/compare" },
};

export default function ComparePage() {
  return (
    <AppShell>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Compare", path: "/compare" },
        ])}
      />
      <JsonLd
        data={softwareAppSchema({
          name: "Robots.txt Compare",
          description:
            "Compare two robots.txt files or domains: score deltas, findings fixed or introduced, and per-crawler visibility differences.",
          path: "/compare",
          features: [
            "Side-by-side robots.txt comparison",
            "Health and visibility score deltas",
            "Per-crawler access differences, including AI crawlers",
            "Findings fixed or introduced between versions",
          ],
        })}
      />
      <CompareScreen />
      {/* Internal-link rail — /compare was the site's one contextual dead-end (18G). */}
      <div className="mt-12 border-t border-border pt-8">
        <RelatedResources
          related={[
            {
              title: "Robots.txt Analyzer",
              href: "/analyze",
              description: "Audit either side of the diff in one report.",
            },
            {
              title: "Robots.txt Validator",
              href: "/validate",
              description: "Fix the issues a comparison surfaces.",
            },
            {
              title: "AI Crawler Directory",
              href: "/ai-crawlers-directory",
              description: "What each crawler in the diff actually does.",
            },
            {
              title: "How to Read robots.txt",
              href: "/how-to-read-robots-txt",
              description: "Understand the rules you're comparing.",
            },
          ]}
        />
      </div>
    </AppShell>
  );
}
