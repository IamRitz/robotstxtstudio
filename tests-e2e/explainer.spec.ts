import { expect, test } from "@playwright/test";

// Journey 6 — Explainer.
test("explain a robots.txt with AI crawler explanations", async ({ page }) => {
  await page.goto("/explain");

  // Human-readable summary + group explanation from the default sample.
  await expect(page.getByText("Summary")).toBeVisible();
  await expect(page.getByText(/blocked from your entire site/).first()).toBeVisible();

  // AI crawler explanations (purpose text is unique to the AI card).
  await expect(page.getByText(/trains OpenAI's models/)).toBeVisible();
});
