import type { NextConfig } from 'next';

/**
 * Static export. For GitHub Pages under a sub-path (https://<user>.github.io/forsa/), build with
 * NEXT_PUBLIC_BASE_PATH=/forsa. Default is the site root.
 */
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  transpilePackages: ['@forsa/data', '@forsa/tokens'],
  reactStrictMode: true,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
