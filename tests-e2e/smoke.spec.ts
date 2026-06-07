import { expect, test } from "@playwright/test";

test("dashboard renders and lists all modules", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "Robots.txt Studio" })).toBeVisible();

  const modules = page.getByRole("region", { name: "Modules" }).getByRole("article");
  await expect(modules).toHaveCount(6);
});
