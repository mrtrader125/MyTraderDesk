import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This tells Next.js to bundle its own server, bypassing Netlify's trace bug
  output: "standalone",
  
  typescript: {
    // This keeps our strict-mode bypass active
    ignoreBuildErrors: true,
  },
  
  // 🚨 NEW: Allow Next.js to optimize images from Supabase
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;
