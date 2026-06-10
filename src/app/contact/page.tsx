import type { Metadata } from "next";
import Link from "next/link";
import { TrustPageLayout, type TrustPage } from "@/components/trust-page-layout";
import { webPageSchema } from "@/lib/seo";

const X_URL = "https://x.com/robotstudio";

export const metadata: Metadata = {
  title: "Contact Robots.txt Studio",
  description:
    "Get in touch with Robots.txt Studio — feedback, bug reports, and corrections to our crawler classifications. Reach us on X at @robotstudio.",
  alternates: { canonical: "/contact" },
};

const page: TrustPage = {
  slug: "contact",
  title: "Contact",
  lead: (
    <>
      Questions, feedback, a bug, or a correction to our crawler data? We&apos;d like to hear from you.
    </>
  ),
  sections: [
    {
      id: "reach",
      heading: "Get in touch",
      blocks: [
        {
          kind: "p",
          content: (
            <>
              The fastest way to reach us is on X:{" "}
              <a href={X_URL} className="text-brand hover:underline" target="_blank" rel="noopener noreferrer">
                @robotstudio
              </a>
              . Send us a message or mention us — we read everything.
            </>
          ),
        },
        {
          kind: "list",
          items: [
            "Feedback or feature ideas for any of the tools.",
            "Bug reports — tell us what you did and what you expected.",
            "Corrections to a crawler's classification, compliance status, or documentation link.",
          ],
        },
      ],
    },
    {
      id: "corrections",
      heading: "Reporting an inaccuracy",
      blocks: [
        {
          kind: "p",
          content:
            "We keep our crawler classifications current against each operator's published documentation. If a crawler's behavior, User-agent token, or robots.txt compliance has changed, let us know and we'll review and update it.",
        },
        {
          kind: "callout",
          status: "info",
          title: "How we evaluate crawlers",
          body: (
            <>
              Before flagging an inaccuracy, you may find our{" "}
              <Link href="/methodology" className="text-brand hover:underline">methodology</Link> useful — it
              explains how we classify crawlers and source our data.
            </>
          ),
        },
      ],
    },
    {
      id: "self-serve",
      heading: "Looking for something specific?",
      blocks: [
        {
          kind: "p",
          content:
            "Many questions are answered faster by the tools and guides themselves:",
        },
        {
          kind: "list",
          items: [
            <>
              Not sure how a rule behaves? Use the{" "}
              <Link href="/url-tester" className="text-brand hover:underline">URL Tester</Link> or{" "}
              <Link href="/explain" className="text-brand hover:underline">Explainer</Link>.
            </>,
            <>
              Want to know which bots crawl your site? See the{" "}
              <Link href="/crawlers" className="text-brand hover:underline">Crawler Directory</Link>.
            </>,
            <>
              New to robots.txt? Start with{" "}
              <Link href="/what-is-robots-txt" className="text-brand hover:underline">What Is robots.txt?</Link>
            </>,
          ],
        },
        {
          kind: "p",
          content:
            "Note: we provide tools and information — we don't host your robots.txt, manage your server, or influence your search rankings.",
        },
      ],
    },
  ],
  related: [
    { title: "About Robots.txt Studio", href: "/about", description: "What we are and who it's for." },
    { title: "Our Methodology", href: "/methodology", description: "How our analysis works." },
    { title: "Crawler Directory", href: "/crawlers", description: "Every crawler we track." },
    { title: "Privacy Policy", href: "/privacy", description: "How we handle data." },
  ],
  schema: [
    webPageSchema("ContactPage", {
      name: "Contact Robots.txt Studio",
      description: "Reach Robots.txt Studio on X at @robotstudio for feedback, bugs, and crawler-data corrections.",
      path: "/contact",
    }),
  ],
};

export default function Page() {
  return <TrustPageLayout page={page} />;
}
