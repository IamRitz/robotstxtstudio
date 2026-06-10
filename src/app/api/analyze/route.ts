import { NextResponse } from "next/server";
import { analyzeRequestSchema } from "@/schemas";
import { analyze } from "@/features/live-checker";

/**
 * Thin boundary: validate the request, delegate to the Analyzer, return the report.
 * All logic lives in `analyze()` (live-checker); this handler does no analysis.
 */
export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
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
