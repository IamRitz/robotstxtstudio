import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { PROFILE_IDS, profileCrawler } from "@/config/crawler-directory";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Crawler reference — Robots.txt Studio";

export function generateStaticParams() {
  return PROFILE_IDS.map((id) => ({ id }));
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const crawler = profileCrawler(id);
  return ogImage(
    `${crawler?.name ?? "Crawler"} in robots.txt`,
    `What it does, whether it honors robots.txt, and how to allow or block it.`,
    crawler ? crawler.owner : "Reference",
  );
}
