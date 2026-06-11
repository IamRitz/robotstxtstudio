import { expect, test } from "@playwright/test";
import { ANALYSIS_REPORT } from "./fixtures";

// Phase 17D — shared workspace. ONE working robots.txt follows the user across
// Analyze, Validate, AI Manager, and Generator: no copy/paste, no handoff clicks.

test("the working file follows you: Analyze → Validate → AI Manager → Generator", async ({
  page,
}) => {
  await page.route("**/api/analyze", (route) => route.fulfill({ json: ANALYSIS_REPORT }));
  await page.goto("/analyze?domain=example.com&fresh=1");

  // Fix Crawl-delay: 0 in the Analyzer — this edit must travel.
  await page.getByRole("button", { name: /Fix \d+ safe/ }).click();

  // Validator: opens the SAME file, fix included, no paste.
  await page.goto("/validate");
  await expect(page.getByTestId("workspace-bar")).toContainText("example.com");
  const editor = page.getByRole("textbox", { name: "robots.txt" });
  await expect(editor).toHaveValue(/Disallow: \/admin\//);
  await expect(editor).not.toHaveValue(/Crawl-delay: 0/);

  // AI Manager: toggles seeded from the file — GPTBot reads as blocked.
  await page.goto("/ai-crawlers");
  await expect(page.getByTestId("workspace-bar")).toContainText("example.com");
  await expect(page.getByRole("switch", { name: "Allow GPTBot" })).not.toBeChecked();

  // Generator: controls seeded from the file — the /admin/ disallow is loaded.
  await page.goto("/generate");
  await expect(page.getByTestId("workspace-bar")).toContainText("example.com");
  await expect(page.getByRole("switch", { name: "Allow GPTBot" })).not.toBeChecked();
  await expect(page.getByText("/admin/", { exact: true })).toBeVisible();
});

test("edits in Validate reach the Manager; Manager apply flows back to Validate", async ({
  page,
}) => {
  // Start by pasting a file in the Validator (no Analyzer involved).
  await page.goto("/validate");
  const editor = page.getByRole("textbox", { name: "robots.txt" });
  await editor.fill("User-agent: *\nDisallow: /private/\n\nUser-agent: GPTBot\nDisallow: /");

  // Manager: seeded from the pasted file.
  await page.goto("/ai-crawlers");
  await expect(page.getByTestId("workspace-bar")).toContainText("untitled robots.txt");
  await expect(page.getByRole("switch", { name: "Allow GPTBot" })).not.toBeChecked();

  // Block ClaudeBot, then commit the change to the working file (previewed apply).
  await page.getByRole("switch", { name: "Allow ClaudeBot" }).click();
  await page.getByText("Preview the change").click();
  await expect(page.getByText("Before / After")).toBeVisible();
  await page.getByRole("button", { name: "Apply to working file" }).click();
  // After one explicit apply the manager live-syncs (17E).
  await expect(
    page.getByText("Live-syncing — every change here updates the working file."),
  ).toBeVisible();

  // Live-sync: a further toggle updates the workspace WITHOUT a second apply.
  await page.getByRole("switch", { name: "Allow CCBot" }).click();

  // Validator: shows the regenerated file with ALL THREE decisions.
  await page.goto("/validate");
  const after = await page.getByRole("textbox", { name: "robots.txt" }).inputValue();
  expect(after).toContain("User-agent: ClaudeBot");
  expect(after).toContain("User-agent: GPTBot");
  expect(after).toContain("User-agent: CCBot");
  expect(after).toContain("Disallow: /private/");
});

test("discarding the working file confirms, then returns tools to their defaults", async ({
  page,
}) => {
  await page.goto("/validate");
  await page.getByRole("textbox", { name: "robots.txt" }).fill("User-agent: GPTBot\nDisallow: /");
  await expect(page.getByTestId("workspace-bar")).toBeVisible();

  // 17F.3: cancelling the confirmation keeps the workspace untouched.
  page.once("dialog", (d) => void d.dismiss());
  await page.getByRole("button", { name: "Discard working file" }).click();
  await expect(page.getByTestId("workspace-bar")).toBeVisible();

  // Accepting discards for real.
  page.once("dialog", (d) => void d.accept());
  await page.getByRole("button", { name: "Discard working file" }).click();
  await expect(page.getByTestId("workspace-bar")).toBeHidden();
  // Back to the sample.
  await expect(page.getByRole("textbox", { name: "robots.txt" })).toHaveValue(/Crawl-delay: 0/);

  // And the Manager starts clean again (groups collapsed by default — 17E).
  await page.goto("/ai-crawlers");
  await expect(page.getByTestId("workspace-bar")).toBeHidden();
  await page.getByRole("button", { name: "Expand all" }).click();
  await expect(page.getByRole("switch", { name: "Allow GPTBot" })).toBeChecked();
});

// Phase 17F — visibility & navigation refinements.

test("workspace bar shows provenance and the recent-fix receipts (17F.1)", async ({ page }) => {
  await page.route("**/api/analyze", (route) => route.fulfill({ json: ANALYSIS_REPORT }));
  await page.goto("/analyze?domain=example.com&fresh=1");
  await page.getByRole("button", { name: /Fix \d+ safe/ }).click();

  await page.goto("/validate");
  const bar = page.getByTestId("workspace-bar");
  await expect(bar).toContainText("Working file: example.com");
  await expect(bar).toContainText("last changed in Analyzer");
  await bar.getByText(/Recent changes/).click();
  await expect(bar.getByText("Fixed: Crawl-delay: 0 (no-op)")).toBeVisible();
});

test("smart deep link lands on the exact crawler (17F.2)", async ({ page }) => {
  await page.route("**/api/analyze", (route) => route.fulfill({ json: ANALYSIS_REPORT }));
  await page.goto("/analyze?domain=example.com&fresh=1");

  const link = page
    .getByTestId("issue-list")
    .getByRole("link", { name: "Open AI Manager → ClaudeBot" });
  await expect(link).toBeVisible();
  await link.click();

  await expect(page).toHaveURL(/\/ai-crawlers\?focus=claudebot/);
  // Landed: the group is expanded and the exact toggle is on screen.
  await expect(page.getByRole("switch", { name: "Allow ClaudeBot" })).toBeInViewport();
});

test("homepage resume strip restores the active workspace (17F.5)", async ({ page }) => {
  await page.goto("/validate");
  await page.getByRole("textbox", { name: "robots.txt" }).fill("User-agent: GPTBot\nDisallow: /");

  await page.goto("/");
  const strip = page.getByTestId("workspace-resume");
  await expect(strip).toContainText("Continue working on untitled robots.txt");
  await expect(strip).toContainText("Last changed in Validate");
  await strip.getByRole("link", { name: /Resume/ }).click();

  await expect(page).toHaveURL(/\/validate/);
  await expect(page.getByRole("textbox", { name: "robots.txt" })).toHaveValue(
    "User-agent: GPTBot\nDisallow: /",
  );
});
