import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: { baseURL: "http://localhost:3100", channel: "chrome", headless: true, screenshot: "only-on-failure", trace: "retain-on-failure" },
  webServer: {
    command: "node node_modules/next/dist/bin/next start --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 60000,
    env: { SITE_URL: "http://localhost:3100", NEXT_PUBLIC_SITE_URL: "http://localhost:3100", ADMIN_PASSWORD: "e2e-password-not-for-production-123", DATA_DIR: "./test-results/gallery-data", TELEGRAM_BOT_TOKEN: "", TELEGRAM_CHAT_ID: "" },
  },
});
