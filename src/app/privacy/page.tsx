import type { Metadata } from "next";
import Link from "next/link";
import { TrustPageLayout, type TrustPage } from "@/components/trust-page-layout";
import { webPageSchema } from "@/lib/seo";

const UPDATED = "June 10, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Robots.txt Studio's privacy policy. We use no accounts and store no personal data. Domains you analyze are fetched server-side in memory and not retained.",
  alternates: { canonical: "/privacy" },
};

const page: TrustPage = {
  slug: "privacy",
  title: "Privacy Policy",
  updated: UPDATED,
  lead: (
    <>
      Robots.txt Studio is built privacy-first. We have no user accounts and we store no personal
      data. This page explains exactly what we process when you use the tools.
    </>
  ),
  sections: [
    {
      id: "summary",
      heading: "The short version",
      blocks: [
        {
          kind: "list",
          items: [
            "No sign-up, no accounts, no personal profiles.",
            "Most tools run entirely in your browser — what you paste stays on your device.",
            "When you analyze or fetch a domain, our server fetches that site's public robots.txt and returns the result without storing it.",
            "We do not sell data, and we currently use no advertising or third-party analytics cookies.",
          ],
        },
      ],
    },
    {
      id: "what-we-process",
      heading: "What we process",
      blocks: [
        {
          kind: "p",
          content:
            "The Generator, Validator, URL Tester, Explainer, and AI Crawler Manager run client-side in your browser. Content you paste into them is processed locally and is not transmitted to us.",
        },
        {
          kind: "p",
          content: (
            <>
              When you use{" "}
              <Link href="/analyze" className="text-brand hover:underline">
                Analyze
              </Link>{" "}
              or the fetch-from-URL option, the domain you enter is sent to our server so it can
              request that site&apos;s publicly available{" "}
              <code className="font-mono">/robots.txt</code> file. We process the response in memory
              to produce your report and return it to you. We do not persist the domain, the fetched
              file, or the report.
            </>
          ),
        },
        {
          kind: "callout",
          status: "info",
          title: "We only fetch public robots.txt",
          body: "Our server requests the robots.txt file at the host you specify and nothing else. It is the same public file any web crawler can read.",
        },
      ],
    },
    {
      id: "cookies",
      heading: "Cookies and local storage",
      blocks: [
        {
          kind: "p",
          content:
            "We do not set advertising or cross-site tracking cookies. Some tools use your browser's local storage to improve your experience — for example, the URL Tester keeps your recent tests on your device within a session. That data stays in your browser and is never sent to us.",
        },
        {
          kind: "p",
          content:
            "If we add privacy-respecting, aggregate analytics in the future, we will update this policy to describe what is collected before enabling it.",
        },
      ],
    },
    {
      id: "third-parties",
      heading: "Third parties",
      blocks: [
        {
          kind: "list",
          items: [
            "Hosting — the site is served by our infrastructure provider, which may process standard request metadata (such as IP address) to deliver and secure the service.",
            "Sites you analyze — when you fetch a domain, our request reaches the third-party site you chose; that site may log the request as it would any crawler.",
          ],
        },
      ],
    },
    {
      id: "your-choices",
      heading: "Your choices and contact",
      blocks: [
        {
          kind: "p",
          content:
            "Because we hold no accounts and store no personal data, there is nothing for us to export or delete on your behalf. You can clear tool data held in your browser at any time via your browser settings.",
        },
        {
          kind: "p",
          content: (
            <>
              Questions about this policy? Reach us via the{" "}
              <Link href="/contact" className="text-brand hover:underline">
                contact page
              </Link>
              .
            </>
          ),
        },
      ],
    },
    {
      id: "changes",
      heading: "Changes to this policy",
      blocks: [
        {
          kind: "p",
          content: `We may update this policy as the service evolves. Material changes will be reflected here with a new "last updated" date (currently ${UPDATED}).`,
        },
      ],
    },
  ],
  related: [
    { title: "Terms of Service", href: "/terms", description: "The terms for using the service." },
    { title: "Our Methodology", href: "/methodology", description: "How analysis is performed." },
    {
      title: "About Robots.txt Studio",
      href: "/about",
      description: "What we are and who it's for.",
    },
    { title: "Contact", href: "/contact", description: "Get in touch." },
  ],
  schema: [
    webPageSchema("WebPage", {
      name: "Privacy Policy — Robots.txt Studio",
      description:
        "Robots.txt Studio uses no accounts and stores no personal data; analyzed domains are fetched server-side in memory and not retained.",
      path: "/privacy",
      dateModified: "2026-06-10",
    }),
  ],
};

export default function Page() {
  return <TrustPageLayout page={page} />;
}
