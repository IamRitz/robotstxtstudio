import { describe, expect, it } from "vitest";
import { WHY_IT_MATTERS, whyItMatters } from "./why";
import { DEDUCTIONS } from "./audit";
import type { ValidationCode } from "@/types";

describe("whyItMatters", () => {
  it("has a non-trivial explanation for every code", () => {
    for (const [code, text] of Object.entries(WHY_IT_MATTERS)) {
      expect(text.length, code).toBeGreaterThan(40); // a real sentence, not a stub
      expect(text.trim(), code).toBe(text);
    }
  });

  it("covers every code the scoring model knows about", () => {
    for (const code of Object.keys(DEDUCTIONS) as ValidationCode[]) {
      expect(whyItMatters(code), code).toBeTruthy();
    }
  });
});
