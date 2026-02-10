import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:5173",
    headless: true,
  },
  webServer: {
    command: "npx vite --host 0.0.0.0 --port 5173",
    port: 5173,
    reuseExistingServer: true,
    timeout: 10000,
  },
});
