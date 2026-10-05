import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "srlbrzvdhxigwytveqdh.supabase.co",
      },
    ],
  },
};

export default nextConfig;
