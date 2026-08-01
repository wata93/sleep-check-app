import withPWAInit, { runtimeCaching as defaultCache } from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      // API・管理画面のデータは常に最新を取得する（診断結果・集計が古いまま表示されるのを防ぐ）
      {
        urlPattern: /^\/api\/.*/i,
        handler: "NetworkOnly",
      },
      {
        urlPattern: /^\/admin(\/.*)?$/i,
        handler: "NetworkOnly",
      },
      ...defaultCache,
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
