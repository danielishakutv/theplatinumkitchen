import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a self-contained server bundle in .next/standalone that the
  // production Dockerfile copies into a slim runtime image (no node_modules
  // install at runtime).
  output: "standalone",
  images: {
    // Disable the server-side image optimizer so /_next/image isn't relied on.
    // With Cloudflare in front caching aggressively and our Docker image
    // skipping sharp's postinstall, the optimizer endpoint was 404'ing.
    // Revisit if/when we move to Cloudinary or wire sharp explicitly.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "date-fns"],
  },
};

export default nextConfig;
