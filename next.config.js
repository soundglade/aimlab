/** @type {import('next').NextConfig} */
const nextConfig = {
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
