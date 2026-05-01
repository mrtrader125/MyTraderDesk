import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  
  typescript: {
    ignoreBuildErrors: false,
  },

  // ⚡ THE FIX: ESLint block merged into the main object
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uvnfftzndnchylavsckn.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'xmievzaposzzjzrtzmdm.supabase.co',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
