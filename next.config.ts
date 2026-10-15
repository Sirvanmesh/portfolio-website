import type { NextConfig } from "next";

// Static export: `npm run build` writes plain HTML/CSS/JS to ./out,
// which is uploaded to S3 and served by CloudFront. No server needed.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
