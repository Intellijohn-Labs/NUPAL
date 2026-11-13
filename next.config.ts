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
  // The About page is now "Our Story" (team direction, Nov 2026). Old links keep working.
  async redirects() {
    return [{ source: "/about-us", destination: "/our-story", permanent: true }];
  },
  experimental: {
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
