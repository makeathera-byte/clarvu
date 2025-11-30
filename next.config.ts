import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Logging configuration
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  
  // Performance optimizations
  experimental: {
    // Enable React compiler optimizations
    optimizePackageImports: ['lucide-react', 'recharts', '@radix-ui/react-accordion', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
  
  // Compression
  compress: true,
  
  // Power by header
  poweredByHeader: false,
  
  // React strict mode
  reactStrictMode: true,
  
  // Output configuration for Vercel
  output: 'standalone',
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
