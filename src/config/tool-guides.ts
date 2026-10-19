/**
 * Server-rendered guide content for the tool pages (SEO recovery, 2026-10).
 *
 * The tool pages (`/validate`, `/url-tester`, `/generate`, `/analyze`) are the
 * canonical URLs for their intents; the former `/robots-txt-*` landing pages now
 * 301 here, so this module carries the explanation those pages had — rebuilt around
 * worked examples instead of generic copy.
 *
 * Every `traces` / `findings` example is executed by `tool-guides.test.ts` against
 * the real Tester and Validator, so a published example can't silently drift from
 * what the tool actually does.
 */
import type { Route } from "next";
import type { FaqItem } from "@/lib/seo";
import type { ValidationCode } from "@/types";

/** A URL-test example: this file + this URL + this crawler → this verdict. */
export interface TraceExample {
  readonly title: string;
  readonly robots: string;
  readonly url: string;
  readonly agent: string;
  readonly expected: "allowed" | "blocked";
  /** The deciding directive exactly as written, or null when no rule matches. */
  readonly decidedBy: string | null;
  readonly why: string;
}

/** A Validator example: this file → this finding. */
export interface FindingExample {
  readonly title: string;
  readonly robots: string;
  readonly code: ValidationCode;
  readonly fix: string;
}

export interface GuideSection {
  readonly id: string;
  readonly heading: string;
  readonly paragraphs?: readonly string[];
  readonly bullets?: readonly string[];
  readonly table?: {
    readonly head: readonly string[];
    readonly rows: readonly (readonly string[])[];
  };
}

export interface ToolGuide {
  readonly heading: string;
  readonly intro: string;
  readonly sections: readonly GuideSection[];
  readonly traces?: readonly TraceExample[];
  readonly findings?: readonly FindingExample[];
  readonly faqs: readonly FaqItem[];
  /** Official references the guide relies on. */
  readonly sources: ReadonlyArray<{ readonly title: string; readonly href: string }>;
  /** Contextual next steps (other tools / guides). */
  readonly next: ReadonlyArray<{
    readonly title: string;
    readonly href: Route;
    readonly why: string;
  }>;
}

const GOOGLE_SPEC = {
  title: "Google: How Google interprets the robots.txt specification",
  href: "https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt",
};
const RFC_9309 = {
  title: "RFC 9309: Robots Exclusion Protocol",
  href: "https://www.rfc-editor.org/rfc/rfc9309",
};

export const VALIDATOR_GUIDE: ToolGuide = {
  heading: "How the robots.txt validator checks your file",
  intro:
    "Paste a file or fetch it from your domain. The validator parses it the way RFC 9309 and Google describe, then reports each problem with its line, its severity, and a fix you can apply and re-check in place. It runs in your browser — the file you paste is not uploaded.",
  sections: [
    {
      id: "check-vs-test",
      heading: "Checking, validating, and testing are different questions",
      bullets: [
        "Validate: is the file well-formed, and does it contain risky patterns? (this page)",
        "Test: is one specific URL allowed or blocked for one crawler? Use the URL Tester — a valid file can still block the wrong page.",
        "Analyze: fetch a live site's file and see which search and AI crawlers it lets in.",
      ],
    },
    {
      id: "severity",
      heading: "What each severity means",
      table: {
        head: ["Severity", "Meaning", "Example"],
        rows: [
          ["Error", "Crawlers will ignore or misread the line", "Disallow /admin/ (no colon)"],
          ["Warning", "Valid, but likely not what you intended", "User-agent: * + Disallow: /"],
          ["Info", "A decision worth making explicitly", "No rule for GPTBot (inherits *)"],
        ],
      },
    },
  ],
  findings: [
    {
      title: "A missing colon silently drops the rule",
      robots: "User-agent: *\nDisallow /admin/",
      code: "missing-colon",
      fix: "Write Disallow: /admin/. Without the colon, crawlers skip the line and /admin/ stays crawlable.",
    },
    {
      title: "The whole site is blocked for every crawler",
      robots: "User-agent: *\nDisallow: /",
      code: "overly-broad-disallow",
      fix: "Usually a staging file shipped to production. Remove the line, or block only specific paths.",
    },
    {
      title: "Noindex in robots.txt does nothing",
      robots: "User-agent: *\nNoindex: /private/",
      code: "noindex-unsupported",
      fix: "Google stopped supporting it in 2019. Use a noindex meta tag or X-Robots-Tag header, and leave the page crawlable so the tag can be seen.",
    },
    {
      title: "A relative sitemap URL is ignored",
      robots: "User-agent: *\nAllow: /\n\nSitemap: /sitemap.xml",
      code: "invalid-sitemap-url",
      fix: "Use the absolute URL: Sitemap: https://example.com/sitemap.xml.",
    },
    {
      title: "Blocking CSS or JavaScript hurts rendering",
      robots: "User-agent: *\nDisallow: /*.css$",
      code: "blocks-rendering-assets",
      fix: "Google renders pages like a browser; let it fetch the CSS and JS the page needs.",
    },
  ],
  faqs: [
    {
      question: "How do I check if my robots.txt is valid?",
      answer:
        "Paste the file above or fetch it from your domain. The validator lists every error and warning with its line number and a suggested fix. Apply fixes in place, re-check, then download the corrected file.",
    },
    {
      question: "What's the difference between a robots.txt checker and a validator?",
      answer:
        "People use the words interchangeably. Validation checks the file itself (syntax, conflicts, risky rules). To check whether a specific page is reachable, test that URL against a crawler in the URL Tester.",
    },
    {
      question: "Does a valid robots.txt mean Google will index my pages?",
      answer:
        "No. robots.txt only controls crawling by crawlers that choose to follow it. A valid file can still block important URLs, and an allowed URL is not guaranteed to be crawled or indexed.",
    },
    {
      question: "Is the validator free?",
      answer: "Yes. It needs no sign-up, and a pasted file is processed in your browser.",
    },
  ],
  sources: [GOOGLE_SPEC, RFC_9309],
  next: [
    {
      title: "URL Tester",
      href: "/url-tester",
      why: "Confirm specific URLs are allowed for Googlebot or an AI bot.",
    },
    {
      title: "robots.txt syntax",
      href: "/robots-txt-syntax",
      why: "Every directive, wildcard, and formatting rule.",
    },
    {
      title: "robots.txt vs noindex",
      href: "/robots-txt-vs-noindex",
      why: "Why blocking a page doesn't remove it from Google.",
    },
  ],
};

export const TESTER_GUIDE: ToolGuide = {
  heading: "How the URL tester decides allowed or blocked",
  intro:
    "The tester applies the same three steps a compliant crawler does: pick the one group that matches the crawler, find every Allow/Disallow rule that matches the URL path, then apply precedence. The rule trace above shows each step for your input.",
  sections: [
    {
      id: "rules",
      heading: "The rules that decide every result",
      bullets: [
        "One group per crawler: the most specific User-agent match wins. A named group does not inherit rules from User-agent: *.",
        "Longest match wins: the rule with the longest matching path takes precedence, regardless of line order.",
        "Ties go to Allow: when an Allow and a Disallow match with equal length, the URL is allowed.",
        "Paths are case-sensitive and include the query string; $ anchors the end of the URL.",
        "No matching rule means allowed.",
      ],
    },
  ],
  traces: [
    {
      title: "A longer Allow carves an exception out of a Disallow",
      robots: "User-agent: *\nDisallow: /admin/\nAllow: /admin/public/",
      url: "/admin/public/list",
      agent: "Googlebot",
      expected: "allowed",
      decidedBy: "Allow: /admin/public/",
      why: "Both rules match; /admin/public/ is the longer path, so it wins.",
    },
    {
      title: "A crawler-specific group replaces the * group entirely",
      robots: "User-agent: *\nDisallow: /private/\n\nUser-agent: Googlebot\nDisallow: /tmp/",
      url: "/private/report",
      agent: "Googlebot",
      expected: "allowed",
      decidedBy: null,
      why: "Googlebot obeys only its own group, which says nothing about /private/. Repeat shared rules in every named group.",
    },
    {
      title: "Blocking GPTBot doesn't block other AI crawlers",
      robots: "User-agent: GPTBot\nDisallow: /\n\nUser-agent: *\nAllow: /",
      url: "/blog/post",
      agent: "ClaudeBot",
      expected: "allowed",
      decidedBy: "Allow: /",
      why: "Each AI crawler needs its own User-agent line; ClaudeBot falls back to *.",
    },
    {
      title: "$ stops matching when a query string follows",
      robots: "User-agent: *\nDisallow: /*.pdf$",
      url: "/files/guide.pdf?v=2",
      agent: "Googlebot",
      expected: "allowed",
      decidedBy: null,
      why: "The URL ends with ?v=2, not .pdf, so the anchored pattern doesn't match. Use Disallow: /*.pdf to cover both.",
    },
    {
      title: "Paths are case-sensitive",
      robots: "User-agent: *\nDisallow: /Admin/",
      url: "/admin/settings",
      agent: "Bingbot",
      expected: "allowed",
      decidedBy: null,
      why: "/Admin/ and /admin/ are different paths. Match the case your URLs actually use.",
    },
  ],
  faqs: [
    {
      question: "How do I test if a URL is blocked by robots.txt?",
      answer:
        "Paste or fetch the robots.txt, enter the URL or path, and pick a crawler. The tester shows allowed or blocked, the deciding rule, and the reasoning step by step.",
    },
    {
      question: "Why is my page blocked when the file looks fine?",
      answer:
        "Usually group selection or precedence: the crawler matched a different group than you expected, or a broader wildcard rule matched. The trace shows which group and rule applied.",
    },
    {
      question: "If a URL is allowed, will Google index it?",
      answer:
        "Not necessarily. Allowed means a compliant crawler may fetch it. Whether it is crawled, indexed, or ranked depends on the search engine.",
    },
  ],
  sources: [GOOGLE_SPEC, RFC_9309],
  next: [
    {
      title: "Validator",
      href: "/validate",
      why: "Catch syntax errors before testing individual URLs.",
    },
    {
      title: "How robots.txt works",
      href: "/how-does-robots-txt-work",
      why: "Group selection, precedence, caching, and status codes.",
    },
    {
      title: "AI Crawler Directory",
      href: "/ai-crawlers-directory",
      why: "Which AI user-agents to test.",
    },
  ],
};

export const GENERATOR_GUIDE: ToolGuide = {
  heading: "Building a robots.txt that does what you intend",
  intro:
    "Start from a template, decide each crawler group, add the paths you don't want crawled, and copy or download the result. The preview updates as you change settings, so you can see every line before you ship.",
  sections: [
    {
      id: "three-decisions",
      heading: "Search, AI search, and AI training are separate decisions",
      table: {
        head: ["Group", "Examples", "What blocking does"],
        rows: [
          [
            "Search engines",
            "Googlebot, Bingbot",
            "Removes you from that search engine over time — rarely what you want",
          ],
          [
            "AI search",
            "OAI-SearchBot, Claude-SearchBot, PerplexityBot",
            "Stops those assistants surfacing and linking your pages",
          ],
          [
            "AI training",
            "GPTBot, ClaudeBot, CCBot",
            "Asks those operators not to collect your content for model training",
          ],
          [
            "AI usage controls",
            "Google-Extended, Applebot-Extended",
            "Opts out of AI training/grounding use; no crawler is blocked and search is unaffected",
          ],
        ],
      },
    },
    {
      id: "before-deploy",
      heading: "Before you deploy",
      bullets: [
        "Run the file through the Validator and fix any errors.",
        "Test your most important URLs for Googlebot in the URL Tester.",
        "Upload it as /robots.txt at the root of each host (https://example.com/robots.txt). Subdomains need their own file.",
        "After deploying, analyze the live domain to confirm it serves 200 with text/plain.",
      ],
    },
  ],
  faqs: [
    {
      question: "Is the generator free?",
      answer: "Yes, with no sign-up. Copy the output or download robots.txt.",
    },
    {
      question: "Does blocking AI crawlers affect Google rankings?",
      answer:
        "Blocking AI training crawlers or Google-Extended does not affect Google Search, according to Google's documentation. Blocking Googlebot does.",
    },
    {
      question: "Does robots.txt stop all AI crawlers?",
      answer:
        "It is a request to compliant crawlers, not access control. Operators that publish their crawlers say they honor it; others may not. Use server-side controls for content that must stay private.",
    },
    {
      question: "Where do I put the generated file?",
      answer:
        "At the root of the host as /robots.txt. On WordPress, Shopify, or Next.js the method differs — see the platform guides.",
    },
  ],
  sources: [
    GOOGLE_SPEC,
    {
      title: "Google: Google-Extended (common crawlers)",
      href: "https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers",
    },
    {
      title: "OpenAI: Overview of OpenAI crawlers",
      href: "https://developers.openai.com/api/docs/bots",
    },
  ],
  next: [
    { title: "Validator", href: "/validate", why: "Check the generated file." },
    {
      title: "robots.txt templates",
      href: "/robots-txt-templates",
      why: "Ready-made files by site type.",
    },
    {
      title: "How to block AI crawlers",
      href: "/block-ai-crawlers",
      why: "Training vs search, with copy-paste rules.",
    },
  ],
};

export const ANALYZER_GUIDE: ToolGuide = {
  heading: "What the analyzer reports — and what it can't",
  intro:
    "Enter a domain and the server fetches https://<domain>/robots.txt, follows up to five redirects, and runs the same parser, validator, and URL tester as the other tools. The search visibility score is 70% search-engine access and 30% file health. AI search and AI training access are listed separately and are not scored, because blocking a training crawler is a choice, not a defect.",
  sections: [
    {
      id: "fetch-outcomes",
      heading: "How each fetch result is reported",
      table: {
        head: ["Server response", "What Google does", "What we report"],
        rows: [
          ["200, plain text", "Applies the rules", "The file's real rules and a score"],
          ["200, HTML page", "Finds no valid rules", "No rules found (allow-all), with a warning"],
          [
            "404, 410, 401, 403",
            "Treats as no robots.txt",
            "No robots.txt: compliant crawlers may crawl everything",
          ],
          ["429 or 5xx", "Pauses crawling, then uses a cached copy", "Policy unknown — no score"],
          ["Timeout or DNS failure", "Treated like a 5xx", "Policy unknown — no score"],
        ],
      },
    },
    {
      id: "limits",
      heading: "What a robots.txt audit can't tell you",
      bullets: [
        "Whether a crawler actually visits. robots.txt is an instruction; only server logs show real requests.",
        "Whether pages are indexed, ranked, or cited in AI answers. Check Search Console for indexing.",
        "Whether a crawler honors the rules. Operators that publish documentation say they do; others may not.",
      ],
    },
  ],
  faqs: [
    {
      question: "Can I analyze a competitor's robots.txt?",
      answer: "Yes. robots.txt is public; enter any domain.",
    },
    {
      question: "Why does my site show “policy unknown”?",
      answer:
        "The request timed out or the server answered 429 or 5xx. That doesn't mean everything is allowed: Google pauses crawling while robots.txt returns server errors, so fix that first.",
    },
    {
      question: "Why doesn't blocking GPTBot lower my score?",
      answer:
        "The score measures search-engine access and file health. AI access is shown beside it as your policy, so a deliberate opt-out isn't penalized.",
    },
  ],
  sources: [GOOGLE_SPEC, RFC_9309],
  next: [
    { title: "Validator", href: "/validate", why: "Fix the file line by line." },
    {
      title: "How to find robots.txt",
      href: "/how-to-find-robots-txt",
      why: "Locate any site's file and its sitemap.",
    },
    {
      title: "Compare robots.txt",
      href: "/compare",
      why: "Diff two versions to catch a policy regression.",
    },
  ],
};
