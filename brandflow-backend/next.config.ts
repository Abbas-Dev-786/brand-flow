import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep connections alive for long-running API routes (KB indexing can take ~10min)
  httpAgentOptions: {
    keepAlive: true,
  },
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;

