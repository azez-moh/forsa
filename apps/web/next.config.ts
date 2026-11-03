import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  transpilePackages: ['@forsa/data', '@forsa/tokens'],
  reactStrictMode: true,
};

export default nextConfig;
