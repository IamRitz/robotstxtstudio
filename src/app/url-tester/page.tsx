import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { ToolRelatedRail, toolAppSchema } from "@/components/tool-related-rail";
import { ToolGuideSection } from "@/components/tool-guide";
import { TESTER_GUIDE } from "@/config/tool-guides";
import { TesterScreen } from "./tester-screen";

export const metadata: Metadata = {
  title: "Robots.txt Tester — Check If a URL Is Blocked",
  description:
    "Test whether a URL is blocked or allowed by robots.txt for Googlebot, Bingbot, GPTBot, or any crawler — with the deciding rule, a step-by-step trace, and worked examples.",
  alternates: { canonical: "/url-tester" },
};

export default function UrlTesterPage() {
  return (
    <AppShell>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "URL Tester", path: "/url-tester" },
        ])}
      />
      <JsonLd data={toolAppSchema("tester")} />
      <TesterScreen />
      <ToolGuideSection guide={TESTER_GUIDE} />
      <ToolRelatedRail tool="tester" />
    </AppShell>
  );
}
