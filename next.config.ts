import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Uploaded images come from Supabase Storage, Vercel Blob, or /uploads on the same server.
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
