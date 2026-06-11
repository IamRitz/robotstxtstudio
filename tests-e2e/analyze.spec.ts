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

  // Report renders, recomputed live from the fetched file (Phase 17A workspace).
  await expect(page.getByTestId("score-current")).toBeVisible(); // verdict band (visibility NOW → POTENTIAL)
  await expect(page.getByText("Crawler visibility — by crawler")).toBeVisible(); // per-crawler breakdown
  const queue = page.getByTestId("issue-list"); // the single ranked Action Queue
  await expect(queue.getByText("No sitemap declared")).toBeVisible(); // finding
  await expect(queue.getByText("ClaudeBot inherits the default rules")).toBeVisible(); // advisory (deep-link row)
  await expect(queue.getByRole("link", { name: /Open AI Manager/ }).first()).toBeVisible();
  // Analyzer can produce a corrected file (the "finish here" workflow).
  await expect(
    page.getByRole("button", { name: "Download robots.txt", exact: true }),
  ).toBeVisible();
});

test("analyze shows a loading state while fetching", async ({ page }) => {
  await page.route("**/api/analyze", async (route) => {
    await new Promise((r) => setTimeout(r, 600));
    await route.fulfill({ json: ANALYSIS_REPORT });
  });
  await page.goto("/analyze?domain=example.com");
  await expect(page.getByRole("button", { name: /Analyzing/ })).toBeVisible();
});
