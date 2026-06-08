import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Live Checker performs server-side fetches via route handlers,
  // so no client-side rewrites/CORS config is needed here.
  typedRoutes: true,
};

export default nextConfig;
