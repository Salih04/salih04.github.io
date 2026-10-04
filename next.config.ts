import type { NextConfig } from "next";

// Static export: every route (including /notes/[slug]) is prerendered to
// HTML so deep links work on any static host without a server.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
};

export default nextConfig;
