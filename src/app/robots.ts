import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/siteUrl";

export const dynamic = "force-static";

/**
 * Everything deployed is public and may be crawled. Drafts are kept out of
 * indexes with a noindex meta tag rather than a Disallow line, because a
 * crawler that may not fetch a page never sees its noindex. Audit documents,
 * screenshots and source files are not part of the deployed output at all.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: siteUrl ? new URL("/sitemap.xml", siteUrl).href : undefined,
  };
}
