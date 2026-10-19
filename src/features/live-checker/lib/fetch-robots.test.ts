import { describe, expect, it } from "vitest";
import { fetchRobots, type FetchLike } from "./fetch-robots";
import type { LookupFn } from "./ssrf";

interface FakeInit {
  status?: number;
  contentType?: string | null;
  body?: string;
  url?: string;
  location?: string;
}

/** A controllable stand-in for a fetch Response. */
function fakeResponse(init: FakeInit = {}): Response {
  const status = init.status ?? 200;
  return {
    status,
    ok: status >= 200 && status < 300,
    url: init.url ?? "https://example.com/robots.txt",
    redirected: false,
    headers: {
      get: (k: string) => {
        const key = k.toLowerCase();
        if (key === "content-type") return init.contentType ?? "text/plain";
        if (key === "location") return init.location ?? null;
        return null;
      },
    },
    text: async () => init.body ?? "",
  } as unknown as Response;
}

const returning =
  (resp: Response): FetchLike =>
  async () =>
    resp;
const throwing =
  (error: Error): FetchLike =>
  async () => {
    throw error;
  };

/** Permissive DNS so the SSRF guard treats every test host as a public address. */
const publicLookup: LookupFn = async () => [{ address: "93.184.216.34", family: 4 }];
/** A private resolution, for SSRF rejection tests. */
const privateLookup: LookupFn = async () => [{ address: "169.254.169.254", family: 4 }];

const URL_ = "https://example.com/robots.txt";

/** Default opts: a public lookup so unrelated tests don't touch real DNS. */
const opts = (fetchFn: FetchLike, extra: Record<string, unknown> = {}) => ({
  fetchFn,
  lookupFn: publicLookup,
  ...extra,
});

describe("fetchRobots", () => {
  it("returns ok with the body for a text/plain 200", async () => {
    const result = await fetchRobots(
      URL_,
      opts(returning(fakeResponse({ body: "User-agent: *\nDisallow:" }))),
    );
    expect(result).toMatchObject({
      status: "ok",
      robotsExists: true,
      body: "User-agent: *\nDisallow:",
    });
  });

  it("handles an empty file (200, no body)", async () => {
    const result = await fetchRobots(URL_, opts(returning(fakeResponse({ body: "" }))));
    expect(result).toMatchObject({ status: "ok", robotsExists: true, body: "" });
  });

  it("maps 404 to not-found (robots missing, not an error)", async () => {
    const result = await fetchRobots(URL_, opts(returning(fakeResponse({ status: 404 }))));
    expect(result).toMatchObject({ status: "not-found", robotsExists: false, httpStatus: 404 });
  });

  it("flags an HTML page as invalid content-type with no usable body", async () => {
    const html = "<!DOCTYPE html><html><body>Not found</body></html>";
    const result = await fetchRobots(
      URL_,
      opts(returning(fakeResponse({ contentType: "text/html", body: html }))),
    );
    expect(result).toMatchObject({ status: "invalid-content-type", robotsExists: false });
    expect(result.body).toBeUndefined();
  });

  it.each([
    "<!-- served by edge -->\n<!DOCTYPE html><html><body>404</body></html>",
    '\uFEFF<html lang="en"><head></head><body></body></html>',
    '<?xml version="1.0"?>\n<html xmlns="http://www.w3.org/1999/xhtml"></html>',
  ])("recognizes HTML even when it doesn't start with the doctype (%#)", async (html) => {
    const result = await fetchRobots(
      URL_,
      opts(returning(fakeResponse({ contentType: "text/html", body: html }))),
    );
    expect(result).toMatchObject({ status: "invalid-content-type", robotsExists: false });
    expect(result.body).toBeUndefined();
  });

  it("doesn't mistake a commented mention of <html> in real rules for an HTML page", async () => {
    const body = "# see <html> docs\nUser-agent: *\nDisallow: /tmp/";
    const result = await fetchRobots(
      URL_,
      opts(returning(fakeResponse({ contentType: "application/octet-stream", body }))),
    );
    expect(result).toMatchObject({ status: "invalid-content-type", robotsExists: true, body });
  });

  it("keeps real rules served with the wrong content-type (crawlers ignore the header)", async () => {
    const result = await fetchRobots(
      URL_,
      opts(
        returning(fakeResponse({ contentType: "text/html", body: "User-agent: *\nDisallow: /" })),
      ),
    );
    expect(result).toMatchObject({
      status: "invalid-content-type",
      robotsExists: true,
      body: "User-agent: *\nDisallow: /",
    });
  });

  it.each([401, 403, 410])(
    "maps %i to not-found (RFC 9309: 4xx means no robots.txt)",
    async (code) => {
      const result = await fetchRobots(URL_, opts(returning(fakeResponse({ status: code }))));
      expect(result).toMatchObject({ status: "not-found", robotsExists: false, httpStatus: code });
    },
  );

  it("maps 429 to network-error, never to an implicit allow-all", async () => {
    const result = await fetchRobots(URL_, opts(returning(fakeResponse({ status: 429 }))));
    expect(result).toMatchObject({ status: "network-error", httpStatus: 429 });
  });

  it("flags responses over the byte cap as too-large and truncates", async () => {
    const result = await fetchRobots(
      URL_,
      opts(returning(fakeResponse({ body: "x".repeat(100) })), { maxBytes: 10 }),
    );
    expect(result.status).toBe("too-large");
    expect(result.body).toHaveLength(10);
  });

  it("follows a redirect manually and records the final URL", async () => {
    let call = 0;
    const fetchFn: FetchLike = async () => {
      call += 1;
      return call === 1
        ? fakeResponse({ status: 301, location: "https://www.example.com/robots.txt" })
        : fakeResponse({
            url: "https://www.example.com/robots.txt",
            body: "User-agent: *\nDisallow:",
          });
    };
    const result = await fetchRobots(URL_, opts(fetchFn));
    expect(result).toMatchObject({
      status: "ok",
      redirected: true,
      finalUrl: "https://www.example.com/robots.txt",
    });
  });

  it("maps a 5xx to network-error", async () => {
    const result = await fetchRobots(URL_, opts(returning(fakeResponse({ status: 503 }))));
    expect(result).toMatchObject({ status: "network-error", httpStatus: 503 });
  });

  it("maps an aborted request to timeout", async () => {
    const abort = new Error("aborted");
    abort.name = "AbortError";
    const result = await fetchRobots(URL_, opts(throwing(abort)));
    expect(result.status).toBe("timeout");
  });

  it("maps a thrown TypeError to network-error", async () => {
    const result = await fetchRobots(URL_, opts(throwing(new TypeError("fail"))));
    expect(result).toMatchObject({ status: "network-error", robotsExists: false });
  });

  // ── SSRF guard (Phase 15D) ──────────────────────────────────────────────────

  it("refuses a host that resolves to a private/metadata address without fetching", async () => {
    let called = false;
    const fetchFn: FetchLike = async () => {
      called = true;
      return fakeResponse();
    };
    const result = await fetchRobots(URL_, { fetchFn, lookupFn: privateLookup });
    expect(result.status).toBe("network-error");
    expect(result.error).toMatch(/security/i);
    expect(called).toBe(false);
  });

  it("refuses a literal private IP target before any DNS or fetch", async () => {
    let called = false;
    const fetchFn: FetchLike = async () => {
      called = true;
      return fakeResponse();
    };
    const result = await fetchRobots("http://127.0.0.1/robots.txt", {
      fetchFn,
      lookupFn: publicLookup,
    });
    expect(result.status).toBe("network-error");
    expect(called).toBe(false);
  });

  it("re-checks redirect hops and refuses a redirect onto a private IP", async () => {
    // Public host (first hop allowed) 302s to an internal host that resolves private.
    const lookupFn: LookupFn = async (host) =>
      host === "internal.evil.test"
        ? [{ address: "10.0.0.5", family: 4 }]
        : [{ address: "93.184.216.34", family: 4 }];
    let secondFetched = false;
    const fetchFn: FetchLike = async (url) => {
      if (url === URL_)
        return fakeResponse({ status: 302, location: "http://internal.evil.test/robots.txt" });
      secondFetched = true;
      return fakeResponse({ body: "secret" });
    };
    const result = await fetchRobots(URL_, { fetchFn, lookupFn });
    expect(result.status).toBe("network-error");
    expect(result.error).toMatch(/security/i);
    expect(secondFetched).toBe(false);
  });

  it("refuses a redirect to a non-http(s) scheme", async () => {
    let secondFetched = false;
    const fetchFn: FetchLike = async (url) => {
      if (url === URL_) return fakeResponse({ status: 302, location: "file:///etc/passwd" });
      secondFetched = true;
      return fakeResponse({ body: "secret" });
    };
    const result = await fetchRobots(URL_, { fetchFn, lookupFn: publicLookup });
    expect(result.status).toBe("network-error");
    expect(result.error).toMatch(/http\(s\)/i);
    expect(secondFetched).toBe(false);
  });

  it("stops after too many redirects", async () => {
    const fetchFn: FetchLike = async (url) => fakeResponse({ status: 302, location: `${url}x` });
    const result = await fetchRobots(URL_, { fetchFn, lookupFn: publicLookup, maxRedirects: 2 });
    expect(result.status).toBe("network-error");
    expect(result.error).toMatch(/too many redirects/i);
  });
});
