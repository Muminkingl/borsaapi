import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/register',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/login',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
