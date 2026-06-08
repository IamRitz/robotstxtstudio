import { describe, expect, it } from "vitest";
import { tokenize } from "./tokenizer";

describe("tokenize", () => {
  it("returns no tokens for an empty file", () => {
    expect(tokenize("")).toEqual([]);
  });

  it("classifies blank, comment, and field lines with 1-based line numbers", () => {
    const tokens = tokenize("# hello\n\nUser-agent: *");
    expect(tokens.map((t) => [t.kind, t.line])).toEqual([
      ["comment", 1],
      ["blank", 2],
      ["field", 3],
    ]);
  });

  it("normalizes field names case-insensitively and via aliases", () => {
    const [a, b, c] = tokenize("USER-AGENT: Googlebot\nUserAgent: Bingbot\nCrawlDelay: 5");
    expect(a).toMatchObject({ kind: "field", field: "user-agent", value: "Googlebot" });
    expect(b).toMatchObject({ kind: "field", field: "user-agent", value: "Bingbot" });
    expect(c).toMatchObject({ kind: "field", field: "crawl-delay", value: "5" });
  });

  it("preserves original value casing and only splits on the first colon", () => {
    const [t] = tokenize("Sitemap: https://Example.com/sitemap.xml");
    expect(t).toMatchObject({ field: "sitemap", value: "https://Example.com/sitemap.xml" });
  });

  it("strips inline comments from the value but keeps them on the token", () => {
    const [t] = tokenize("Disallow: /admin/ # internal only");
    expect(t).toMatchObject({
      kind: "field",
      field: "disallow",
      value: "/admin/",
      inlineComment: "internal only",
    });
  });

  it("marks unsupported directives (with colon) as unknown, preserving the name", () => {
    const [t] = tokenize("Clean-param: ref /article");
    expect(t).toMatchObject({ kind: "unknown", hasColon: true, name: "Clean-param" });
  });

  it("marks lines without a colon as unknown", () => {
    const [t] = tokenize("this is not valid");
    expect(t).toMatchObject({ kind: "unknown", hasColon: false });
  });

  it("handles a UTF-8 BOM and CRLF/CR line endings", () => {
    const tokens = tokenize("﻿User-agent: *\r\nDisallow: /\rAllow: /public");
    expect(tokens.map((t) => t.kind)).toEqual(["field", "field", "field"]);
    expect(tokens[0]).toMatchObject({ field: "user-agent" });
  });

  it("keeps an empty directive value (e.g. `Disallow:`)", () => {
    const [t] = tokenize("Disallow:");
    expect(t).toMatchObject({ kind: "field", field: "disallow", value: "" });
  });
});
