import type { Metadata } from "next";
import Link from "next/link";
import { SeoContentLayout, type ContentPage } from "@/components/content";

export const metadata: Metadata = {
  title: "How Does robots.txt Work?",
  description:
    "How crawlers fetch, parse, and apply robots.txt: user-agent group selection, longest-match precedence, wildcards, and the $ anchor.",
  alternates: { canonical: "/how-does-robots-txt-work" },
};

const page: ContentPage = {
  slug: "how-does-robots-txt-work",
  h1: "How Does robots.txt Work?",
  description:
    "How crawlers fetch and apply robots.txt rules — group selection, precedence, and pattern matching.",
  lead: (
    <>
      When a crawler visits your site, it fetches{" "}
      <code className="font-mono text-foreground">/robots.txt</code> first, picks the group of rules
      that applies to its user-agent, then decides per URL whether it is allowed. Understanding that
      sequence is what separates a file that works from one that silently blocks the wrong things.
    </>
  ),
  cta: "tester",
  sections: [
    {
      id: "lifecycle",
      heading: "The crawl lifecycle",
      blocks: [
        {
          kind: "list",
          ordered: true,
          items: [
            "Fetch: the crawler requests /robots.txt. A 2xx text response is parsed; a 404 means “crawl everything”; repeated 5xx errors usually mean “crawl nothing for now.”",
            "Cache: crawlers cache the file (Google up to ~24 hours), so changes aren't instant.",
            "Group selection: the crawler finds the most specific User-agent group that matches its name.",
            "Matching: for each URL, it applies that group's Allow/Disallow rules using a precedence algorithm.",
          ],
        },
      ],
    },
    {
      id: "group-selection",
      heading: "How a crawler chooses its group",
      blocks: [
        {
          kind: "p",
          content:
            "A crawler uses exactly one group — the one whose User-agent token is the longest case-insensitive match for its name. If no named group matches, it falls back to the wildcard group (User-agent: *). If there's no wildcard group either, everything is allowed.",
        },
        {
          kind: "snippet",
          code: "User-agent: *\nDisallow: /private/\n\nUser-agent: Googlebot\nDisallow: /no-google/",
          caption: "Googlebot uses only the Googlebot group",
        },
        {
          kind: "callout",
          status: "warning",
          title: "A common surprise",
          body: "Because Googlebot matches its own group, it ignores the wildcard group entirely — so /private/ is NOT blocked for Googlebot here. Rules are not merged across groups.",
        },
      ],
    },
    {
      id: "precedence",
      heading: "Allow vs Disallow precedence",
      blocks: [
        {
          kind: "p",
          content:
            "Within the selected group, the rule with the longest matching path wins. If an Allow and a Disallow match with the same length, the least restrictive rule (Allow) wins.",
        },
        {
          kind: "snippet",
          code: "User-agent: *\nDisallow: /admin/\nAllow: /admin/public/",
          caption: "/admin/public/page is allowed (longer match)",
        },
        {
          kind: "p",
          content: (
            <>
              You don't have to reason about this by hand. Paste your file into the{" "}
              <Link href="/url-tester" className="text-brand hover:underline">
                URL Tester
              </Link>{" "}
              and it shows the matched rule and a step-by-step trace for any URL and crawler.
            </>
          ),
        },
      ],
    },
    {
      id: "patterns",
      heading: "Wildcards and the $ anchor",
      blocks: [
        {
          kind: "p",
          content:
            "Paths are prefix matches by default. Two special characters extend them: * matches any sequence of characters, and $ anchors the match to the end of the URL.",
        },
        {
          kind: "table",
          head: ["Pattern", "Matches", "Doesn't match"],
          rows: [
            [
              <code key="a" className="font-mono">
                /admin
              </code>,
              "/admin, /admin/x, /administrator",
              "/x/admin",
            ],
            [
              <code key="b" className="font-mono">
                {"/*.pdf"}
              </code>,
              "/files/report.pdf",
              "/files/report.txt",
            ],
            [
              <code key="c" className="font-mono">
                /page$
              </code>,
              "/page",
              "/page/sub",
            ],
          ],
        },
        {
          kind: "p",
          content: (
            <>
              The full directive reference lives on the{" "}
              <Link href="/robots-txt-syntax" className="text-brand hover:underline">
                syntax page
              </Link>
              .
            </>
          ),
        },
      ],
    },
    {
      id: "mistakes",
      heading: "Where it goes wrong",
      blocks: [
        {
          kind: "mistakes",
          items: [
            {
              title: "Expecting instant changes",
              body: "Crawlers cache robots.txt. Edits can take hours to take effect.",
            },
            {
              title: "Assuming rules merge across groups",
              body: "A named crawler ignores the * group; duplicate shared rules into each group you care about.",
            },
            {
              title: "Trusting case for paths",
              body: "User-agent matching is case-insensitive, but URL paths are case-sensitive: /Admin and /admin are different.",
            },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Can robots.txt block Google?",
      answer:
        "It can stop Googlebot from crawling URLs, yes. But a blocked URL can still appear in search results (without a description) if other sites link to it. To remove a page from Google, use a noindex tag and let Google crawl it once.",
    },
    {
      question: "Do crawlers have to obey robots.txt?",
      answer:
        "It's voluntary. Reputable crawlers (Google, Bing, OpenAI, Anthropic) honor it. Malicious scrapers can and do ignore it, which is why robots.txt is not a security measure.",
    },
    {
      question: "How often do crawlers re-read robots.txt?",
      answer:
        "Typically every several hours to a day. Google caches it for up to 24 hours, so don't expect immediate effect after an edit.",
    },
    {
      question: "Does robots.txt remove pages from Google?",
      answer:
        "No. Disallowing a page prevents crawling, not indexing. Removing a page requires noindex, a removal request, or returning a 404/410.",
    },
  ],
  related: [
    {
      title: "robots.txt syntax",
      href: "/robots-txt-syntax",
      description: "Every directive and pattern.",
    },
    {
      title: "How to read robots.txt",
      href: "/how-to-read-robots-txt",
      description: "Apply the rules by hand.",
    },
    { title: "What is robots.txt?", href: "/what-is-robots-txt", description: "The fundamentals." },
  ],
};

export default function Page() {
  return <SeoContentLayout page={page} />;
}
