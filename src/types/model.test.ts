import { describe, expect, it } from "vitest";
import { CRAWLER_CATEGORIES } from "./crawler";
import { STARTER_TEMPLATES } from "./generator";
import { WILDCARD_USER_AGENT } from "./robots";
import { SEVERITY_ORDER, compareSeverity } from "./validation";

describe("model vocabulary invariants", () => {
  it("crawler categories are unique and cover the seven design groups", () => {
    expect(new Set(CRAWLER_CATEGORIES).size).toBe(CRAWLER_CATEGORIES.length);
    expect(CRAWLER_CATEGORIES).toHaveLength(7);
  });

  it("starter templates are unique and match the approved design set", () => {
    expect(new Set(STARTER_TEMPLATES).size).toBe(STARTER_TEMPLATES.length);
    expect(STARTER_TEMPLATES).toEqual(["blog", "saas", "ecommerce", "publisher", "documentation"]);
  });

  it("wildcard user-agent is '*'", () => {
    expect(WILDCARD_USER_AGENT).toBe("*");
  });
});

describe("compareSeverity", () => {
  it("orders error before warning before info", () => {
    expect(SEVERITY_ORDER).toEqual(["error", "warning", "info"]);
    expect(compareSeverity("error", "warning")).toBeLessThan(0);
    expect(compareSeverity("warning", "info")).toBeLessThan(0);
    expect(compareSeverity("info", "error")).toBeGreaterThan(0);
    expect(compareSeverity("warning", "warning")).toBe(0);
  });

  it("sorts a mixed list most-serious first", () => {
    const sorted = ["info", "error", "warning", "info", "error"].sort(
      (a, b) => compareSeverity(a as never, b as never),
    );
    expect(sorted).toEqual(["error", "error", "warning", "info", "info"]);
  });
});
