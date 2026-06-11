// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearWorkspace,
  getWorkspace,
  isWorkspaceDirty,
  setWorkspace,
  updateWorkspaceText,
  workspaceLabel,
} from "./workspace";

beforeEach(() => {
  localStorage.clear();
});

describe("workspace store", () => {
  it("round-trips a workspace and stamps updatedAt", () => {
    setWorkspace({
      domain: "example.com",
      originalText: "a",
      text: "a",
      appliedFixes: [],
      source: "analyzer",
    });
    const ws = getWorkspace();
    expect(ws?.domain).toBe("example.com");
    expect(ws?.source).toBe("analyzer");
    expect(Date.parse(ws!.updatedAt)).not.toBeNaN();
  });

  it("updateWorkspaceText creates a workspace when none exists", () => {
    updateWorkspaceText("User-agent: *", "validator");
    const ws = getWorkspace();
    expect(ws?.text).toBe("User-agent: *");
    expect(ws?.originalText).toBe("User-agent: *");
    expect(ws?.domain).toBeUndefined();
    expect(isWorkspaceDirty(ws)).toBe(false);
  });

  it("updateWorkspaceText preserves origin and accumulates the fix log", () => {
    setWorkspace({
      domain: "example.com",
      originalText: "v1",
      text: "v1",
      appliedFixes: [],
      source: "analyzer",
    });
    updateWorkspaceText("v2", "validator", ["crawl-delay-zero"]);
    updateWorkspaceText("v3", "validator", ["sitemap-not-https"]);
    const ws = getWorkspace();
    expect(ws?.domain).toBe("example.com");
    expect(ws?.originalText).toBe("v1");
    expect(ws?.text).toBe("v3");
    expect(ws?.appliedFixes).toEqual(["crawl-delay-zero", "sitemap-not-https"]);
    expect(ws?.source).toBe("validator");
    expect(isWorkspaceDirty(ws)).toBe(true);
  });

  it("clear and corrupt storage behave safely", () => {
    localStorage.setItem("rs:workspace:v1", "{nope");
    expect(getWorkspace()).toBeNull();
    updateWorkspaceText("x", "generator");
    clearWorkspace();
    expect(getWorkspace()).toBeNull();
    expect(isWorkspaceDirty(null)).toBe(false);
  });

  it("labels named and untitled workspaces", () => {
    setWorkspace({
      domain: "a.com",
      originalText: "",
      text: "",
      appliedFixes: [],
      source: "analyzer",
    });
    expect(workspaceLabel(getWorkspace()!)).toBe("a.com");
    setWorkspace({ originalText: "", text: "", appliedFixes: [], source: "validator" });
    expect(workspaceLabel(getWorkspace()!)).toBe("untitled robots.txt");
  });
});
