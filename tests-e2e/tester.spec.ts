import { expect, test } from "@playwright/test";

// Journey 5 — URL Tester.
test("test a URL and view the verdict, matched rule, and trace", async ({ page }) => {
  await page.goto("/url-tester");

  // Default: GPTBot vs /admin/login against a file that blocks GPTBot → BLOCKED.
  await expect(page.getByText(/is blocked from \/admin\/login/)).toBeVisible();
  await expect(page.getByText("Matched rule")).toBeVisible();
  await expect(page.getByText("Rule trace")).toBeVisible();
  await expect(page.getByText("1. Match user-agent")).toBeVisible();
  await expect(page.getByText("4. Decision")).toBeVisible();
});
