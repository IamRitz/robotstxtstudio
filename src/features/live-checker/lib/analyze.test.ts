import { describe, expect, it, vi } from "vitest";
import type { FetchLike } from "./fetch-robots";
import { analyze } from "./analyze";

function fakeResponse(body: string, status = 200, contentType = "text/plain"): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    url: "https://example.com/robots.txt",
    redirected: false,
    headers: { get: (k: string) => (k.toLowerCase() === "content-type" ? contentType : null) },
    text: async () => body,
  } as unknown as Response;
}

const NOW = () => new Date("2026-01-01T00:00:00.000Z");

describe("analyze", () => {
  it("fetches and analyzes a live site end-to-end", async () => {
    const fetchFn: FetchLike = async () => fakeResponse("User-agent: *\nDisallow: /admin/");
    const report = await analyze("example.com", { fetchFn, now: NOW });
    expect(report.domain).toBe("example.com");
    expect(report.fetch.status).toBe("ok");
    expect(report.fetchedAt).toBe("2026-01-01T00:00:00.000Z");
    expect(report.file.groups).toHaveLength(1);
  });

  it("propagates a 404 as a not-found report", async () => {
    const fetchFn: FetchLike = async () => fakeResponse("", 404);
    const report = await analyze("example.com", { fetchFn });
    expect(report.fetch.status).toBe("not-found");
  });

  it("returns a network-error report for invalid input without fetching", async () => {
    const fetchFn = vi.fn();
    const report = await analyze("not a domain", { fetchFn: fetchFn as unknown as FetchLike });
    expect(report.fetch.status).toBe("network-error");
    expect(report.domain).toBe("not a domain");
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
