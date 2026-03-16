import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This tells Next.js to bundle its own server, bypassing Netlify's trace bug
  output: "standalone",
  
  typescript: {
    // This keeps our strict-mode bypass active
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
