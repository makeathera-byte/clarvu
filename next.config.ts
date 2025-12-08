import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Fix Vercel deployment: Externalize Supabase packages to avoid file tracing issues
  serverExternalPackages: ['@supabase/ssr', '@supabase/supabase-js'],

  // Set the root for file tracing to avoid middleware.js.nft.json issues
  outputFileTracingRoot: undefined,

  // Exclude Supabase packages from file tracing to avoid middleware.nft.json issues on Vercel
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@supabase/ssr/**',
      'node_modules/@supabase/supabase-js/**',
    ],
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Optimize production builds
  compress: true,

  // PWA support with service worker
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
  },
};

export default nextConfig;
