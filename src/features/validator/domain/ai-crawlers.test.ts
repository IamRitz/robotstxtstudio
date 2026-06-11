import { describe, expect, it } from "vitest";
import { parseRobots } from "@/parser";
import { getAiCrawlerStatuses } from "./ai-crawlers";

/** Map crawler id → status for terse assertions. */
function statusMap(text: string): Record<string, string> {
  return Object.fromEntries(
    getAiCrawlerStatuses(parseRobots(text)).map((s) => [s.crawler.id, s.status]),
  );
}

describe("getAiCrawlerStatuses", () => {
  it("marks crawlers missing when there is no default group", () => {
    const map = statusMap("User-agent: Googlebot\nDisallow: /x");
    expect(map["gptbot"]).toBe("missing");
    expect(map["claudebot"]).toBe("missing");
  });

  it("marks crawlers inherited when only a wildcard group exists", () => {
    const map = statusMap("User-agent: *\nDisallow: /admin/");
    expect(Object.values(map).every((s) => s === "inherited")).toBe(true);
  });

  it("marks a crawler explicit when it has its own group (case-insensitive)", () => {
    const map = statusMap("User-agent: *\nDisallow: /\nUser-agent: gptbot\nDisallow: /private/");
    expect(map["gptbot"]).toBe("explicit");
    expect(map["claudebot"]).toBe("inherited");
  });

  it("covers all five major AI crawlers", () => {
    expect(Object.keys(statusMap(""))).toEqual([
      "gptbot",
      "claudebot",
      "perplexitybot",
      "ccbot",
      "google-extended",
    ]);
  });
});
