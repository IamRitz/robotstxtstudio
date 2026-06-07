import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Robots.txt Studio — Generate, Validate, Test & Explain robots.txt",
    template: "%s — Robots.txt Studio",
  },
  description:
    "A modern all-in-one robots.txt toolkit: generator, validator, tester, explainer, AI crawler manager, and live checker for GPTBot, ClaudeBot, PerplexityBot and more.",
  metadataBase: new URL("https://robots-txt-studio.vercel.app"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
