import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Enable React strict mode for better error detection
  reactStrictMode: true,

  // Output configuration for Vercel
  output: 'standalone',

  // Note: Removed serverExternalPackages for @supabase/ssr to ensure it's bundled
  // Vercel needs these packages to be bundled, not externalized

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xrdxkgyynnzkbxtxoycl.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/logo/**',
      },
    ],
  },

  // Optimize production builds
  compress: true,

  // Enable component caching for better performance
  cacheComponents: true,

  // PWA support with service worker
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
  },

  // Suppress deprecation warnings from transitive dependencies
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Turbopack configuration (Next.js 16+ uses Turbopack by default)
  turbopack: {
    // Suppress warnings from transitive dependencies
    resolveAlias: {},
  },

  // Generate static params for better performance
  generateBuildId: async () => {
    // Use git commit hash or timestamp
    return `build-${Date.now()}`;
  },
};

export default nextConfig;
