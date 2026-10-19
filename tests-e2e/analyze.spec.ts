import { expect, test } from "@playwright/test";
import { ANALYSIS_REPORT, UNVERIFIED_REPORT } from "./fixtures";

// Journey 1 — Analyze Website (network mocked at the API boundary).
test("analyze a website and view the report", async ({ page }) => {
  await page.route("**/api/analyze", async (route) => {
    await new Promise((r) => setTimeout(r, 300)); // observable loading state
    await route.fulfill({ json: ANALYSIS_REPORT });
  });

  // Start from Home → enter domain → Analyze.
  await page.goto("/");
  await page.getByLabel("Your website domain").fill("example.com");
  await page.getByRole("button", { name: "Analyze My Site" }).click();

  await expect(page).toHaveURL(/\/analyze\?domain=example\.com/);

  // Report renders, recomputed live from the fetched file (Phase 17A workspace).
  await expect(page.getByTestId("score-current")).toBeVisible(); // verdict band (visibility NOW → POTENTIAL)
  // Access matrix (17B.1): named verdicts — the fixture blocks GPTBot.
  const matrix = page.getByTestId("access-matrix");
  await expect(matrix.getByText("Who can see example.com")).toBeVisible();
  await expect(matrix.getByText("GPTBot").first()).toBeVisible(); // blocked-bot chip
  await expect(matrix.getByText("1 blocked").first()).toBeVisible();
  const queue = page.getByTestId("issue-list"); // the single ranked Action Queue
  await expect(queue.getByText("No sitemap declared")).toBeVisible(); // finding
  await expect(queue.getByText("ClaudeBot inherits the default rules")).toBeVisible(); // advisory (deep-link row)
  await expect(queue.getByRole("link", { name: /Open AI Manager/ }).first()).toBeVisible();
  // Analyzer can produce a corrected file (the "finish here" workflow).
  await expect(
    page.getByRole("button", { name: "Download robots.txt", exact: true }),
  ).toBeVisible();
  // Read-only file view (17B.2): the exact fetched text, visible but not editable.
  await page.getByText(/^The file — as served/).click();
  const fileView = page.getByRole("textbox", { name: "robots.txt (read-only)" });
  await expect(fileView).toBeVisible();
  await expect(fileView).toHaveValue(ANALYSIS_REPORT.file.source);
  await expect(fileView).toHaveJSProperty("readOnly", true);
});

test("analyze shows a loading state while fetching", async ({ page }) => {
  await page.route("**/api/analyze", async (route) => {
    await new Promise((r) => setTimeout(r, 600));
    await route.fulfill({ json: ANALYSIS_REPORT });
  });
  await page.goto("/analyze?domain=example.com");
  await expect(page.getByRole("button", { name: /Analyzing/ })).toBeVisible();
});

// A failed fetch is "policy unknown" — never a 100/100 allow-all report.
test("a failed fetch shows policy unknown with no score", async ({ page }) => {
  await page.route("**/api/analyze", (route) => route.fulfill({ json: UNVERIFIED_REPORT }));
  await page.goto("/analyze?domain=down.example&fresh=1");
  const notice = page.getByTestId("policy-unverified");
  await expect(notice).toBeVisible();
  await expect(notice.getByText(/Policy unknown/)).toBeVisible();
  await expect(notice.getByText(/not the same as having no robots\.txt/)).toBeVisible();
  await expect(page.getByTestId("score-current")).toHaveCount(0);
  await expect(page.getByTestId("access-matrix")).toHaveCount(0);
  await expect(notice.getByRole("link", { name: /Validator/ })).toHaveAttribute(
    "href",
    "/validate",
  );
});

test("the verdict band scores search visibility and states AI policy separately", async ({
  page,
}) => {
  await page.route("**/api/analyze", (route) => route.fulfill({ json: ANALYSIS_REPORT }));
  await page.goto("/analyze?domain=example.com&fresh=1");
  await expect(page.getByText("Search visibility", { exact: true })).toBeVisible();
  await expect(page.getByText("(your policy — not scored)")).toBeVisible();
});
