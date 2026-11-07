import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Where the browser may load things from. Photos come from R2 via short-lived
// signed URLs; bank logos on the QPay checkout page come from QPay.
const contentSecurityPolicy = [
  "default-src 'self'",
  "img-src 'self' data: blob: https://*.r2.cloudflarestorage.com https://picsum.photos https://fastly.picsum.photos https://*.qpay.mn",
  "connect-src 'self' https://*.r2.cloudflarestorage.com",
  // Next.js needs inline scripts and styles; development also needs eval for fast refresh.
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The selfie picker uses a file input, not the camera API.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : []),
];

const nextConfig: NextConfig = {
  // cacheComponents is off on purpose: every page here reads the auth cookie,
  // and we want role checks to return a real HTTP 403 instead of streaming one.
  experimental: {
    authInterrupts: true, // enables forbidden() / unauthorized()
  },
  poweredByHeader: false,
  images: {
    // Placeholder photography on the homepage.
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
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
