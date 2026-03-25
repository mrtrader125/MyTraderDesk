/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uvnfftzndnchylavsckn.supabase.co',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
