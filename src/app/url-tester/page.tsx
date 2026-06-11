import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { ToolRelatedRail, toolAppSchema } from "@/components/tool-related-rail";
import { TesterScreen } from "./tester-screen";

export const metadata: Metadata = {
  title: "Robots.txt URL Tester",
  description: "Test whether a URL is blocked or allowed for any crawler, with a full rule trace.",
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
      <ToolRelatedRail tool="tester" />
    </AppShell>
  );
}
