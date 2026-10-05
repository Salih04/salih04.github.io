import type { Metadata } from "next";
import { pages, type PageInfo, type PagePath } from "@/content/pages";
import { site } from "@/content/site";
import { siteUrl } from "./siteUrl";

/** The default social preview, a static 1200×630 image in public/. */
export const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: "S//LAB — Salih, Software Engineer. Two instrument traces on one time axis, on a dark graphite panel.",
};

export const fullTitle = (p: PageInfo) => (p.absolute ? p.title : `${p.title} — ${site.mark}`);

/**
 * Metadata for one route. Next.js replaces nested objects such as
 * `openGraph` rather than merging them, so every page gets the complete set.
 * Absolute URLs (canonical, og:url, images) appear only when SITE_URL is set.
 */
export function routeMetadata(path: string, page: PageInfo): Metadata {
  const title = fullTitle(page);
  const images = siteUrl ? [OG_IMAGE] : undefined;
  return {
    title: page.absolute ? { absolute: page.title } : page.title,
    description: page.description,
    alternates: siteUrl ? { canonical: path } : undefined,
    robots: page.index ? undefined : { index: false, follow: true },
    openGraph: {
      type: "website",
      siteName: site.mark,
      locale: "en",
      title,
      description: page.description,
      url: siteUrl ? path : undefined,
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description: page.description,
      images,
    },
  };
}

export const pageMetadata = (path: PagePath): Metadata => routeMetadata(path, pages[path]);
