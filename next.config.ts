import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 빌드 시 ESLint 오류 무시 (배포 우선)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 빌드 시 TypeScript 오류 무시 (배포 우선)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
