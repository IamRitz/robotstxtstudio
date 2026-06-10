import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Crawler Directory — every web crawler and how to control it";

export default function Image() {
  return ogImage(
    "Crawler Directory",
    "Every web crawler — search, AI, SEO, social — and the exact rules to allow or block it.",
    "Reference",
  );
}
