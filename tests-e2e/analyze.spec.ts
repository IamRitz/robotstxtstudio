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

  // Report renders, recomputed live from the fetched file.
  await expect(page.getByText("robots.txt fetched successfully")).toBeVisible();
  await expect(page.getByText("Crawler Visibility Score")).toBeVisible(); // analyzer-unique
  await expect(page.getByText("Overall health", { exact: true })).toBeVisible(); // audit dashboard
  await expect(page.getByText("Crawler visibility — by crawler")).toBeVisible(); // per-crawler breakdown
  await expect(page.getByTestId("issue-list").getByText("No sitemap declared")).toBeVisible(); // finding
  await expect(page.getByText("ClaudeBot inherits the default rules").first()).toBeVisible(); // recommendation/priority
  // Analyzer can produce a corrected file (the "finish here" workflow).
  await expect(page.getByText("Fix & export")).toBeVisible();
  await expect(page.getByRole("button", { name: "Download robots.txt", exact: true })).toBeVisible();
});

test("analyze shows a loading state while fetching", async ({ page }) => {
  await page.route("**/api/analyze", async (route) => {
    await new Promise((r) => setTimeout(r, 600));
    await route.fulfill({ json: ANALYSIS_REPORT });
  });
  await page.goto("/analyze?domain=example.com");
  await expect(page.getByRole("button", { name: /Analyzing/ })).toBeVisible();
});
