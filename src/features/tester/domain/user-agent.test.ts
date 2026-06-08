import { describe, expect, it } from "vitest";
import { parseRobots } from "@/parser";
import { selectRules } from "./user-agent";

const select = (text: string, ua: string) => selectRules(parseRobots(text), ua);

describe("selectRules", () => {
  const file = "User-agent: *\nDisallow: /a\n\nUser-agent: Googlebot\nDisallow: /b";

  it("prefers the most specific matching group", () => {
    const sel = select(file, "Googlebot");
    expect(sel.source).toBe("specific");
    expect(sel.matchedUserAgent).toBe("Googlebot");
    expect(sel.rules.map((r) => r.path)).toEqual(["/b"]);
  });

  it("falls back to the default (*) group", () => {
    const sel = select(file, "Bingbot");
    expect(sel.source).toBe("default");
    expect(sel.rules.map((r) => r.path)).toEqual(["/a"]);
  });

  it("returns source 'none' when nothing matches and there is no default", () => {
    const sel = select("User-agent: Googlebot\nDisallow: /b", "Bingbot");
    expect(sel.source).toBe("none");
    expect(sel.rules).toEqual([]);
  });

  it("matches case-insensitively and by prefix", () => {
    expect(select(file, "googlebot").source).toBe("specific");
    expect(select(file, "Googlebot-Image").source).toBe("specific");
  });

  it("merges rules from repeated user-agent groups", () => {
    const sel = select("User-agent: GPTBot\nDisallow: /a\n\nUser-agent: GPTBot\nDisallow: /b", "GPTBot");
    expect(sel.rules.map((r) => r.path).sort()).toEqual(["/a", "/b"]);
  });

  it("uses the longer token when several prefixes match", () => {
    const sel = select("User-agent: Google\nDisallow: /x\n\nUser-agent: Googlebot\nDisallow: /y", "Googlebot-News");
    expect(sel.matchedUserAgent).toBe("Googlebot");
    expect(sel.rules.map((r) => r.path)).toEqual(["/y"]);
  });
});
