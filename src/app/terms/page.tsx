import type { Metadata } from "next";
import Link from "next/link";
import { TrustPageLayout, type TrustPage } from "@/components/trust-page-layout";
import { webPageSchema } from "@/lib/seo";

const UPDATED = "June 10, 2026";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms for using Robots.txt Studio. The tools are provided free and as-is for informational purposes; robots.txt analysis is guidance, not a guarantee of crawler behavior.",
  alternates: { canonical: "/terms" },
};

const page: TrustPage = {
  slug: "terms",
  title: "Terms of Service",
  updated: UPDATED,
  lead: (
    <>
      These terms govern your use of Robots.txt Studio. By using the site and its tools, you agree
      to them. Please read them alongside our{" "}
      <Link href="/privacy" className="text-brand hover:underline">
        Privacy Policy
      </Link>
      .
    </>
  ),
  sections: [
    {
      id: "service",
      heading: "The service",
      blocks: [
        {
          kind: "p",
          content:
            "Robots.txt Studio provides free tools to generate, validate, test, explain, and analyze robots.txt files and to manage crawler permissions. The service is provided for informational purposes to help you understand and control crawler access to your site.",
        },
        {
          kind: "p",
          content:
            "No account is required, and we may add, change, or remove features over time as the product evolves.",
        },
      ],
    },
    {
      id: "acceptable-use",
      heading: "Acceptable use",
      blocks: [
        {
          kind: "p",
          content:
            "When using the site — particularly the features that fetch a domain you specify — you agree to:",
        },
        {
          kind: "list",
          items: [
            "Only request robots.txt for sites you own or are authorized to check.",
            "Not use the analysis or fetch features to overload, attack, or otherwise harm any third-party site.",
            "Not attempt to disrupt, reverse-engineer for abuse, or place an unreasonable automated load on the service.",
            "Comply with applicable laws in your use of the tools.",
          ],
        },
        {
          kind: "callout",
          status: "warning",
          title: "Fetching is rate-sensitive",
          body: "The analyze and fetch-from-URL features make real requests to the domain you enter. Use them responsibly and only against sites you have permission to test.",
        },
      ],
    },
    {
      id: "no-warranty",
      heading: "No warranty and limitation of liability",
      blocks: [
        {
          kind: "p",
          content:
            "The tools and information are provided “as is,” without warranties of any kind. robots.txt is a voluntary standard: it is a request to well-behaved crawlers, not an enforced access control. Our analysis describes what a compliant crawler would do — it cannot guarantee how any given bot will actually behave, and it does not control your search rankings or indexing.",
        },
        {
          kind: "list",
          items: [
            "Verify important changes against your live site before relying on them.",
            "For content that must be private, use authentication or server-level controls — not robots.txt.",
            "We are not liable for crawling outcomes, SEO impact, or losses arising from use of the tools.",
          ],
        },
        {
          kind: "callout",
          status: "info",
          title: "How our analysis works",
          body: (
            <>
              The standards, matching rules, and limitations behind our results are documented on
              the{" "}
              <Link href="/methodology" className="text-brand hover:underline">
                methodology page
              </Link>
              .
            </>
          ),
        },
      ],
    },
    {
      id: "ip",
      heading: "Intellectual property",
      blocks: [
        {
          kind: "p",
          content:
            "The site's design, code, written guides, and original content are owned by Robots.txt Studio. Our crawler classifications are compiled from publicly available operator documentation. You are welcome to use the robots.txt files and snippets the tools generate for your own sites.",
        },
      ],
    },
    {
      id: "changes",
      heading: "Changes to these terms",
      blocks: [
        {
          kind: "p",
          content: `We may update these terms as the service changes. The current version is dated ${UPDATED}; continued use after an update constitutes acceptance of the revised terms.`,
        },
        {
          kind: "p",
          content: (
            <>
              Questions about these terms? Reach us via the{" "}
              <Link href="/contact" className="text-brand hover:underline">
                contact page
              </Link>
              .
            </>
          ),
        },
      ],
    },
  ],
  related: [
    { title: "Privacy Policy", href: "/privacy", description: "What we process — and don't." },
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
      name: "Terms of Service — Robots.txt Studio",
      description:
        "The tools are provided free and as-is for informational purposes; robots.txt analysis is guidance, not a guarantee of crawler behavior.",
      path: "/terms",
      dateModified: "2026-06-10",
    }),
  ],
};

export default function Page() {
  return <TrustPageLayout page={page} />;
}
