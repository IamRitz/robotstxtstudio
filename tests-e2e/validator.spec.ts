import { expect, test } from "@playwright/test";

// Journey 4 — Validator.
test("validate robots.txt and filter issues by severity", async ({ page }) => {
  await page.goto("/validate");

  // Health score + issues from the default sample.
  await expect(page.getByText("Health score", { exact: true })).toBeVisible();
  await expect(page.getByText("Crawl-delay of 0")).toBeVisible(); // a warning
  await expect(page.getByText("Sitemap uses HTTP")).toBeVisible(); // an info

  // Severity counts + filtering.
  const warningsTab = page.getByRole("tab", { name: /Warnings/ });
  await expect(warningsTab).toBeVisible();
  await warningsTab.click();
  await expect(page.getByText("Crawl-delay of 0")).toBeVisible();
  await expect(page.getByText("Sitemap uses HTTP")).toBeHidden();
});
