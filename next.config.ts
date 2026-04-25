import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'c.saavncdn.com',
      },
      {
        protocol: 'https',
        hostname: 'static.saavncdn.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Added for YouTube Music thumbnails
      },
      {
        protocol: 'https',
        hostname: 'yt3.googleusercontent.com', // Added for YouTube Music search images
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com', // Added for YouTube video thumbnails
      }
    ],
  },
};

export default nextConfig;
