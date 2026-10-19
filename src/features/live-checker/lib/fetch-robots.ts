/**
 * The fetch boundary — the ONLY network IO in the Analyzer.
 *
 * Returns a {@link FetchResult}; never throws and never parses/validates. The
 * `fetchFn` is injectable so the boundary is fully mockable in tests.
 *
 * SSRF guard (Phase 15D): every hostname is resolved and checked against private /
 * internal IP ranges BEFORE we connect, and redirects are followed manually so each
 * hop is re-checked (a public host cannot 302 us onto 169.254.169.254). The 8s
 * timeout and 512 KiB size cap apply across the whole redirect chain.
 */
import type { FetchResult } from "@/types";
import { checkHostAllowed, type LookupFn } from "./ssrf";

/** A minimal fetch signature so tests can supply a mock. */
export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

export interface FetchOptions {
  /** Override the fetch implementation (defaults to `globalThis.fetch`). */
  readonly fetchFn?: FetchLike;
  /** Override DNS resolution for the SSRF guard (defaults to Node DNS). */
  readonly lookupFn?: LookupFn;
  /** Abort after this many milliseconds (default 8000). */
  readonly timeoutMs?: number;
  /** Maximum bytes to accept before flagging `too-large` (default 512 KiB). */
  readonly maxBytes?: number;
  /** Maximum redirect hops to follow before giving up (default 5). */
  readonly maxRedirects?: number;
}

const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_MAX_BYTES = 512 * 1024;
const DEFAULT_MAX_REDIRECTS = 5;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

/** robots.txt should be plain text; HTML/JSON/etc. means "no usable robots.txt". */
function isAcceptableContentType(contentType: string | undefined): boolean {
  if (!contentType) return true; // be lenient when the server omits it
  const lower = contentType.toLowerCase();
  if (lower.includes("text/plain")) return true;
  if (lower.includes("text/html") || lower.includes("application/")) return false;
  return lower.startsWith("text/");
}

/**
 * An HTML document (soft-404 / app shell) rather than a robots.txt body. Looks
 * anywhere in the first 1 KiB, so a leading comment, BOM, or XML prologue doesn't
 * hide it. A real robots.txt never contains these tags outside a `#` comment.
 */
function looksLikeHtml(body: string): boolean {
  const start = body.slice(0, 1024);
  return /<!doctype html|<html[\s>]|<head[\s>]|<body[\s>]/i.test(
    start.replace(/^[ \t]*#.*$/gm, ""),
  );
}

/** Parse a URL, keeping only http(s) targets. Blocks file:/gopher:/data: etc. that
 *  a malicious redirect could use to reach the local filesystem or other schemes. */
function parseHttpUrl(url: string): URL | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Fetch a robots.txt file, mapping every outcome to a {@link FetchResult}. */
export async function fetchRobots(robotsUrl: string, options: FetchOptions = {}): Promise<FetchResult> {
  const fetchFn = options.fetchFn ?? (globalThis.fetch as FetchLike);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let currentUrl = robotsUrl;

  try {
    for (let hop = 0; hop <= maxRedirects; hop++) {
      // SSRF guard, re-run on every hop (initial request + each redirect):
      // 1) scheme must be http(s); 2) host must not resolve to a private/internal IP.
      const parsedUrl = parseHttpUrl(currentUrl);
      if (!parsedUrl) {
        clearTimeout(timer);
        return {
          status: "network-error",
          robotsExists: false,
          requestedUrl: robotsUrl,
          finalUrl: currentUrl,
          redirected: hop > 0,
          error: "Refused for security: only http(s) URLs are allowed.",
        };
      }
      const hostCheck = await checkHostAllowed(parsedUrl.hostname, options.lookupFn);
      if (!hostCheck.allowed) {
        clearTimeout(timer);
        return {
          status: "network-error",
          robotsExists: false,
          requestedUrl: robotsUrl,
          finalUrl: currentUrl,
          redirected: hop > 0,
          error: `Refused for security: ${hostCheck.reason}.`,
        };
      }

      const response = await fetchFn(currentUrl, {
        redirect: "manual",
        signal: controller.signal,
        headers: { "user-agent": "RobotsTxtStudio/1.0 (+https://robotstxtstudio.com)" },
      });

      // Manual redirect handling so each Location is re-validated by the guard above.
      if (REDIRECT_STATUSES.has(response.status)) {
        const location = response.headers.get("location");
        if (!location) {
          clearTimeout(timer);
          return {
            status: "network-error",
            robotsExists: false,
            requestedUrl: robotsUrl,
            finalUrl: currentUrl,
            redirected: hop > 0,
            httpStatus: response.status,
            error: `Redirect (${response.status}) without a Location header.`,
          };
        }
        currentUrl = new URL(location, currentUrl).toString();
        continue;
      }

      clearTimeout(timer);

      const meta = {
        requestedUrl: robotsUrl,
        finalUrl: response.url || currentUrl,
        httpStatus: response.status,
        redirected: hop > 0,
        contentType: response.headers.get("content-type") ?? undefined,
      };

      // RFC 9309 §2.3.1.3 / Google: any 4xx except 429 means "no robots.txt" (crawl
      // freely). 429 and 5xx mean the policy is unavailable — Google then treats the
      // site as disallowed — so they are failures, never an implicit allow-all.
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return { status: "not-found", robotsExists: false, ...meta };
      }
      if (!response.ok) {
        return { status: "network-error", robotsExists: false, error: `Server responded ${response.status}`, ...meta };
      }

      const body = await response.text();
      if (!isAcceptableContentType(meta.contentType)) {
        // Crawlers parse the body regardless of the header, so keep real rules served
        // with the wrong type; an HTML page simply has no valid rules.
        const html = looksLikeHtml(body);
        return {
          status: "invalid-content-type",
          robotsExists: !html,
          ...(html ? {} : { body: body.slice(0, maxBytes) }),
          error: `Unexpected content-type: ${meta.contentType ?? "unknown"}`,
          ...meta,
        };
      }
      if (body.length > maxBytes) {
        return {
          status: "too-large",
          robotsExists: true,
          body: body.slice(0, maxBytes),
          error: `robots.txt exceeds ${maxBytes} bytes; analyzed the first ${maxBytes}.`,
          ...meta,
        };
      }
      return { status: "ok", robotsExists: true, body, ...meta };
    }

    // Exhausted the redirect budget.
    clearTimeout(timer);
    return {
      status: "network-error",
      robotsExists: false,
      requestedUrl: robotsUrl,
      finalUrl: currentUrl,
      redirected: true,
      error: `Too many redirects (more than ${maxRedirects}).`,
    };
  } catch (error) {
    clearTimeout(timer);
    const aborted = error instanceof Error && error.name === "AbortError";
    return {
      status: aborted ? "timeout" : "network-error",
      robotsExists: false,
      requestedUrl: robotsUrl,
      finalUrl: currentUrl,
      redirected: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}
