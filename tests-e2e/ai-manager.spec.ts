import { expect, test } from "@playwright/test";

// Journey 3 — AI Manager.
test("block GPTBot and see the policy + impact update", async ({ page }) => {
  await page.goto("/ai-crawlers");

  // Before: GPTBot is not in the generated baseline.
  await expect(page.getByText("Generated robots.txt")).toBeVisible();

  // Block GPTBot via its toggle.
  const toggle = page.getByRole("switch", { name: "Allow GPTBot" });
  await expect(toggle).toBeVisible();
  await toggle.click();

  // Impact updates: GPTBot now appears in the generated robots.txt block.
  await expect(page.getByText("User-agent: GPTBot")).toBeVisible();
  await expect(page.getByText("Disallow: /").first()).toBeVisible();
});
