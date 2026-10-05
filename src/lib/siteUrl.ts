/**
 * The production origin of the site, from the SITE_URL environment variable
 * at build time (see docs/DEPLOYMENT.md). It is the only place the domain is
 * configured: canonical links, Open Graph URLs and images, the sitemap and
 * the sitemap line in robots.txt are emitted only when it is set, so a build
 * without it never publishes a guessed or local address.
 */
export function parseSiteUrl(raw: string | undefined): URL | null {
  const value = raw?.trim();
  if (!value) return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`SITE_URL is not a valid URL: "${value}". Expected an origin such as https://<your-domain>.`);
  }
  if (url.protocol !== "https:") throw new Error(`SITE_URL must use https: "${value}".`);
  if (url.pathname !== "/" || url.search || url.hash || url.username || url.password) {
    throw new Error(`SITE_URL must be an origin only, with no path, query or credentials: "${value}".`);
  }
  return new URL(url.origin);
}

export const siteUrl = parseSiteUrl(process.env.SITE_URL);

// A production deployment without a canonical origin would ship without
// canonical links, a sitemap or a social preview image. Fail the build instead.
if (!siteUrl && process.env.VERCEL_ENV === "production") {
  throw new Error("SITE_URL must be set for a production deployment. See docs/DEPLOYMENT.md.");
}
