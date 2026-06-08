import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Live Checker performs server-side fetches via route handlers,
  // so no client-side rewrites/CORS config is needed here.
  //
  // typedRoutes is re-enabled in Phase 10B once all feature routes exist; during
  // 10A the nav links target routes that aren't created yet.
  typedRoutes: false,
};

export default nextConfig;
