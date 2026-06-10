import { beforeEach, describe, expect, it } from "vitest";
import { clientIp, RATE_LIMIT, rateLimit, resetRateLimits } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => resetRateLimits());

  it("allows up to the limit, then blocks within the window", () => {
    const opts = { now: 1000, limit: 3, windowMs: 60_000 };
    expect(rateLimit("ip", opts).allowed).toBe(true);
    expect(rateLimit("ip", opts).allowed).toBe(true);
    const third = rateLimit("ip", opts);
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);

    const blocked = rateLimit("ip", opts);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets after the window elapses", () => {
    const limit = 2;
    expect(rateLimit("ip", { now: 0, limit, windowMs: 1000 }).allowed).toBe(true);
    expect(rateLimit("ip", { now: 500, limit, windowMs: 1000 }).allowed).toBe(true);
    expect(rateLimit("ip", { now: 900, limit, windowMs: 1000 }).allowed).toBe(false);
    // Window has passed → counter resets.
    expect(rateLimit("ip", { now: 1001, limit, windowMs: 1000 }).allowed).toBe(true);
  });

  it("tracks each key (IP) independently", () => {
    const opts = { now: 0, limit: 1, windowMs: 1000 };
    expect(rateLimit("a", opts).allowed).toBe(true);
    expect(rateLimit("a", opts).allowed).toBe(false);
    expect(rateLimit("b", opts).allowed).toBe(true);
  });

  it("exposes a sane default limit", () => {
    expect(RATE_LIMIT).toBeGreaterThan(0);
  });
});

describe("clientIp", () => {
  const req = (headers: Record<string, string>) => new Request("https://x.test", { headers });

  it("uses the first x-forwarded-for entry", () => {
    expect(clientIp(req({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip", () => {
    expect(clientIp(req({ "x-real-ip": "203.0.113.9" }))).toBe("203.0.113.9");
  });

  it("funnels missing headers into a single shared bucket", () => {
    expect(clientIp(req({}))).toBe("unknown");
  });
});
