/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't advertise the framework/version.
  poweredByHeader: false,
  // The Application Insights SDK uses dynamic requires and native-ish deps that
  // must not be bundled by the Next.js server compiler — keep it external so it
  // loads at runtime only when configured (see services/ai/telemetry.ts).
  experimental: {
    serverComponentsExternalPackages: ["applicationinsights"],
  },
  // Lint is run separately via `npm run lint`; don't fail production builds on style.
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Graph Algorithms moved under the DSA learning hub.
      {
        source: "/practice/graph-algorithms",
        destination: "/learning/dsa/graph-algorithms",
        permanent: true,
      },
      {
        source: "/practice/graph-algorithms/:slug",
        destination: "/learning/dsa/graph-algorithms/:slug",
        permanent: true,
      },
      // AI System Design consolidated into the Generative AI hub.
      {
        source: "/learning/ai-system-design",
        destination: "/learning/generative-ai",
        permanent: true,
      },
      {
        source: "/learning/ai-system-design/:lesson",
        destination: "/learning/generative-ai/:lesson",
        permanent: true,
      },
      {
        source: "/ai-system-design",
        destination: "/learning/generative-ai",
        permanent: true,
      },
      {
        source: "/ai-system-design/:lesson",
        destination: "/learning/generative-ai/:lesson",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
