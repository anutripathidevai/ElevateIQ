/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Don't advertise the framework/version.
  poweredByHeader: false,
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
    ];
  },
};

export default nextConfig;
