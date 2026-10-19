import { expect, test } from "@playwright/test";

// SEO recovery (2026-10): consolidated URLs land on the canonical page, and the
// canonical tool pages explain themselves in server-rendered HTML.
const CONSOLIDATED: ReadonlyArray<[string, string, RegExp]> = [
  ["/robots-txt-validator", "/validate", /Robots\.txt Validator/],
  ["/robots-txt-checker", "/validate", /Robots\.txt Validator/],
  ["/robots-txt-tester", "/url-tester", /Robots\.txt Tester/],
  ["/robots-txt-generator", "/generate", /Robots\.txt Generator/],
  ["/robots-txt-format", "/robots-txt-syntax", /robots\.txt Syntax/],
  ["/robots-txt-file", "/what-is-robots-txt", /What Is robots\.txt/],
];

for (const [from, to, h1] of CONSOLIDATED) {
  test(`${from} permanently redirects to ${to}`, async ({ page, request }) => {
    const res = await request.get(from, { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(new URL(res.headers()["location"]!, "http://x").pathname).toBe(to);
    await page.goto(from);
    await expect(page).toHaveURL(new RegExp(`${to}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
  });
}

test("tool pages ship their guide and worked examples in the initial HTML", async ({ request }) => {
  const html = await (await request.get("/url-tester")).text();
  expect(html).toContain("How the URL tester decides allowed or blocked");
  expect(html).toContain("A crawler-specific group replaces the * group entirely");
  const head = html.slice(0, html.indexOf("</head>"));
  expect(head).toContain('rel="canonical" href="https://robotstxtstudio.com/url-tester"');
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const path of ["/", "/validate", "/url-tester", "/analyze"]) {
    test(`${path} has no horizontal overflow at phone width`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }

  test("validator first action works on a phone", async ({ page }) => {
    await page.goto("/validate");
    await expect(
      page.getByRole("heading", { level: 1, name: "Robots.txt Validator" }),
    ).toBeVisible();
    await expect(page.getByText(/Issues/).first()).toBeVisible();
  });
});
