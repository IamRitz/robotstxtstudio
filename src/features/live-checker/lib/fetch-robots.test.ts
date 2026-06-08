import { describe, expect, it } from "vitest";
import { fetchRobots, type FetchLike } from "./fetch-robots";

interface FakeInit {
  status?: number;
  contentType?: string | null;
  body?: string;
  url?: string;
  redirected?: boolean;
}

/** A controllable stand-in for a fetch Response. */
function fakeResponse(init: FakeInit = {}): Response {
  const status = init.status ?? 200;
  return {
    status,
    ok: status >= 200 && status < 300,
    url: init.url ?? "https://example.com/robots.txt",
    redirected: init.redirected ?? false,
    headers: { get: (k: string) => (k.toLowerCase() === "content-type" ? (init.contentType ?? "text/plain") : null) },
    text: async () => init.body ?? "",
  } as unknown as Response;
}

const returning = (resp: Response): FetchLike => async () => resp;
const throwing = (error: Error): FetchLike => async () => {
  throw error;
};

const URL_ = "https://example.com/robots.txt";

describe("fetchRobots", () => {
  it("returns ok with the body for a text/plain 200", async () => {
    const result = await fetchRobots(URL_, { fetchFn: returning(fakeResponse({ body: "User-agent: *\nDisallow:" })) });
    expect(result).toMatchObject({ status: "ok", robotsExists: true, body: "User-agent: *\nDisallow:" });
  });

  it("handles an empty file (200, no body)", async () => {
    const result = await fetchRobots(URL_, { fetchFn: returning(fakeResponse({ body: "" })) });
    expect(result).toMatchObject({ status: "ok", robotsExists: true, body: "" });
  });

  it("maps 404 to not-found (robots missing, not an error)", async () => {
    const result = await fetchRobots(URL_, { fetchFn: returning(fakeResponse({ status: 404 })) });
    expect(result).toMatchObject({ status: "not-found", robotsExists: false, httpStatus: 404 });
  });

  it("flags HTML responses as invalid content-type", async () => {
    const result = await fetchRobots(URL_, { fetchFn: returning(fakeResponse({ contentType: "text/html" })) });
    expect(result).toMatchObject({ status: "invalid-content-type", robotsExists: false });
  });

  it("flags responses over the byte cap as too-large and truncates", async () => {
    const result = await fetchRobots(URL_, {
      fetchFn: returning(fakeResponse({ body: "x".repeat(100) })),
      maxBytes: 10,
    });
    expect(result.status).toBe("too-large");
    expect(result.body).toHaveLength(10);
  });

  it("records redirects and the final URL", async () => {
    const result = await fetchRobots(URL_, {
      fetchFn: returning(fakeResponse({ redirected: true, url: "https://www.example.com/robots.txt" })),
    });
    expect(result).toMatchObject({ redirected: true, finalUrl: "https://www.example.com/robots.txt" });
  });

  it("maps a 5xx to network-error", async () => {
    const result = await fetchRobots(URL_, { fetchFn: returning(fakeResponse({ status: 503 })) });
    expect(result).toMatchObject({ status: "network-error", httpStatus: 503 });
  });

  it("maps an aborted request to timeout", async () => {
    const abort = new Error("aborted");
    abort.name = "AbortError";
    const result = await fetchRobots(URL_, { fetchFn: throwing(abort) });
    expect(result.status).toBe("timeout");
  });

  it("maps a thrown TypeError to network-error", async () => {
    const result = await fetchRobots(URL_, { fetchFn: throwing(new TypeError("fail")) });
    expect(result).toMatchObject({ status: "network-error", robotsExists: false });
  });
});
