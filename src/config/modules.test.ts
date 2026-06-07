import { describe, expect, it } from "vitest";
import { MODULES } from "./modules";

describe("module registry", () => {
  it("defines all six product modules", () => {
    expect(MODULES).toHaveLength(6);
  });

  it("has unique module ids", () => {
    const ids = MODULES.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every module a label and tagline", () => {
    for (const mod of MODULES) {
      expect(mod.label.length).toBeGreaterThan(0);
      expect(mod.tagline.length).toBeGreaterThan(0);
    }
  });
});
