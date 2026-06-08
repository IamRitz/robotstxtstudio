import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { TesterScreen } from "./tester-screen";

export const metadata: Metadata = {
  title: "Robots.txt URL Tester",
  description: "Test whether a URL is blocked or allowed for any crawler, with a full rule trace.",
};

export default function UrlTesterPage() {
  return (
    <AppShell>
      <TesterScreen />
    </AppShell>
  );
}
