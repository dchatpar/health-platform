/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias['@health/shared'] = path.resolve(__dirname, 'packages/shared');
    config.resolve.alias['@shared'] = path.resolve(__dirname, 'packages/shared');
    return config;
  },
};

module.exports = nextConfig;
