import { expect, test } from "@playwright/test";

// Journey 3 — AI Manager.
test("block GPTBot and see the policy + impact update", async ({ page }) => {
  await page.goto("/ai-crawlers");

  // Before: GPTBot is not in the generated baseline.
  await expect(page.getByText("Generated robots.txt")).toBeVisible();

  // Untouched groups start collapsed (17E) — expand to reach individual rows.
  await page.getByRole("button", { name: "Expand all" }).click();

  // Block GPTBot via its toggle.
  const toggle = page.getByRole("switch", { name: "Allow GPTBot" });
  await expect(toggle).toBeVisible();
  await toggle.click();

  // Impact updates: GPTBot now appears in the generated robots.txt block.
  await expect(page.getByText("User-agent: GPTBot")).toBeVisible();
  await expect(page.getByText("Disallow: /").first()).toBeVisible();
});

// Phase 17E — group-level bulk actions: decide a whole category in one click.
test("category header bulk actions: Block all / Reset without touching rows", async ({ page }) => {
  await page.goto("/ai-crawlers");

  // One click blocks every AI-training crawler (group auto-expands to show it).
  const aiTraining = page.locator("details").filter({ hasText: /AI training crawlers/i });
  await aiTraining.getByRole("button", { name: "Block all" }).click();
  await expect(page.getByText("User-agent: GPTBot")).toBeVisible();
  await expect(page.getByText("User-agent: CCBot")).toBeVisible();
  await expect(page.getByRole("switch", { name: "Allow GPTBot" })).not.toBeChecked();

  // One click resets the category back to inherit — the blocks disappear.
  await aiTraining.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByText("User-agent: GPTBot")).toBeHidden();
  await expect(page.getByRole("switch", { name: "Allow GPTBot" })).toBeChecked();
});
