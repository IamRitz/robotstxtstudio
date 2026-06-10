/**
 * Boundary integration tests for the fetch-capable API routes (Phase 15D).
 *
 * Uses a literal private IP (`10.0.0.1`) as the target: it passes schema validation
 * but the SSRF guard blocks it *before any network call*, so these tests never touch
 * the network. Verifies both the per-IP rate limiter and the SSRF refusal at the HTTP
 * boundary, including the friendly JSON error shape.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { POST as analyzePost } from "./analyze/route";
import { POST as fetchRobotsPost } from "./fetch-robots/route";
import { RATE_LIMIT, resetRateLimits } from "@/lib/rate-limit";

function post(domain: string, ip: string): Request {
  return new Request("https://robotstxtstudio.com/api/analyze", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify({ domain }),
  });
}

beforeEach(() => resetRateLimits());

describe("POST /api/analyze", () => {
  it("rate-limits a single IP and returns a friendly 429 with Retry-After", async () => {
    const ip = "203.0.113.10";
    for (let i = 0; i < RATE_LIMIT; i++) {
      const res = await analyzePost(post("10.0.0.1", ip));
      expect(res.status).toBe(200); // blocked by SSRF, but allowed by the limiter
    }
    const limited = await analyzePost(post("10.0.0.1", ip));
    expect(limited.status).toBe(429);
    expect(limited.headers.get("Retry-After")).toBeTruthy();
    const json = await limited.json();
    expect(json.error).toMatch(/too many requests/i);
  });

  it("does not rate-limit a different IP", async () => {
    for (let i = 0; i < RATE_LIMIT; i++) await analyzePost(post("10.0.0.1", "203.0.113.11"));
    const other = await analyzePost(post("10.0.0.1", "203.0.113.12"));
    expect(other.status).toBe(200);
  });

  it("refuses a private-IP target without fetching (SSRF guard)", async () => {
    const res = await analyzePost(post("169.254.169.254", "203.0.113.13"));
    expect(res.status).toBe(200);
    const report = await res.json();
    expect(report.fetch.status).toBe("network-error");
    expect(report.fetch.error).toMatch(/security/i);
  });
});

describe("POST /api/fetch-robots", () => {
  function fpost(domain: string, ip: string): Request {
    return new Request("https://robotstxtstudio.com/api/fetch-robots", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify({ domain }),
    });
  }

  it("refuses a private-IP target with a security error (no network)", async () => {
    const res = await fetchRobotsPost(fpost("10.0.0.1", "203.0.113.20"));
    expect(res.status).toBe(200);
    const payload = await res.json();
    expect(payload.status).toBe("network-error");
    expect(payload.error).toMatch(/security/i);
  });

  it("rate-limits with a 429 once the per-IP budget is spent", async () => {
    const ip = "203.0.113.21";
    for (let i = 0; i < RATE_LIMIT; i++) await fetchRobotsPost(fpost("10.0.0.1", ip));
    const limited = await fetchRobotsPost(fpost("10.0.0.1", ip));
    expect(limited.status).toBe(429);
  });
});
