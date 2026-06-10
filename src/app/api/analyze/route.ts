import { NextResponse } from "next/server";
import { analyzeRequestSchema } from "@/schemas";
import { analyze } from "@/features/live-checker";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Thin boundary: validate the request, delegate to the Analyzer, return the report.
 * All logic lives in `analyze()` (live-checker); this handler does no analysis.
 * The Analyzer performs server-side fetches, so it is rate-limited and SSRF-guarded
 * (the guard lives in the fetch boundary, covering this route and /api/fetch-robots).
 */
export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  const limit = rateLimit(`analyze:${clientIp(request)}`);
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

  try {
    const report = await analyze(parsed.data.domain);
    return NextResponse.json(report);
  } catch (error) {
    // analyze() is designed not to throw; this is a last-resort guard so an
    // unexpected failure returns JSON, never an unhandled 500 HTML page.
    console.error("[api/analyze] unexpected error", error);
    return NextResponse.json({ error: "Analysis failed unexpectedly. Please try again." }, { status: 500 });
  }
}
