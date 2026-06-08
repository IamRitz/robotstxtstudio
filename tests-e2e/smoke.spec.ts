import { expect, test } from "@playwright/test";

test("home renders the hero and tool grid", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Who Can See Your Website?" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Analyze My Site" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "AI Crawler Manager" })).toBeVisible();
});

test("home navigation reaches each tool", async ({ page }) => {
  for (const path of ["/analyze", "/generate", "/validate", "/url-tester", "/ai-crawlers", "/explain"]) {
    const res = await page.goto(path);
    expect(res?.status()).toBeLessThan(400);
  }
});
