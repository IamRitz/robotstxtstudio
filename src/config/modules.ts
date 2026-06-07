/**
 * Dashboard module registry — the single source of truth for the tab bar.
 * Each later phase flips its `status` to "ready" and wires its component.
 * Keeping this as data (not JSX) lets navigation, SEO pages, and the
 * dashboard shell all read from one list.
 */
export type ModuleId =
  | "generator"
  | "validator"
  | "tester"
  | "explainer"
  | "crawler-manager"
  | "live-checker";

export interface ModuleMeta {
  readonly id: ModuleId;
  readonly label: string;
  readonly tagline: string;
  readonly status: "planned" | "ready";
}

export const MODULES: readonly ModuleMeta[] = [
  {
    id: "generator",
    label: "Generator",
    tagline: "Build a robots.txt from presets and crawler rules.",
    status: "planned",
  },
  {
    id: "validator",
    label: "Validator",
    tagline: "Catch syntax errors, duplicates, and unsupported directives.",
    status: "planned",
  },
  {
    id: "tester",
    label: "Tester",
    tagline: "Check whether a URL is allowed or blocked.",
    status: "planned",
  },
  {
    id: "explainer",
    label: "Explainer",
    tagline: "Read your robots.txt in plain English.",
    status: "planned",
  },
  {
    id: "crawler-manager",
    label: "AI Crawlers",
    tagline: "Toggle GPTBot, ClaudeBot, PerplexityBot and more.",
    status: "planned",
  },
  {
    id: "live-checker",
    label: "Live Checker",
    tagline: "Fetch and analyze a live robots.txt from any domain.",
    status: "planned",
  },
] as const;
