import { describe, expect, it } from "vitest";
import { parseRobots } from "@/parser";
import { testUrl } from "@/features/tester";
import { validateRobots } from "@/features/validator";
import { ANALYZER_GUIDE, GENERATOR_GUIDE, TESTER_GUIDE, VALIDATOR_GUIDE } from "./tool-guides";

const GUIDES = { VALIDATOR_GUIDE, TESTER_GUIDE, GENERATOR_GUIDE, ANALYZER_GUIDE };

describe("tool guide worked examples are true for the real engines", () => {
  for (const ex of TESTER_GUIDE.traces ?? []) {
    it(`trace: ${ex.title}`, () => {
      const result = testUrl(parseRobots(ex.robots), ex.url, ex.agent);
      expect(result.decision).toBe(ex.expected);
      if (ex.decidedBy === null) {
        expect(result.matchedRule).toBeUndefined();
      } else {
        expect(result.matchedRule?.raw.trim()).toBe(ex.decidedBy);
      }
    });
  }

  for (const ex of VALIDATOR_GUIDE.findings ?? []) {
    it(`finding: ${ex.title}`, () => {
      const codes = validateRobots(parseRobots(ex.robots)).issues.map((i) => i.code);
      expect(codes).toContain(ex.code);
    });
  }
});

describe("tool guide content", () => {
  it.each(Object.entries(GUIDES))("%s has FAQs, sources, and internal next steps", (_, guide) => {
    expect(guide.faqs.length).toBeGreaterThan(0);
    expect(guide.sources.every((s) => s.href.startsWith("https://"))).toBe(true);
    expect(guide.next.every((n) => n.href.startsWith("/"))).toBe(true);
    expect(new Set(guide.sections.map((s) => s.id)).size).toBe(guide.sections.length);
  });
});
