import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // <-- Adds static export for Capacitor
  images: {
    unoptimized: true, // <-- Required for static export with external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'c.saavncdn.com',
      },
      {
        protocol: 'https',
        hostname: 'static.saavncdn.com',
      }
    ],
  },
};

export default nextConfig;