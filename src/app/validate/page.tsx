import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { ValidatorScreen } from "./validator-screen";

export const metadata: Metadata = {
  title: "Robots.txt Validator",
  description: "Validate robots.txt syntax, catch errors and warnings, and get a health score.",
};

export default function ValidatePage() {
  return (
    <AppShell>
      <ValidatorScreen />
    </AppShell>
  );
}
