/**
 * Structured content model for educational/SEO pages. Pages declare data; the
 * SEOContentLayout renders it consistently. Reused by Phase 12B–12F.
 */
import type { ReactNode } from "react";
import type { Route } from "next";
import type { FaqItem } from "@/lib/seo";
import type { ToolId } from "@/config/content";
import type { StatusKey } from "@/components/severity";

export type ContentBlock =
  | { readonly kind: "p"; readonly content: ReactNode }
  | { readonly kind: "list"; readonly items: readonly ReactNode[]; readonly ordered?: boolean }
  | { readonly kind: "snippet"; readonly code: string; readonly caption?: string }
  | { readonly kind: "callout"; readonly status: StatusKey; readonly title: string; readonly body?: ReactNode }
  | { readonly kind: "mistakes"; readonly items: ReadonlyArray<{ readonly title: string; readonly body: ReactNode }> }
  | {
      readonly kind: "table";
      readonly head: readonly string[];
      readonly rows: ReadonlyArray<readonly ReactNode[]>;
    }
  /** Mid-article conversion CTA into a tool (renders a compact ToolCTA). */
  | { readonly kind: "cta"; readonly tool: ToolId };

export interface ContentSection {
  /** Anchor id (also used by the table of contents). */
  readonly id: string;
  readonly heading: string;
  readonly blocks: readonly ContentBlock[];
}

export interface RelatedLink {
  readonly title: string;
  readonly href: Route;
  readonly description?: string;
}

export interface ContentPage {
  readonly slug: string;
  /** Visible H1. */
  readonly h1: string;
  /** Lead paragraph under the H1. */
  readonly lead: ReactNode;
  /** Meta description. */
  readonly description: string;
  readonly sections: readonly ContentSection[];
  readonly faqs: readonly FaqItem[];
  /** Primary tool CTA (rendered prominently at the foot of the article). */
  readonly cta: ToolId;
  /** Optional above-the-fold CTA, shown under the byline (transactional pages). */
  readonly heroCta?: ToolId;
  /** Curated related resources (internal links). */
  readonly related: readonly RelatedLink[];
  /**
   * Explicit "next reading" link. For pages in EDU_PAGES this is computed
   * automatically; transactional pages (12C+) set it directly.
   */
  readonly nextReading?: { readonly title: string; readonly href: Route };
  /**
   * Extra JSON-LD blocks emitted alongside the default Breadcrumb + Article + FAQ
   * (e.g. HowTo on guide pages, ItemList on directory/gallery hubs). 12D+.
   */
  readonly extraSchema?: readonly Record<string, unknown>[];
}
