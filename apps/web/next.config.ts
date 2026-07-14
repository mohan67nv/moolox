import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@moolox/types',
    '@moolox/auth',
    '@moolox/db',
    '@moolox/workspace',
    '@moolox/project',
    '@moolox/ast-core',
    '@moolox/tokens',
    '@moolox/canvas',
    '@moolox/ai',
    '@moolox/deploy',
    '@moolox/git',
    '@moolox/billing',
    '@moolox/analytics',
    '@moolox/components',
    '@moolox/marketplace',
    '@moolox/enterprise',
    '@moolox/plugins',
    '@moolox/sdk',
  ],
};

export default nextConfig;
