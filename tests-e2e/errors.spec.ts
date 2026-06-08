import { expect, test } from "@playwright/test";

// Part 2 — Error-state hardening (no external network is hit: invalid input is
// rejected by the shared schema before any fetch).
test("analyzer shows a friendly error for an invalid domain", async ({ page }) => {
  await page.goto("/analyze");
  await page.getByLabel("Domain to analyze").fill("not a domain");
  await page.getByRole("button", { name: /Fetch & Analyze/ }).click();

  await expect(page.getByText(/valid domain/i)).toBeVisible();
});

test("fetch-from-URL rejects an invalid domain with a recovery path", async ({ page }) => {
  await page.goto("/validate");
  await page.getByRole("tab", { name: "Fetch from URL" }).click();
  await page.getByLabel("Website domain").fill("nope");
  await page.getByRole("button", { name: "Fetch robots.txt" }).click();

  await expect(page.getByText(/valid domain/i)).toBeVisible();
  // The paste workflow is still available as a recovery path.
  await expect(page.getByRole("tab", { name: "Paste" })).toBeVisible();
});

test("validator tolerates an empty document without crashing", async ({ page }) => {
  await page.goto("/validate");
  await page.getByLabel("robots.txt").fill("");
  await expect(page.getByText("Health score", { exact: true })).toBeVisible();
});
