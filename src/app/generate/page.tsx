import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { GeneratorScreen } from "./generator-screen";

export const metadata: Metadata = {
  title: "Robots.txt Generator",
  description: "Build a robots.txt from presets and crawler rules, with live validation and a plain-English preview.",
};

export default function GeneratePage() {
  return (
    <AppShell>
      <GeneratorScreen />
    </AppShell>
  );
}
