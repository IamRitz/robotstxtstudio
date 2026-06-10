import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Robots.txt Studio — crawler visibility & permissions platform";

export default function Image() {
  return ogImage(
    "Who Can See Your Website?",
    "Analyze, control, and verify which search engines and AI crawlers can access your site.",
  );
}
