/**
 * Shared Open Graph image renderer (Phase 12D).
 *
 * Produces a consistent branded 1200×630 social card for the growth-asset routes.
 * Used by each segment's `opengraph-image.tsx`. Satori (next/og) supports a flexbox
 * subset only — every element with multiple children sets `display: flex`.
 */
import { ImageResponse } from "next/og";
import { SITE } from "@/lib/seo";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

const BRAND = "#2563eb"; // blue-600
const BG = "#0a0a0a"; // neutral-950
const MUTED = "#a3a3a3"; // neutral-400

/** Render the branded OG card with a title + supporting line. */
export function ogImage(title: string, subtitle: string, eyebrow = "Crawler visibility & permissions") {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: BG,
          color: "#ffffff",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              backgroundColor: BRAND,
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
            }}
          >
            🤖
          </div>
          <div style={{ display: "flex", fontSize: "30px", fontWeight: 700 }}>{SITE.name}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", fontSize: "26px", color: BRAND, fontWeight: 600, textTransform: "uppercase", letterSpacing: "2px" }}>
            {eyebrow}
          </div>
          <div style={{ display: "flex", fontSize: "68px", fontWeight: 800, lineHeight: 1.1, maxWidth: "1000px" }}>
            {title}
          </div>
          <div style={{ display: "flex", fontSize: "32px", color: MUTED, maxWidth: "960px", lineHeight: 1.3 }}>
            {subtitle}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", height: "6px", width: "120px", borderRadius: "3px", backgroundColor: BRAND }} />
          <div style={{ display: "flex", fontSize: "24px", color: MUTED }}>
            {SITE.url.replace("https://", "")}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
