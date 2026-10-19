import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

/** Our own robots.txt — an exemplary file for a robots.txt tool. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dev", "/api/"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    // No `Host:` — it's a retired Yandex-only directive that Google ignores.
  };
}
