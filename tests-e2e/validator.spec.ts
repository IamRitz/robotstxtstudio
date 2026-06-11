import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

// Journey 4 — Validator.
test("validate robots.txt and filter issues by severity", async ({ page }) => {
  await page.goto("/validate");

  // Workspace command bar (score) + issues from the default sample.
  await expect(page.getByTestId("score-current")).toBeVisible();
  const issues = page.getByTestId("issue-list");
  await expect(issues.getByText("Crawl-delay of 0")).toBeVisible(); // a warning
  await expect(issues.getByText("Sitemap uses HTTP")).toBeVisible(); // an info

  // Severity counts + filtering (scoped to the issue list, not the summary).
  const warningsTab = page.getByRole("tab", { name: /Warnings/ });
  await expect(warningsTab).toBeVisible();
  await warningsTab.click();
  await expect(issues.getByText("Crawl-delay of 0")).toBeVisible();
  await expect(issues.getByText("Sitemap uses HTTP")).toBeHidden();
});

// Phase 15A — Smart Fix engine edge cases.
test("Fix All Safe applies fixes, shows a diff, and Undo restores the exact prior text", async ({
  page,
}) => {
  await page.goto("/validate");
  const editor = page.getByRole("textbox", { name: "robots.txt" });

  const before = await editor.inputValue();
  await page.getByRole("button", { name: /Fix \d+ safe/ }).click();

  // Content changed and a Before/After diff appeared.
  const afterFix = await editor.inputValue();
  expect(afterFix).not.toBe(before);
  expect(afterFix).not.toContain("Crawl-delay: 0");
  expect(afterFix).toContain("https://example.com/sitemap.xml");
  await expect(page.getByText("Before / After")).toBeVisible();

  // Undo restores the EXACT previous state (one-click restore).
  await page.getByRole("button", { name: "Undo" }).click();
  expect(await editor.inputValue()).toBe(before);
  await expect(page.getByText("Before / After")).toBeHidden();
});

test("downloaded file equals the editor content exactly (after a fix)", async ({ page }) => {
  await page.goto("/validate");
  await page.getByRole("button", { name: /Fix \d+ safe/ }).click();

  const content = await page.getByRole("textbox", { name: "robots.txt" }).inputValue();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download robots.txt", exact: true }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("robots.txt");
  const path = await download.path();
  const downloaded = await readFile(path, "utf8");
  expect(downloaded).toBe(content);
});

test("a manual edit resets the fix session without losing the typed content", async ({ page }) => {
  await page.goto("/validate");
  await page.getByRole("button", { name: /Fix \d+ safe/ }).click();
  await expect(page.getByText("Before / After")).toBeVisible();
  await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();

  // Manual edit: the diff + Undo clear (so a later Undo can't clobber typed work),
  // and the typed content is preserved exactly.
  const editor = page.getByRole("textbox", { name: "robots.txt" });
  await editor.fill("User-agent: *\nDisallow: /private/");
  await expect(page.getByText("Before / After")).toBeHidden();
  await expect(page.getByRole("button", { name: "Undo" })).toBeHidden();
  expect(await editor.inputValue()).toBe("User-agent: *\nDisallow: /private/");
});

test("a single Fix This shows a diff for just that issue", async ({ page }) => {
  await page.goto("/validate");
  await expect(page.getByTestId("issue-list").getByText("Sitemap uses HTTP")).toBeVisible();
  await page
    .getByRole("button", { name: /Fix this/ })
    .first()
    .click();
  await expect(page.getByText("Before / After")).toBeVisible();
});
