import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { JsonLd } from "@/components/json-ld";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { VercelInsights } from "@/components/vercel-insights";
import { SITE, organizationSchema, websiteSchema } from "@/lib/seo";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const SITE_URL = SITE.url;
const TITLE = "Robots.txt Generator, Validator & AI Crawler Control — Robots.txt Studio";
const DESCRIPTION = SITE.description;

// viewport-fit=cover lets env(safe-area-inset-bottom) resolve on notched iPhones,
// so the fixed bottom tab bar and the footer clear the home indicator.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s — Robots.txt Studio" },
  description: DESCRIPTION,
  applicationName: "Robots.txt Studio",
  keywords: [
    "robots.txt generator",
    "robots.txt tester",
    "robots.txt validator",
    "robots.txt checker",
    "gptbot robots.txt",
    "claudebot robots.txt",
    "perplexitybot robots.txt",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Robots.txt Studio",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable}`}>
      <body className="min-h-screen">
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <AnalyticsProvider />
        {children}
        <VercelInsights />
      </body>
    </html>
  );
}
