import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  experimental: {
    allowedDevOrigins: [".ngrok-free.app", "ngrok-free.app"],
  },
};

export default nextConfig;
