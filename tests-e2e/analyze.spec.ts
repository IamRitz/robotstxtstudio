import { expect, test } from "@playwright/test";
import { ANALYSIS_REPORT } from "./fixtures";

// Journey 1 — Analyze Website (network mocked at the API boundary).
test("analyze a website and view the report", async ({ page }) => {
  await page.route("**/api/analyze", async (route) => {
    await new Promise((r) => setTimeout(r, 300)); // observable loading state
    await route.fulfill({ json: ANALYSIS_REPORT });
  });

  // Start from Home → enter domain → Analyze.
  await page.goto("/");
  await page.getByLabel("Your website domain").fill("example.com");
  await page.getByRole("button", { name: "Analyze My Site" }).click();

  await expect(page).toHaveURL(/\/analyze\?domain=example\.com/);

  // Report renders from the mocked payload.
  await expect(page.getByText("Crawler Visibility Score")).toBeVisible();
  await expect(page.getByText("Robots.txt Health")).toBeVisible();
  await expect(page.getByText("71")).toBeVisible(); // visibility value
  await expect(page.getByText("78")).toBeVisible(); // health value
  await expect(page.getByText("No sitemap declared")).toBeVisible(); // finding
  await expect(page.getByText("ClaudeBot inherits the default rules")).toBeVisible(); // recommendation
  await expect(page.getByText("Crawler breakdown")).toBeVisible();
});

test("analyze shows a loading state while fetching", async ({ page }) => {
  await page.route("**/api/analyze", async (route) => {
    await new Promise((r) => setTimeout(r, 600));
    await route.fulfill({ json: ANALYSIS_REPORT });
  });
  await page.goto("/analyze?domain=example.com");
  await expect(page.getByRole("button", { name: /Analyzing/ })).toBeVisible();
});
