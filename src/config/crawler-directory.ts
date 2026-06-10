/**
 * Crawler Directory data (Phase 12D).
 *
 * The `/crawlers` hub lists every crawler in the generator catalog
 * ({@link ALL_CRAWLERS}); a subset of high-search crawlers also get a standalone
 * `/crawlers/[id]` reference page. This module supplies the editorial enrichment
 * those pages need (verification, compliance, rationale, FAQs) keyed by crawler id,
 * plus the routing helpers that keep the hub, the spokes, and the existing 12C
 * crawler pages cross-linked without duplicate URLs.
 *
 * Anti-thin-content guardrail: only crawlers with a profile here render a dedicated
 * page. Everything else stays a hub row + anchor. Profiles carry unique substance —
 * not the one-line catalog `description`.
 */
import type { Route } from "next";
import type { FaqItem } from "@/lib/seo";
import { ALL_CRAWLERS, getCrawler } from "@/config/crawlers";
import type { Crawler } from "@/types";

export type Tri = "yes" | "no" | "partial";

const TRI_LABEL: Record<Tri, string> = { yes: "Yes", no: "No", partial: "Partial" };
export function triLabel(t: Tri): string {
  return TRI_LABEL[t];
}

/** Editorial profile for a crawler that earns a standalone `/crawlers/[id]` page. */
export interface CrawlerProfile {
  /** Matches a {@link Crawler.id} in the catalog. */
  readonly id: string;
  /** 2–3 sentence lead. */
  readonly summary: string;
  /** "What it does" bullets. */
  readonly whatItDoes: readonly string[];
  /** "Why site owners care" bullets. */
  readonly whyItMatters: readonly string[];
  /** Honors robots.txt in practice? */
  readonly honors: Tri;
  readonly honorsNote: string;
  /** Does blocking it affect Google/Bing ranking? */
  readonly affectsRanking: boolean;
  readonly affectsRankingNote: string;
  /** How to confirm a request is genuinely from this crawler. */
  readonly verify: string;
  readonly recommendation: "allow" | "block" | "depends";
  readonly recommendationWhy: string;
  readonly docsUrl?: string;
  /** Other catalog crawler ids worth comparing. */
  readonly relatedCrawlerIds: readonly string[];
  /** Hand-picked guide/tool links beyond the computed crawler links. */
  readonly relatedLinks?: ReadonlyArray<{ readonly title: string; readonly href: Route; readonly description?: string }>;
  readonly faqs: readonly FaqItem[];
}

/**
 * Profiles for the high-search crawlers that don't already have a dedicated 12C
 * page. The five major AI crawlers (GPTBot, ClaudeBot, CCBot, PerplexityBot,
 * Google-Extended) keep their existing `/<crawler>-robots-txt` pages; the hub links
 * out to them (see {@link EXISTING_CRAWLER_PAGES}).
 */
const PROFILES: readonly CrawlerProfile[] = [
  {
    id: "googlebot",
    summary:
      "Googlebot is the crawler behind Google Search — the single most important bot for almost every website. It fetches and renders your pages so they can be indexed and ranked. If you accidentally block Googlebot in robots.txt, you can disappear from Google entirely.",
    whatItDoes: [
      "Discovers and re-crawls your pages to keep Google's index current.",
      "Runs as two main variants — Googlebot Smartphone (primary, mobile-first) and Googlebot Desktop.",
      "Renders JavaScript via an evergreen Chromium, so blocking CSS/JS can hurt how pages are understood.",
    ],
    whyItMatters: [
      "Blocking Googlebot removes you from Google Search — the most common catastrophic robots.txt mistake.",
      "robots.txt controls crawling, not indexing: a disallowed URL can still be indexed without a snippet if it's linked elsewhere. Use noindex (not robots.txt) to keep a page out of the index.",
      "Blocking resource files (CSS/JS) can degrade rendering and rankings.",
    ],
    honors: "yes",
    honorsNote: "Googlebot strictly follows the robots.txt standard (RFC 9309) that Google co-authored.",
    affectsRanking: true,
    affectsRankingNote:
      "This is the one crawler where a robots.txt block directly affects ranking — it controls your Google visibility.",
    verify:
      "Don't trust the user-agent string alone — it is easily spoofed. Verify with a reverse DNS lookup on the request IP (it must resolve to googlebot.com or google.com and forward-confirm), or match against Google's published crawler IP ranges.",
    recommendation: "allow",
    recommendationWhy: "Allow Googlebot unless you intend to be invisible in Google Search.",
    docsUrl: "https://developers.google.com/search/docs/crawling-indexing/googlebot",
    relatedCrawlerIds: ["bingbot", "slurp", "google-extended"],
    relatedLinks: [
      { title: "robots.txt vs noindex", href: "/robots-txt-vs-noindex", description: "Why blocking ≠ deindexing." },
      { title: "robots.txt for SEO", href: "/robots-txt-seo-guide", description: "Use robots.txt without hurting rankings." },
    ],
    faqs: [
      { question: "Will blocking Googlebot remove my site from Google?", answer: "Yes. Disallowing Googlebot in robots.txt stops Google from crawling your pages, which removes them from Search over time. Only block specific paths you genuinely don't want crawled, and never Disallow: / under User-agent: Googlebot or *." },
      { question: "Does robots.txt stop Google from indexing a page?", answer: "No. robots.txt blocks crawling, not indexing. A blocked URL can still appear in Google (without a description) if other pages link to it. To keep a page out of the index, allow crawling and use a noindex meta tag or X-Robots-Tag header instead." },
      { question: "How do I verify a request is really from Googlebot?", answer: "Run a reverse DNS lookup on the requesting IP; genuine Googlebot resolves to a googlebot.com or google.com host and forward-confirms. You can also match Google's published IP ranges. The user-agent string alone can be faked." },
    ],
  },
  {
    id: "bingbot",
    summary:
      "Bingbot is Microsoft's search crawler. It powers Bing Search and, by extension, the web results in Microsoft Copilot and other Bing-backed products. For most sites it is the second-most important crawler after Googlebot.",
    whatItDoes: [
      "Crawls and indexes pages for Bing Search.",
      "Feeds web results into Copilot and Bing-powered partners (e.g. DuckDuckGo, Yahoo).",
      "Supports the IndexNow protocol for instant change notifications.",
    ],
    whyItMatters: [
      "Bing drives a meaningful share of desktop and enterprise search traffic.",
      "Bing results increasingly surface inside AI assistants, so Bing visibility now also affects AI answer presence.",
      "Blocking Bingbot removes you from Bing and every product that uses Bing's index.",
    ],
    honors: "yes",
    honorsNote: "Bingbot follows robots.txt and also supports the crawl-delay directive, which Google ignores.",
    affectsRanking: true,
    affectsRankingNote: "Blocking Bingbot affects Bing ranking but has no effect on Google.",
    verify:
      "Verify via reverse DNS (genuine Bingbot resolves to a search.msn.com host and forward-confirms) or Bing's published IP list / the Bing Verify Bingbot tool.",
    recommendation: "allow",
    recommendationWhy: "Allow Bingbot to stay visible in Bing and the AI products built on it.",
    docsUrl: "https://www.bing.com/webmasters/help/which-crawlers-does-bing-use-8c184ec0",
    relatedCrawlerIds: ["googlebot", "slurp"],
    relatedLinks: [
      { title: "robots.txt Sitemap", href: "/robots-txt-sitemap", description: "Bing reads your sitemap line too." },
    ],
    faqs: [
      { question: "Does Bingbot support crawl-delay?", answer: "Yes. Unlike Googlebot, Bingbot honors the Crawl-delay directive in robots.txt, so you can throttle its request rate. You can also set the crawl rate in Bing Webmaster Tools." },
      { question: "Does blocking Bingbot affect Google?", answer: "No. Bingbot and Googlebot are separate crawlers from different companies. Blocking one has no effect on the other." },
    ],
  },
  {
    id: "slurp",
    summary:
      "Slurp is Yahoo's historical search crawler. Yahoo Search is now largely powered by Bing, so Slurp's role is far smaller than it once was, but it still appears in logs and can be controlled in robots.txt.",
    whatItDoes: [
      "Crawls pages for the parts of Yahoo that still use a Yahoo-operated index.",
      "Appears in server logs even though most Yahoo Search results come from Bing.",
    ],
    whyItMatters: [
      "Most Yahoo Search visibility now depends on Bingbot, not Slurp.",
      "Slurp is low-volume for most sites; it rarely needs special handling.",
    ],
    honors: "yes",
    honorsNote: "Slurp respects robots.txt directives.",
    affectsRanking: false,
    affectsRankingNote:
      "Because Yahoo Search is Bing-powered, your Yahoo visibility tracks Bingbot far more than Slurp.",
    verify: "Verify via reverse DNS to a crawl.yahoo.net host with forward confirmation.",
    recommendation: "allow",
    recommendationWhy: "Harmless to allow; only block if it crawls too aggressively for a small server.",
    relatedCrawlerIds: ["bingbot", "googlebot"],
    faqs: [
      { question: "Is Yahoo Slurp still used?", answer: "Yes, but minimally. Yahoo Search results are predominantly served from Bing's index, so Bingbot matters far more than Slurp for Yahoo visibility. Slurp still shows up in some logs." },
    ],
  },
  {
    id: "ahrefsbot",
    summary:
      "AhrefsBot is the crawler for Ahrefs, a major SEO platform. It builds Ahrefs' backlink index and site-audit data. It does not affect your search rankings — it only feeds a third-party SEO tool.",
    whatItDoes: [
      "Crawls the web to map links between pages for Ahrefs' backlink database.",
      "Powers Ahrefs Site Explorer, Site Audit, and rank-tracking features.",
    ],
    whyItMatters: [
      "Blocking AhrefsBot hides your backlink profile from Ahrefs users — including competitors researching you.",
      "On large sites, SEO crawlers add server load without sending you traffic.",
      "It has no effect on Google or Bing rankings.",
    ],
    honors: "yes",
    honorsNote: "AhrefsBot honors robots.txt and supports Crawl-delay to throttle its rate.",
    affectsRanking: false,
    affectsRankingNote: "AhrefsBot feeds the Ahrefs tool only; blocking it does not change your search rankings.",
    verify: "Verify via reverse DNS to an ahrefs.com / ahrefs.net host, or match Ahrefs' published IP ranges.",
    recommendation: "allow",
    recommendationWhy:
      "Allow it if you use Ahrefs or want full backlink visibility; block it to cut crawl load or deny competitor research.",
    docsUrl: "https://ahrefs.com/robot",
    relatedCrawlerIds: ["semrushbot", "mj12bot"],
    relatedLinks: [
      { title: "Why robots.txt is important", href: "/why-robots-txt-is-important", description: "Crawl budget and bot load." },
    ],
    faqs: [
      { question: "Does blocking AhrefsBot hurt my SEO?", answer: "No. AhrefsBot only feeds the Ahrefs SEO tool. It is unrelated to Googlebot or Bingbot, so blocking it has zero effect on your search rankings — it only limits what Ahrefs (and its users) can see about your backlinks." },
      { question: "How do I block AhrefsBot?", answer: "Add a group: User-agent: AhrefsBot followed by Disallow: /. You can also slow it down with Crawl-delay instead of blocking it outright." },
    ],
  },
  {
    id: "semrushbot",
    summary:
      "SemrushBot is the crawler for Semrush, an all-in-one SEO and marketing platform. It collects backlink, keyword, and site-audit data. Like other SEO crawlers, it has no influence on your actual search rankings.",
    whatItDoes: [
      "Crawls pages and links to build Semrush's backlink and competitive-research databases.",
      "Runs several named sub-bots (e.g. for site audit and backlink discovery).",
    ],
    whyItMatters: [
      "Blocking SemrushBot limits competitor and backlink visibility in Semrush.",
      "It can add crawl load on large sites without sending traffic.",
      "No effect on Google or Bing rankings.",
    ],
    honors: "yes",
    honorsNote: "SemrushBot follows robots.txt and supports Crawl-delay.",
    affectsRanking: false,
    affectsRankingNote: "SemrushBot feeds the Semrush tool only; it does not affect search rankings.",
    verify: "Verify via reverse DNS to a semrush.com / semrush.net host, or Semrush's published IP ranges.",
    recommendation: "allow",
    recommendationWhy:
      "Allow it if you use Semrush or want full visibility; block it to reduce crawl load or limit competitor research.",
    docsUrl: "https://www.semrush.com/bot/",
    relatedCrawlerIds: ["ahrefsbot", "mj12bot"],
    faqs: [
      { question: "Does SemrushBot affect my Google ranking?", answer: "No. SemrushBot only collects data for the Semrush platform. It is separate from search-engine crawlers, so blocking it has no effect on how you rank in Google or Bing." },
    ],
  },
  {
    id: "bytespider",
    summary:
      "Bytespider is ByteDance's web crawler, used to gather training data for its AI products (the company behind TikTok). It is known for high-volume crawling and a patchy record of honoring robots.txt, so many sites block it to save bandwidth.",
    whatItDoes: [
      "Crawls large volumes of pages to collect AI training data for ByteDance.",
      "Has been widely reported as one of the most aggressive AI crawlers by request volume.",
    ],
    whyItMatters: [
      "Heavy crawl volume can meaningfully increase server load and bandwidth costs.",
      "Reports indicate inconsistent robots.txt compliance, so a rule may not fully stop it.",
      "Blocking it keeps your content out of ByteDance's AI training.",
    ],
    honors: "partial",
    honorsNote:
      "ByteDance states Bytespider honors robots.txt, but third-party reports describe cases where it crawled despite disallow rules. Verify behavior on your own logs.",
    affectsRanking: false,
    affectsRankingNote: "Bytespider is an AI training crawler, not a search engine — blocking it does not affect rankings.",
    verify:
      "There is no widely published reverse-DNS verification method; match the Bytespider user-agent and watch request IPs and volume in your logs. Because compliance is imperfect, server-level blocking (firewall / WAF) may be needed in addition to robots.txt.",
    recommendation: "block",
    recommendationWhy:
      "High-volume training crawler with imperfect compliance — most sites block it to protect bandwidth and opt out of training.",
    relatedCrawlerIds: ["gptbot", "ccbot", "amazonbot"],
    relatedLinks: [
      { title: "AI Crawler Directory", href: "/ai-crawlers-directory", description: "Every AI crawler compared." },
      { title: "Block GPTBot", href: "/gptbot-robots-txt", description: "OpenAI's training crawler." },
    ],
    faqs: [
      { question: "Does Bytespider respect robots.txt?", answer: "Officially yes, but multiple site operators have reported Bytespider crawling pages that robots.txt disallowed. If a robots.txt rule doesn't stop it on your logs, block it at the server or WAF level as well." },
      { question: "Why is Bytespider crawling my site so much?", answer: "Bytespider is one of the highest-volume AI training crawlers. On larger sites it can generate substantial request traffic, which is why many operators block it to control bandwidth." },
    ],
  },
  {
    id: "amazonbot",
    summary:
      "Amazonbot is Amazon's web crawler. It indexes content to improve Amazon products and services, including Alexa's ability to answer questions and Amazon's AI features. It honors robots.txt and does not affect search-engine rankings.",
    whatItDoes: [
      "Crawls pages so Alexa and Amazon services can answer questions and surface information.",
      "Supports Amazon's broader product and AI initiatives.",
    ],
    whyItMatters: [
      "Allowing it can let Alexa answer using your content; blocking it opts you out of Amazon AI uses.",
      "It is not a search engine, so it does not influence Google/Bing visibility.",
    ],
    honors: "yes",
    honorsNote: "Amazon documents that Amazonbot respects robots.txt.",
    affectsRanking: false,
    affectsRankingNote: "Amazonbot does not power a web search engine, so blocking it has no ranking impact.",
    verify: "Verify via reverse DNS to a crawl.amazonbot.amazon host with forward confirmation, per Amazon's docs.",
    recommendation: "depends",
    recommendationWhy:
      "Allow it if you want Alexa/Amazon to use your content; block it to opt out of Amazon AI and data collection.",
    docsUrl: "https://developer.amazon.com/amazonbot",
    relatedCrawlerIds: ["bytespider", "gptbot", "applebot-extended"],
    relatedLinks: [
      { title: "AI Crawler Directory", href: "/ai-crawlers-directory", description: "Compare every AI crawler." },
    ],
    faqs: [
      { question: "What is Amazonbot used for?", answer: "Amazonbot crawls the web to support Amazon products and services, including Alexa answering user questions and Amazon's AI features. It is not a search-engine crawler." },
      { question: "Should I block Amazonbot?", answer: "It depends. Allow it if you want Alexa and Amazon services to use your content; block it if you'd rather opt out of Amazon's data collection and AI use. Either way, your Google and Bing rankings are unaffected." },
    ],
  },
  {
    id: "applebot-extended",
    summary:
      "Applebot-Extended is a robots.txt control token, not a separate crawler. It lets you opt out of Apple using content (gathered by the regular Applebot) to train Apple Intelligence and other generative models — without affecting Siri or Spotlight.",
    whatItDoes: [
      "Acts as an opt-out signal: blocking Applebot-Extended tells Apple not to use your content for AI model training.",
      "Does not fetch pages itself — it modifies how content already crawled by Applebot may be used.",
    ],
    whyItMatters: [
      "Blocking it keeps your content out of Apple's generative-AI training while preserving Siri Suggestions and Spotlight features.",
      "It is the Apple equivalent of Google-Extended — an AI-use control separate from the search crawler.",
    ],
    honors: "yes",
    honorsNote: "Apple documents Applebot-Extended as a robots.txt opt-out it honors.",
    affectsRanking: false,
    affectsRankingNote:
      "Blocking Applebot-Extended only opts out of AI training. Siri, Spotlight, and Safari suggestions (which use the standard Applebot) are unaffected.",
    verify:
      "Applebot-Extended does not crawl, so there's nothing to verify in logs — it only changes how Applebot's data is used. Verify the standard Applebot via reverse DNS to an applebot.apple.com host.",
    recommendation: "depends",
    recommendationWhy:
      "Block it to opt out of Apple Intelligence training; leave it allowed if you're comfortable with that use. Either way Apple's search-style features keep working.",
    docsUrl: "https://support.apple.com/en-us/119829",
    relatedCrawlerIds: ["google-extended", "gptbot", "claudebot"],
    relatedLinks: [
      { title: "Google-Extended in robots.txt", href: "/google-extended-robots-txt", description: "Google's equivalent AI opt-out." },
    ],
    faqs: [
      { question: "What is the difference between Applebot and Applebot-Extended?", answer: "Applebot is the crawler that fetches pages for Siri and Spotlight. Applebot-Extended is a separate robots.txt token that controls whether Apple may use that already-crawled content for AI model training. Blocking Applebot-Extended opts you out of training without affecting Siri or Spotlight." },
      { question: "Does blocking Applebot-Extended hurt Siri or Spotlight?", answer: "No. Applebot-Extended only governs AI training use. Siri Suggestions, Spotlight, and Safari results rely on the standard Applebot, which is unaffected." },
    ],
  },
  {
    id: "meta-externalagent",
    summary:
      "Meta-ExternalAgent is Meta's crawler for collecting data to train its AI models, including the Llama family and Meta AI. It is distinct from facebookexternalhit, which only fetches pages to build link previews.",
    whatItDoes: [
      "Crawls publicly available pages to gather AI training data for Meta.",
      "Is separate from facebookexternalhit (link previews) and from any Facebook/Instagram indexing.",
    ],
    whyItMatters: [
      "Blocking it keeps your content out of Meta's AI training.",
      "Because link previews use a different agent, blocking Meta-ExternalAgent does not break Facebook/Instagram sharing.",
    ],
    honors: "yes",
    honorsNote: "Meta documents that Meta-ExternalAgent honors robots.txt.",
    affectsRanking: false,
    affectsRankingNote: "It is an AI training crawler, not a search engine — blocking it has no ranking impact.",
    verify: "Match the Meta-ExternalAgent user-agent token and Meta's published crawler IP ranges in your logs.",
    recommendation: "block",
    recommendationWhy:
      "Block it to opt out of Meta AI training; your social link previews keep working because they use a different agent.",
    docsUrl: "https://developers.facebook.com/docs/sharing/bot/",
    relatedCrawlerIds: ["facebookexternalhit", "gptbot", "claudebot"],
    relatedLinks: [
      { title: "AI Crawler Directory", href: "/ai-crawlers-directory", description: "Compare every AI crawler." },
    ],
    faqs: [
      { question: "Will blocking Meta-ExternalAgent break Facebook link previews?", answer: "No. Link previews on Facebook and Instagram are generated by facebookexternalhit, a separate agent. Blocking Meta-ExternalAgent only opts you out of Meta's AI training and leaves sharing previews intact." },
      { question: "What does Meta-ExternalAgent do?", answer: "It crawls public web pages to collect training data for Meta's AI models, such as Llama and Meta AI. It is not a search crawler and does not affect your visibility on Facebook or in search engines." },
    ],
  },
  {
    id: "facebookexternalhit",
    summary:
      "facebookexternalhit is Meta's link-preview crawler. When someone shares your URL on Facebook, Instagram, Messenger, or WhatsApp, this bot fetches the page to read its Open Graph tags and build the preview card. Blocking it removes your rich previews on Meta platforms.",
    whatItDoes: [
      "Fetches a shared URL to read Open Graph / meta tags and generate the preview thumbnail, title, and description.",
      "Runs when links are posted or scraped on Facebook, Instagram, Messenger, and WhatsApp.",
    ],
    whyItMatters: [
      "Blocking it means links to your site show no image or description when shared on Meta platforms — hurting click-through.",
      "It is not used for AI training (that's Meta-ExternalAgent) and is not a search crawler.",
    ],
    honors: "partial",
    honorsNote:
      "facebookexternalhit generally respects robots.txt, but because previews are user-triggered, behavior can differ from a steady crawler. Don't block it if you want share previews.",
    affectsRanking: false,
    affectsRankingNote: "It only builds social previews; it has no effect on search rankings.",
    verify: "Match the facebookexternalhit user-agent and Meta's published IP ranges.",
    recommendation: "allow",
    recommendationWhy:
      "Allow it so your links render rich previews when shared on Facebook, Instagram, and WhatsApp.",
    docsUrl: "https://developers.facebook.com/docs/sharing/webmasters/web-crawlers/",
    relatedCrawlerIds: ["meta-externalagent", "twitterbot"],
    faqs: [
      { question: "Why are my Facebook share previews blank?", answer: "Often because facebookexternalhit is blocked in robots.txt (or your Open Graph tags are missing). Allow the facebookexternalhit user-agent and make sure your pages expose og:title, og:description, and og:image." },
      { question: "Is facebookexternalhit the same as Meta's AI crawler?", answer: "No. facebookexternalhit builds link previews; Meta-ExternalAgent collects AI training data. They are separate agents, so you can allow previews while blocking AI training." },
    ],
  },
];

const PROFILE_BY_ID = new Map(PROFILES.map((p) => [p.id, p]));

/** Look up the editorial profile for a crawler, if it has a dedicated page. */
export function crawlerProfile(id: string): CrawlerProfile | undefined {
  return PROFILE_BY_ID.get(id);
}

/** Ids (and route params) of crawlers that get a standalone `/crawlers/[id]` page. */
export const PROFILE_IDS: readonly string[] = PROFILES.map((p) => p.id);

/**
 * Crawlers that already have a dedicated 12C landing page. The hub links out to
 * these instead of minting a duplicate `/crawlers/[id]` URL.
 */
export const EXISTING_CRAWLER_PAGES: Readonly<Record<string, Route>> = {
  gptbot: "/gptbot-robots-txt",
  claudebot: "/claudebot-robots-txt",
  ccbot: "/ccbot-robots-txt",
  perplexitybot: "/perplexitybot-robots-txt",
  "google-extended": "/google-extended-robots-txt",
};

/**
 * The canonical page for a crawler id, or `undefined` if it only exists as a hub
 * row (link to the on-page anchor instead). Order: existing 12C page → profile page.
 */
export function crawlerHref(id: string): Route | undefined {
  if (EXISTING_CRAWLER_PAGES[id]) return EXISTING_CRAWLER_PAGES[id];
  if (PROFILE_BY_ID.has(id)) return `/crawlers/${id}` as Route;
  return undefined;
}

/** Profiled-crawler page paths, for the sitemap. */
export function crawlerPagePaths(): string[] {
  return PROFILE_IDS.map((id) => `/crawlers/${id}`);
}

/** The full catalog with each crawler's resolved directory href (for the hub). */
export interface DirectoryRow {
  readonly crawler: Crawler;
  readonly href: Route | undefined;
}

export function directoryRows(): DirectoryRow[] {
  return ALL_CRAWLERS.map((crawler) => ({ crawler, href: crawlerHref(crawler.id) }));
}

/** Resolve the {@link Crawler} catalog identity for a profile. */
export function profileCrawler(id: string): Crawler | undefined {
  return getCrawler(id);
}
