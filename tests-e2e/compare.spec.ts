import { expect, test } from "@playwright/test";

// Phase 15C.3 — Compare.
test("compare two robots.txt and see score, AI visibility, and findings deltas", async ({
  page,
}) => {
  await page.goto("/compare");

  // Default samples (A allows all AI, B blocks several AI crawlers) → a real comparison.
  await expect(page.getByText("Score changes (A → B)")).toBeVisible();
  await expect(page.getByText("AI crawler visibility (A → B)")).toBeVisible();
  await expect(page.getByText("File diff")).toBeVisible();

  // GPTBot flips allowed → blocked between A and B (the AI-visibility row).
  await expect(page.getByText("GPTBot", { exact: true })).toBeVisible();

  // Editing side A to match B collapses the comparison to "identical".
  const a = page.getByRole("textbox", { name: "Site A robots.txt" });
  const b = page.getByRole("textbox", { name: "Site B robots.txt" });
  await a.fill(await b.inputValue());
  await expect(page.getByText("The two files are identical")).toBeVisible();
});
