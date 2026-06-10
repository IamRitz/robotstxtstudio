import { expect, test } from "@playwright/test";

// Journey 2 — Generator.
test("generate a robots.txt with validation and explanation", async ({ page }) => {
  await page.goto("/generate");

  await expect(page.getByText("Live preview")).toBeVisible();
  // Output generated (default blog preset).
  await expect(page.getByText("User-agent: GPTBot")).toBeVisible();
  // Validation preview.
  await expect(page.getByText(/health \d+\/100/i)).toBeVisible();
  // Explanation preview.
  await expect(page.getByText("What this file does")).toBeVisible();
  await expect(page.getByRole("button", { name: "Download", exact: true })).toBeVisible();

  // Switching preset updates the output.
  await page.getByRole("button", { name: "E-commerce" }).click();
  await expect(page.getByText("/checkout/").first()).toBeVisible();
});
