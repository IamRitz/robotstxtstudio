/**
 * Primary navigation — the canonical routes (PRD §16). Used by the top nav and the
 * mobile bottom bar. Icons are lucide names resolved in the nav components.
 */
import {
  Bot,
  FileText,
  Gauge,
  Megaphone,
  ScanSearch,
  ShieldCheck,
  TestTube,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  readonly label: string;
  /** Short label for the mobile bottom bar. */
  readonly shortLabel: string;
  readonly href: string;
  readonly icon: LucideIcon;
}

export const PRIMARY_NAV: readonly NavItem[] = [
  { label: "Analyze", shortLabel: "Analyze", href: "/analyze", icon: ScanSearch },
  { label: "Generate", shortLabel: "Generate", href: "/generate", icon: FileText },
  { label: "Validate", shortLabel: "Validate", href: "/validate", icon: ShieldCheck },
  { label: "URL Tester", shortLabel: "Tester", href: "/url-tester", icon: TestTube },
  { label: "AI Crawlers", shortLabel: "AI", href: "/ai-crawlers", icon: Bot },
  { label: "Explain", shortLabel: "Explain", href: "/explain", icon: Megaphone },
];

/** Items shown in the mobile bottom tab bar (kept short). */
export const MOBILE_NAV: readonly NavItem[] = [
  { label: "Analyze", shortLabel: "Analyze", href: "/analyze", icon: ScanSearch },
  { label: "Generate", shortLabel: "Generate", href: "/generate", icon: FileText },
  { label: "AI Crawlers", shortLabel: "AI", href: "/ai-crawlers", icon: Bot },
  { label: "Validate", shortLabel: "Validate", href: "/validate", icon: ShieldCheck },
  { label: "Tester", shortLabel: "Tester", href: "/url-tester", icon: TestTube },
];

export const BRAND = { name: "Robots.txt Studio", icon: Bot, dashboardIcon: Gauge } as const;
