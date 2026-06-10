import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "robots.txt templates — copy-paste files by site type";

export default function Image() {
  return ogImage(
    "robots.txt Templates",
    "Copy-paste robots.txt files for blogs, WordPress, e-commerce, SaaS, docs, and blocking AI.",
    "Free templates",
  );
}
