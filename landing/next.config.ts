import type { NextConfig } from "next";

const config: NextConfig = {
  agentRules: false,
  output: "export",
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  images: { unoptimized: true, formats: ["image/webp"], deviceSizes: [320, 390, 640, 768, 960, 1280, 1600] },
};

export default config;
