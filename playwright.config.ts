import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests-e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  // Uses the system Chrome by default (no browser download). Override with
  // PLAYWRIGHT_CHANNEL="" to use a Playwright-managed Chromium in CI.
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome",
      },
    },
  ],
  // Run e2e against a production build (fast, no per-route dev compilation).
  // Locally reuses an existing build via `pnpm start`; CI builds first.
  webServer: {
    command: process.env.CI
      ? "node_modules/.bin/next build && node_modules/.bin/next start"
      : "node_modules/.bin/next start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
