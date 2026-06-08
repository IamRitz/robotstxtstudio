/**
 * The fetch boundary — the ONLY network IO in the Analyzer.
 *
 * Returns a {@link FetchResult}; never throws and never parses/validates. The
 * `fetchFn` is injectable so the boundary is fully mockable in tests.
 */
import type { FetchResult } from "@/types";

/** A minimal fetch signature so tests can supply a mock. */
export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

export interface FetchOptions {
  /** Override the fetch implementation (defaults to `globalThis.fetch`). */
  readonly fetchFn?: FetchLike;
  /** Abort after this many milliseconds (default 8000). */
  readonly timeoutMs?: number;
  /** Maximum bytes to accept before flagging `too-large` (default 512 KiB). */
  readonly maxBytes?: number;
}

const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_MAX_BYTES = 512 * 1024;

/** robots.txt should be plain text; HTML/JSON/etc. means "no usable robots.txt". */
function isAcceptableContentType(contentType: string | undefined): boolean {
  if (!contentType) return true; // be lenient when the server omits it
  const lower = contentType.toLowerCase();
  if (lower.includes("text/plain")) return true;
  if (lower.includes("text/html") || lower.includes("application/")) return false;
  return lower.startsWith("text/");
}

/** Fetch a robots.txt file, mapping every outcome to a {@link FetchResult}. */
export async function fetchRobots(robotsUrl: string, options: FetchOptions = {}): Promise<FetchResult> {
  const fetchFn = options.fetchFn ?? (globalThis.fetch as FetchLike);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchFn(robotsUrl, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "RobotsTxtStudio/1.0 (+https://robots-txt-studio.vercel.app)" },
    });
    clearTimeout(timer);

    const meta = {
      requestedUrl: robotsUrl,
      finalUrl: response.url || robotsUrl,
      httpStatus: response.status,
      redirected: Boolean(response.redirected),
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
  } catch (error) {
    clearTimeout(timer);
    const aborted = error instanceof Error && error.name === "AbortError";
    return {
      status: aborted ? "timeout" : "network-error",
      robotsExists: false,
      requestedUrl: robotsUrl,
      redirected: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}
