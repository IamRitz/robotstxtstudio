import { NextResponse } from "next/server";
import { analyzeRequestSchema } from "@/schemas";
import { fetchRobots, toRobotsUrl } from "@/features/live-checker";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Fetch a site's raw robots.txt for the paste-or-fetch workflows (Validator, URL
 * Tester, Explainer). Reuses the Analyzer's fetch boundary + request schema — no
 * duplicated fetch or validation logic. Returns a slim, client-friendly payload.
 * Rate-limited per IP; the fetch boundary it reuses is SSRF-guarded.
 */
export const runtime = "nodejs";

export interface FetchRobotsResponse {
  readonly status: string;
  readonly robotsExists: boolean;
  readonly body: string;
  readonly finalUrl: string;
  readonly error?: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  const limit = rateLimit(`fetch-robots:${clientIp(request)}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = analyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid domain, e.g. example.com" }, { status: 400 });
  }

  const target = toRobotsUrl(parsed.data.domain);
  if (!target) {
    return NextResponse.json({ error: "That doesn't look like a valid domain." }, { status: 400 });
  }

  try {
    const result = await fetchRobots(target.robotsUrl);
    const payload: FetchRobotsResponse = {
      status: result.status,
      robotsExists: result.robotsExists,
      body: result.body ?? "",
      finalUrl: result.finalUrl ?? target.robotsUrl,
      ...(result.error ? { error: result.error } : {}),
    };
    return NextResponse.json(payload);
  } catch (error) {
    // fetchRobots() is designed not to throw; last-resort guard for a JSON 500.
    console.error("[api/fetch-robots] unexpected error", error);
    return NextResponse.json(
      { error: "Could not fetch robots.txt. Please try again." },
      { status: 500 },
    );
  }
}
