import type { NextConfig } from "next";

const config: NextConfig = {
  agentRules: false,
  images: { formats: ["image/webp"], deviceSizes: [320, 390, 640, 768, 960, 1280, 1600] },
};

export default config;
