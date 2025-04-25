/** @type {import('next').NextConfig} */
const nextConfig = {
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
