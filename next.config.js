/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Mirror the single server-side flag to the client so one boolean
    // (DEACTIVATE_WEBSITE) drives both server and UI behaviour.
    NEXT_PUBLIC_DEACTIVATE_WEBSITE: process.env.DEACTIVATE_WEBSITE,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ["**/node_modules", "**/.git", "**/public/**"],
      };
    }
    return config;
  },
  async redirects() {
    return [
      {
        source: "/reader",
        destination: "/instant",
        permanent: true,
      },
      {
        source: "/composer",
        destination: "/studio",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
