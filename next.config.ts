import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  
  typescript: {
    ignoreBuildErrors: false,
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uvnfftzndnchylavsckn.supabase.co',
        pathname: '/**',
      },
      {
        // 🚨 ADDED: Your secondary Supabase URL to ensure all legacy and new images load
        protocol: 'https',
        hostname: 'xmievzaposzzjzrtzmdm.supabase.co',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
