import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: {},
  webpack: (config) => {
    // Handle pdfjs-dist worker
    config.resolve.alias = {
      ...config.resolve.alias,
      "pdfjs-dist/build/pdf.worker.entry": "pdfjs-dist/build/pdf.worker.mjs",
    };
    return config;
  },
};

export default nextConfig;
