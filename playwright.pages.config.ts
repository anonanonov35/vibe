import { defineConfig } from "@playwright/test";
import { readFileSync } from "node:fs";

const { basePath } = JSON.parse(readFileSync("out/.pages-preview.json", "utf8"));
export default defineConfig({
  testDir: "./tests/pages",
  workers: 1,
  use: { baseURL: `http://localhost:4173${basePath}/`, channel: "chrome", headless: true, screenshot: "only-on-failure" },
  webServer: { command: "node scripts/preview-pages.mjs", url: `http://localhost:4173${basePath}/`, reuseExistingServer: false },
});
