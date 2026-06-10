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

      if (response.status === 404) {
        return { status: "not-found", robotsExists: false, ...meta };
      }
      if (!response.ok) {
        return { status: "network-error", robotsExists: false, error: `Server responded ${response.status}`, ...meta };
      }
      if (!isAcceptableContentType(meta.contentType)) {
        return {
          status: "invalid-content-type",
          robotsExists: false,
          error: `Unexpected content-type: ${meta.contentType ?? "unknown"}`,
          ...meta,
        };
      }

      const body = await response.text();
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
