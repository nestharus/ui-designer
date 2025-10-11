import type { NextConfig } from 'next';
import { resolve } from 'node:path';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Typed routes for compile-time route checking
  typedRoutes: true,

  // Set the workspace root to silence Next.js warning about multiple lockfiles
  outputFileTracingRoot: resolve(__dirname, '../../'),

  // Transpile workspace packages
  transpilePackages: ['@ui-designer/shared-types'],

  // Disable ESLint during builds (we run it separately)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript errors during builds (we run type-check separately)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
