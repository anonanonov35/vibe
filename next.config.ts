import type { NextConfig } from "next";
import path from "node:path";

const demo = process.env.PAGES_BUILD === "true";
const basePath = demo ? process.env.NEXT_PUBLIC_BASE_PATH || "" : "";

const nextConfig: NextConfig = {
  output: demo ? "export" : "standalone",
  basePath,
  trailingSlash: demo,
  env: { NEXT_PUBLIC_DEMO_MODE: demo ? "true" : "false", NEXT_PUBLIC_BASE_PATH: basePath },
  ...(demo ? { turbopack: { root: path.resolve(process.cwd(), "..") } } : {}),
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"], unoptimized: demo },
  ...(!demo ? { async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ] }];
  } } : {}),
};
export default nextConfig;
