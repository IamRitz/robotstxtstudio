import { describe, expect, it } from "vitest";
import { parseRobots } from "@/parser";
import { explainGroup } from "./group-explainer";

const group = (text: string) => parseRobots(text).groups[0]!;

describe("explainGroup", () => {
  it("summarizes a full block", () => {
    const e = explainGroup(group("User-agent: *\nDisallow: /"));
    expect(e.access).toBe("blocked");
    expect(e.summary).toBe("all crawlers are blocked from your entire site.");
    expect(e.bullets).toContain("Blocked from your entire site (/).");
  });

  it("summarizes a block with allow exceptions", () => {
    const e = explainGroup(group("User-agent: *\nDisallow: /\nAllow: /public/"));
    expect(e.access).toBe("partial");
    expect(e.summary).toContain("except: /public/");
  });

  it("describes empty and root allow rules", () => {
    const e = explainGroup(group("User-agent: *\nDisallow:\nAllow: /"));
    expect(e.bullets).toContain("An empty Disallow places no restrictions (everything is allowed).");
    expect(e.bullets).toContain("Explicitly allowed to access your entire site (/).");
  });

  it("uses singular phrasing for a 1-second crawl-delay", () => {
    const e = explainGroup(group("User-agent: Bingbot\nCrawl-delay: 1\nDisallow: /x"));
    expect(e.bullets).toContain("Asked to wait 1 second between requests.");
  });

  it("notes a zero crawl-delay has no effect", () => {
    const e = explainGroup(group("User-agent: Bingbot\nCrawl-delay: 0\nDisallow: /x"));
    expect(e.bullets).toContain("A Crawl-delay of 0 is set, which has no effect.");
  });

  it("names known crawlers in the summary", () => {
    const e = explainGroup(group("User-agent: Googlebot\nDisallow: /admin/"));
    expect(e.summary).toContain("Google's Googlebot");
  });
});
