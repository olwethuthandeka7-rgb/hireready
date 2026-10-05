import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These libraries work best loaded directly by Node.js, not bundled.
  serverExternalPackages: ["@react-pdf/renderer", "mammoth"],
  experimental: {
    serverActions: {
      // Uploaded files are limited to 5MB; this leaves room for the form itself.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;