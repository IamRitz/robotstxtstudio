import { describe, expect, it } from "vitest";
import { SCORE_THRESHOLDS, scoreBand } from "./score";

describe("scoreBand", () => {
  it("maps the documented gauge thresholds (80 / 60)", () => {
    expect(scoreBand(100)).toBe("good");
    expect(scoreBand(80)).toBe("good");
    expect(scoreBand(79)).toBe("moderate");
    expect(scoreBand(60)).toBe("moderate");
    expect(scoreBand(59)).toBe("poor");
    expect(scoreBand(0)).toBe("poor");
  });

  it("clamps out-of-range values to the nearest band", () => {
    expect(scoreBand(150)).toBe("good");
    expect(scoreBand(-10)).toBe("poor");
  });

  it("thresholds are internally consistent (good > moderate > poor)", () => {
    expect(SCORE_THRESHOLDS.good).toBeGreaterThan(SCORE_THRESHOLDS.moderate);
    expect(SCORE_THRESHOLDS.moderate).toBeGreaterThan(SCORE_THRESHOLDS.poor);
  });
});
