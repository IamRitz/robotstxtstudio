import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { ExplainerScreen } from "./explainer-screen";

export const metadata: Metadata = {
  title: "Robots.txt Explainer",
  description: "Read your robots.txt in plain English — what each rule does and how AI crawlers are affected.",
  alternates: { canonical: "/explain" },
};

export default function ExplainPage() {
  return (
    <AppShell>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Explain", path: "/explain" }])} />
      <ExplainerScreen />
    </AppShell>
  );
}
