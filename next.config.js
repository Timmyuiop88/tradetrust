/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Updated to use the correct key name
    serverExternalPackages: ['@prisma/client', '@auth/prisma-adapter'],
  },
  webpack: (config) => {
    // Fix for handlebars warnings
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Add output option for better Vercel compatibility
  output: 'standalone',
}

module.exports = nextConfig;