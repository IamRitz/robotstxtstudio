import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { ExplainerScreen } from "./explainer-screen";

export const metadata: Metadata = {
  title: "Robots.txt Explainer",
  description: "Read your robots.txt in plain English — what each rule does and how AI crawlers are affected.",
};

export default function ExplainPage() {
  return (
    <AppShell>
      <ExplainerScreen />
    </AppShell>
  );
}
