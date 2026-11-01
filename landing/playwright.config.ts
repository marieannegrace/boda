import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  workers: 2,
  timeout: 20000,
  reporter: "list",
  use: {
    baseURL: process.env.BETA_URL ?? "http://127.0.0.1:3001",
    channel: "msedge",
    headless: true,
    trace: "retain-on-failure",
  },
});
