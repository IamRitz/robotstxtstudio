import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/section-header";
import { TOOLS, type ToolId } from "@/config/content";
import { siblingTools, toolGuides, type LinkItem } from "@/lib/internal-links";
import { softwareAppSchema } from "@/lib/seo";

/** Feature bullets per tool, for SoftwareApplication JSON-LD (describe visible features only). */
const TOOL_FEATURES: Record<ToolId, readonly string[]> = {
  generator: [
    "Starter presets for blogs, SaaS, and e-commerce",
    "Per-crawler allow/block toggles",
    "Live preview with inline validation",
    "Copy or download the robots.txt",
  ],
  validator: [
    "Syntax-error detection",
    "Best-practice warnings",
    "Robots health score",
    "Line-level diagnostics",
  ],
  analyzer: [
    "Fetch and audit any live robots.txt",
    "Search visibility score (AI policy shown separately)",
    "Search vs AI crawler breakdown",
    "Exportable audit report",
  ],
  tester: [
    "Simulate any URL against any crawler",
    "Allowed / blocked verdict",
    "Rule precedence trace",
    "Per-user-agent testing",
  ],
  "ai-manager": [
    "Block GPTBot, ClaudeBot, PerplexityBot and more",
    "One-click category presets",
    "Live impact preview",
    "Export the robots.txt block",
  ],
  explainer: [
    "Plain-English explanation of any file",
    "Per-group rule breakdown",
    "AI crawler impact",
    "No sign-up required",
  ],
};

/** SoftwareApplication JSON-LD for a tool page (describes the visible tool; no ratings are claimed). */
export function toolAppSchema(tool: ToolId): Record<string, unknown> {
  const t = TOOLS[tool];
  return softwareAppSchema({
    name: t.title,
    description: t.description,
    path: t.href,
    features: TOOL_FEATURES[tool],
  });
}

function LinkGrid({ items }: { items: readonly LinkItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="group">
          <Card className="h-full p-4">
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            {item.description ? (
              <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
            ) : null}
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand">
              Open{" "}
              <ArrowRight
                className="size-3 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
          </Card>
        </Link>
      ))}
    </div>
  );
}

/**
 * Cross-link rail for tool pages: sibling tools + relevant guides. Gives the
 * otherwise dead-ending tool screens internal links into the content clusters and
 * keeps users moving between tools (Phase 12D internal-linking).
 */
export function ToolRelatedRail({ tool }: { tool: ToolId }) {
  return (
    <section aria-label="Related tools and guides" className="mt-12 border-t border-border pt-8">
      <SectionHeader className="mb-3">More tools</SectionHeader>
      <LinkGrid items={siblingTools(tool)} />
      <SectionHeader className="mb-3 mt-8">Related guides</SectionHeader>
      <LinkGrid items={toolGuides(tool)} />
    </section>
  );
}
