import type { MetadataRoute } from "next";
import { notes } from "@/content/notes";
import { pages } from "@/content/pages";
import { siteUrl } from "@/lib/siteUrl";

export const dynamic = "force-static";

/**
 * Every indexable route, from the page registry, plus published Lab Notes.
 * Drafts and the 404 page are left out. A sitemap needs absolute URLs, so it
 * stays empty until SITE_URL is set (see docs/DEPLOYMENT.md). No dates are
 * listed: the site has no reliable per-page modification time to report.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteUrl;
  if (!origin) return [];
  const paths = [
    ...Object.entries(pages)
      .filter(([, p]) => p.index)
      .map(([path]) => path),
    ...notes.filter((n) => n.status !== "Draft").map((n) => `/notes/${n.slug}/`),
  ];
  return paths.map((path) => ({ url: new URL(path, origin).href }));
}
