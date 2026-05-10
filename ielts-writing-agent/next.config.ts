import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "sqlite-vec", "pino", "pino-pretty"],
  experimental: {
    // Disable Turbopack for prod build due to native module limitations
  },
};

export default nextConfig;
