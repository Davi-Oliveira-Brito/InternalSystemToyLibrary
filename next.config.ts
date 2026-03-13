import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Unsplash
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Supabase Storage (futuro)
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      // Qualquer HTTPS genérico (URLs externas no campo image dos jogos)
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;