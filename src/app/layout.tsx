import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

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
    <html lang="en" className={`${inter.variable} ${geistMono.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
