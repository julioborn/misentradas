import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1MB, too small for phone photos uploaded as event/logo images.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
