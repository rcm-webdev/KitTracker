import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Read all test env vars from server/.env.test so the test server is fully
// isolated — nothing leaks in from the developer's real server/.env.
const testEnv = dotenv.parse(
  fs.readFileSync(path.resolve(__dirname, "../server/.env.test"))
);

export default defineConfig({
  globalSetup: "./global-setup",
  globalTeardown: "./global-teardown",
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    // Regular user auth setup
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    // Admin user auth setup
    {
      name: "admin-setup",
      testMatch: /admin\.setup\.ts/,
    },
    // Main test project — depends on both setups
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup", "admin-setup"],
    },
  ],
  webServer: [
    {
      // Start a fresh server using only .env.test vars — never touches server/.env.
      // If port 3001 is in use, stop your dev server before running tests.
      command: "npm run dev --workspace=server",
      cwd: "../",
      url: "http://localhost:3001/api/health",
      reuseExistingServer: false,
      env: testEnv,
    },
    {
      command: "npm run dev --workspace=client",
      cwd: "../",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
