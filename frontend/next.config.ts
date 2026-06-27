import type { NextConfig } from "next";

const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data: https:",
              "connect-src 'self' https://webchat-api-v1.duckdns.org wss://webchat-api-v1.duckdns.org",
              "font-src 'self'",
              "frame-src 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

export default nextConfig;
