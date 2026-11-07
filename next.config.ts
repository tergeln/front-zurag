import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents is off on purpose: every page here reads the auth cookie,
  // and we want role checks to return a real HTTP 403 instead of streaming one.
  experimental: {
    authInterrupts: true, // enables forbidden() / unauthorized()
  },
  images: {
    // Placeholder photography until real event photos exist (Phase 4+).
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
