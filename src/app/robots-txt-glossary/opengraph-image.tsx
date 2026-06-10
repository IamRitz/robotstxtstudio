import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "robots.txt glossary — every directive and term explained";

export default function Image() {
  return ogImage(
    "robots.txt Glossary",
    "Plain-English definitions for every robots.txt directive, matching rule, and crawler term.",
    "Reference",
  );
}
