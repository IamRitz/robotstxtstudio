/**
 * Funnel taxonomy (Phase 13B) — documentation-as-code.
 *
 * Each funnel is expressed as ordered steps over the event taxonomy, so the same
 * definitions drive docs/ANALYTICS.md and (later) the PostHog dashboards. Most funnels
 * resolve from `cta_clicked` (with `source_type`) → tool pageview/completion, with a
 * pure-`$pageview` sequence as a no-instrumentation fallback for the tool→tool ones.
 */
import { EVENTS } from "./events";

export interface FunnelStep {
  /** Human description of the step. */
  readonly label: string;
  /** The event that satisfies this step. */
  readonly event: string;
  /** Property filter that scopes the event to this funnel. */
  readonly where?: Readonly<Record<string, string>>;
}

export interface Funnel {
  readonly id: string;
  readonly name: string;
  readonly question: string;
  readonly steps: readonly FunnelStep[];
}

export const FUNNELS: readonly Funnel[] = [
  {
    id: "guide-to-tool",
    name: "Guide → Tool",
    question: "Do educational guides convert readers into tool users?",
    steps: [
      { label: "View a guide", event: EVENTS.pageview, where: { page_type: "guide" } },
      { label: "Click a tool CTA", event: EVENTS.ctaClicked, where: { source_type: "guide" } },
      { label: "Land on the tool", event: EVENTS.pageview, where: { page_type: "tool" } },
    ],
  },
  {
    id: "crawler-to-tool",
    name: "Crawler Page → Tool",
    question: "Do crawler directory pages convert into the AI Manager / tools?",
    steps: [
      { label: "View a crawler page", event: EVENTS.pageview, where: { page_type: "crawler" } },
      { label: "Click a tool CTA", event: EVENTS.ctaClicked, where: { source_type: "crawler" } },
      { label: "Land on the tool", event: EVENTS.pageview, where: { page_type: "tool" } },
    ],
  },
  {
    id: "template-to-generator",
    name: "Template → Generator",
    question: "Do templates drive Generator usage (and copies)?",
    steps: [
      { label: "View templates", event: EVENTS.pageview, where: { page_type: "template" } },
      // code_copied carries the panel title as `context` + the page path; scope by the
      // templates path (PostHog: $current_url) rather than a literal context value.
      { label: "Copy a template (on /robots-txt-templates)", event: EVENTS.codeCopied },
      { label: "Open the Generator", event: EVENTS.ctaClicked, where: { tool: "generator", source_type: "template" } },
    ],
  },
  {
    id: "analyzer-to-validator",
    name: "Analyzer → Validator",
    question: "After auditing a site, do users go validate/fix the file?",
    steps: [
      { label: "Complete an analysis", event: EVENTS.analyzeCompleted },
      { label: "Land on the Validator", event: EVENTS.pageview, where: { page_type: "tool" } },
      { label: "Validate a file", event: EVENTS.validationCompleted },
    ],
  },
  {
    id: "analyzer-to-explainer",
    name: "Analyzer → Explainer",
    question: "After auditing, do users open the Explainer to understand the file?",
    steps: [
      { label: "Complete an analysis", event: EVENTS.analyzeCompleted },
      { label: "Open the Explainer", event: EVENTS.pageview, where: { page_type: "tool" } },
    ],
  },
];
