import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The PDF library works best loaded directly by Node.js, not bundled.
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;