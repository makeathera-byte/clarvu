import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Exclude Supabase packages from file tracing to avoid middleware.nft.json issues on Vercel
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@supabase/ssr/**',
      'node_modules/@supabase/supabase-js/**',
    ],
  },
};

export default nextConfig;
