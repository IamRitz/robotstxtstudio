import { describe, expect, it } from "vitest";
import { toRobotsUrl } from "./url";

describe("toRobotsUrl", () => {
  it("derives /robots.txt from a bare domain", () => {
    expect(toRobotsUrl("example.com")).toEqual({
      robotsUrl: "https://example.com/robots.txt",
      domain: "example.com",
    });
  });

  it("derives /robots.txt from a full URL with a path", () => {
    expect(toRobotsUrl("https://shop.example.com/products/123")).toEqual({
      robotsUrl: "https://shop.example.com/robots.txt",
      domain: "shop.example.com",
    });
  });

  it("rejects invalid hosts", () => {
    expect(toRobotsUrl("not a domain")).toBeNull();
    expect(toRobotsUrl("localhost")).toBeNull();
    expect(toRobotsUrl("")).toBeNull();
  });
});
