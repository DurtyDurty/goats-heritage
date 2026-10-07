/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "**.fbcdn.net",
      },
    ],
  },
  // Memberships are switched off for now: the pages still exist but are unreachable.
  // Delete these redirects (and MEMBERSHIPS_ENABLED in src/lib/purchases.ts) to bring them back.
  async redirects() {
    return [
      { source: "/membership", destination: "/", permanent: false },
      { source: "/membership/:path*", destination: "/", permanent: false },
      { source: "/account/membership", destination: "/account", permanent: false },
      { source: "/account/subscription", destination: "/account", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
