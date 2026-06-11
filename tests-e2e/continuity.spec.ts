import { expect, test } from "@playwright/test";
import { ANALYSIS_REPORT } from "./fixtures";

// Phase 17C — session continuity. Analyses snapshot to localStorage; the homepage
// becomes a dashboard and the Analyzer restores from the snapshot on navigation,
// refresh, and Back — never refetching unless explicitly asked (?fresh=1 / submit).

test("homepage Continue restores the analysis without refetching", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/analyze", async (route) => {
    calls++;
    await route.fulfill({ json: ANALYSIS_REPORT });
  });

  await page.goto("/analyze?domain=example.com&fresh=1");
  await expect(page.getByTestId("score-current")).toBeVisible();
  expect(calls).toBe(1);

  // The homepage now shows the dashboard instead of the locked teaser.
  await page.goto("/");
  const dash = page.getByTestId("continue-working");
  await expect(dash.getByText("example.com")).toBeVisible();
  await dash
    .getByRole("link", { name: /Continue/ })
    .first()
    .click();

  // Full report restored from the local snapshot — zero network.
  await expect(page).toHaveURL(/\/analyze\?domain=example\.com/);
  await expect(page.getByTestId("score-current")).toBeVisible();
  await expect(page.getByTestId("issue-list").getByText("No sitemap declared")).toBeVisible();
  expect(calls).toBe(1);
});

test("refresh and Back keep the workspace, including applied fixes", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/analyze", async (route) => {
    calls++;
    await route.fulfill({ json: ANALYSIS_REPORT });
  });

  await page.goto("/analyze?domain=example.com&fresh=1");
  await page.getByRole("button", { name: /Fix \d+ safe/ }).click();
  await expect(page.getByText(/^The file — with your fixes applied/)).toBeVisible();

  // Refresh: the URL was canonicalized after the fetch (fresh=1 dropped), so a
  // reload restores the working copy — fix intact, no second fetch.
  await page.reload();
  await page.getByText(/^The file — with your fixes applied/).click();
  const fileView = page.getByRole("textbox", { name: "robots.txt (read-only)" });
  await expect(fileView).toBeVisible();
  await expect(fileView).not.toHaveValue(/Crawl-delay: 0/);
  expect(calls).toBe(1);

  // Back from another route lands on the restored workspace, not a blank screen.
  await page.goto("/");
  await page.goBack();
  await expect(page.getByTestId("score-current")).toBeVisible();
  await expect(page.getByText(/^The file — with your fixes applied/)).toBeVisible();
  expect(calls).toBe(1);
});

test("clear history removes the archive but keeps the active workspace strip", async ({ page }) => {
  await page.route("**/api/analyze", (route) => route.fulfill({ json: ANALYSIS_REPORT }));
  await page.goto("/analyze?domain=example.com&fresh=1");
  await expect(page.getByTestId("score-current")).toBeVisible();

  await page.goto("/");
  await expect(page.getByTestId("continue-working")).toBeVisible();
  await page.getByRole("button", { name: "Clear history" }).click();
  // History ≠ workspace (17F.5): the archive list goes, active work stays.
  await expect(page.getByTestId("continue-working")).toBeHidden();
  await expect(page.getByTestId("workspace-resume")).toBeVisible();
});
